import asyncio
from modules.vocalize.async_edgetts import textToSpeechBytes, AudioPlayer

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

def textToAudioPrint(*args, **kwargs):
    string = " ".join([str(x) for x in args])

    print(f"{string = }")
    
    historyDb.addMessage(
        role = Role.assistant.value,
        content = string
    )

    print(f"{string = }")
    audioPlayer.play(
        asyncio.run(
            textToSpeechBytes(string)
        ),
    )
    while audioPlayer.isPlaying() and kwargs.get('block', False):
        time.sleep(0.1)

async def asyncTextToAudioPrint(*args, **kwargs):
    string = " ".join([str(x) for x in args])

    print(f"{string = }")
    
    historyDb.addMessage(
        role = Role.assistant.value,
        content = string
    )

    print(f"{string = }")
    audioPlayer.play(await textToSpeechBytes(string))
    
    while audioPlayer.isPlaying() and kwargs.get('block', False):
        time.sleep(0.1)

def vocalizeInput(prompt: Optional[str] = "", ignoreThreshold: float = 0.3) -> str:
    if prompt:
        textToAudioPrint(prompt, block=True)
    SR_QUEUE.clear()
    try:
        SR_QUEUE.get(timeout=ignoreThreshold)
    except:
        pass
    
    recordedAudio: str = SR_QUEUE.get()
    historyDb.addMessage(
        role = Role.user.value,
        content = recordedAudio
    )
    return recordedAudio

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
    asyncio.run(main())