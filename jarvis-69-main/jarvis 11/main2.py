import sys
import asyncio
from modules.vocalize.async_edgetts import textToSpeechBytes, AudioPlayer
from modules.speech_to_text import listen

IMPORTS_SOUND = r"data\audio\imports.wav"
AFTER_IMPORTS_SOUND = r"data\audio\after_imports.wav"

audioPlayer = AudioPlayer()
audioPlayer.setVolume(0.2)
audioPlayer.play(open(IMPORTS_SOUND, 'rb').read())

import subprocess
from modules.sqlqueue import SqlQueue

import time
from util.jarvis.main import process, JFunction
from modules.prompt.base import Role
from typing import Optional

# Assuming codeBrew and historyDb are defined in util.jarvis.main
from util.jarvis.main import codeBrew, historyDb

audioPlayer.play(open(AFTER_IMPORTS_SOUND, 'rb').read())
audioPlayer.setVolume(1)


def textToAudioPrint(*args, **kwargs):
    string = " ".join([str(x) for x in args])

    print(f"{string = }")

    historyDb.addMessage(
        role=Role.assistant.value,
        content=string
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
        role=Role.assistant.value,
        content=string
    )

    print(f"{string = }")
    audioPlayer.play(await textToSpeechBytes(string))

    while audioPlayer.isPlaying() and kwargs.get('block', False):
        time.sleep(0.1)


# Override print function
codeBrew.print = textToAudioPrint


async def jFunctionEval(jFunctions: list[JFunction]) -> list[str | None]:
    taskList = []
    for jFunction in jFunctions:
        taskList.append(asyncio.to_thread(jFunction.function))
    return await asyncio.gather(*taskList)


async def main():
    audioPlayer.play(await textToSpeechBytes("Jarvis Online!, Hello. How can I help you?"))
    while True:
        # Use the speech-to-text feature here
        print("Listening for your command...")
        query = listen()
        if query:
            print(f"You said: {query}")
        else:
            print("No input detected. Please try again.")
            continue

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

        while audioPlayer.isPlaying():  # Wait for audio to finish playing by CodeBrew
            await asyncio.sleep(0.1)
        await asyncTextToAudioPrint(*strOnlyDmmResult, block=True)


if __name__ == "__main__":
    asyncio.run(main())