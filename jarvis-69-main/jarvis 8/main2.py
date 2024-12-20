import asyncio
from modules.vocalize.async_edgetts import textToSpeechBytes, AudioPlayer
from modules.speech_to_text import listen, driver

IMPORTS_SOUND = r"data\audio\imports.wav"
AFTER_IMPORTS_SOUND = r"data\audio\after_imports.wav"


audioPlayer = AudioPlayer()
audioPlayer.play(open(IMPORTS_SOUND, 'rb').read())
audioPlayer.setVolume(0.2)

import subprocess
from modules.sqlqueue import SqlQueue

SR = "async_js_sr"
SR_DATABASE = rf"data\tmp\{SR}.queue.db"
SR_PROCESS = subprocess.Popen(["py", r"-3.10", f"modules/vocalize/{SR}.py"])
SR_QUEUE = SqlQueue(SR_DATABASE)

import time
from util.jarvis.main import process, JFunction, codeBrew, historyDb
from modules.prompt.base import Role
from typing import Optional, List, Dict, Any

audioPlayer.play(open(AFTER_IMPORTS_SOUND, 'rb').read())
audioPlayer.setVolume(0.2)


def stop_listening():
    """Stop the speech-to-text listener completely."""
    driver.quit()


def start_listening():
    """Restart the speech-to-text listener."""
    global driver
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options

    chrome_options = Options()
    chrome_options.add_argument("--use-fake-ui-for-media-stream")
    chrome_options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")
    chrome_options.add_argument("--headless=new")

    driver = webdriver.Chrome(options=chrome_options)


def textToAudioPrint(*args, **kwargs):
    string = " ".join([str(x) for x in args])

    print(f"{string = }")
    historyDb.addMessage(
        role=Role.assistant.value,
        content=string
    )

    stop_listening()  # Stop listening while Jarvis speaks
    audioPlayer.play(
        asyncio.run(
            textToSpeechBytes(string)
        ),
    )
    while audioPlayer.isPlaying() and kwargs.get('block', False):
        time.sleep(0.1)
    start_listening()  # Restart listening after Jarvis finishes speaking


async def asyncTextToAudioPrint(*args, **kwargs):
    string = " ".join([str(x) for x in args])

    print(f"{string = }")
    historyDb.addMessage(
        role=Role.assistant.value,
        content=string
    )

    stop_listening()  # Stop listening while Jarvis speaks
    audioPlayer.play(await textToSpeechBytes(string))
    while audioPlayer.isPlaying() and kwargs.get('block', False):
        time.sleep(0.1)
    start_listening()  # Restart listening after Jarvis finishes speaking


def vocalizeInput(prompt: Optional[str] = "", ignoreThreshold: float = 0.3) -> str:
    if prompt:
        textToAudioPrint(prompt, block=True)

    user_input = listen(prints=True)  # Capture user input
    historyDb.addMessage(
        role=Role.user.value,
        content=user_input
    )
    return user_input


# Override print function
codeBrew.print = textToAudioPrint
codeBrew.input = vocalizeInput


async def jFunctionEval(jFunctions: list[JFunction]) -> list[str | None]:
    taskList = []
    for jFunction in jFunctions:
        taskList.append(asyncio.to_thread(jFunction.function))
    return await asyncio.gather(*taskList)


async def main():
    audioPlayer.play(await textToSpeechBytes("Jarvis Online!, Hello. How can I help you?"))
    while True:
        query = vocalizeInput()
        result = await process(query)
        dmm = result['dmm']
        edmm = result['edmm']
        ndmm = result['ndmm']
        timeTaken = result['timeTaken']

        print(f"""{dmm = }\n{edmm = }\n{ndmm = }\n{timeTaken = }""")

        await asyncio.gather(
            jFunctionEval(ndmm),
            jFunctionEval(edmm)
        )

        dmmResult = await jFunctionEval(dmm)
        strOnlyDmmResult = list(filter(lambda x: isinstance(x, str), dmmResult))
        if len(strOnlyDmmResult) == 0:
            continue
        await asyncTextToAudioPrint(*strOnlyDmmResult, block=True)


if __name__ == "__main__":
    start_listening()  # Ensure the listener is ready
    asyncio.run(main())
