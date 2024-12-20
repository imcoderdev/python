import os
import sys
import asyncio
import logging
from dotenv import load_dotenv
from typing import Optional
from modules.sqlqueue import SqlQueue  # Ensure this is available
from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    LiveTranscriptionEvents,
    LiveOptions,
    Microphone
)
from pythonjsonlogger import jsonlogger
from rich.logging import RichHandler


# Load environment variables
load_dotenv()
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", None)
DEEPGRAM_MODEL = os.getenv("DEEPGRAM_MODEL", "nova-2")
SPEECHRECOGNITION_LANGUAGE = os.getenv("SPEECHRECOGNITION_LANGUAGE", "en-US")
TMP_DIR = os.getenv("TMP_DIR", "/tmp")
DATA_DIR = os.getenv("DATA_DIR", "data")

if not os.path.exists(TMP_DIR):
    os.makedirs(TMP_DIR)

if not os.path.exists(os.path.join(DATA_DIR, "log")):
    os.makedirs(os.path.join(DATA_DIR, "log"))

# Setup logging
logger = logging.getLogger(__file__.split("/")[-1])
logger.setLevel(logging.INFO)
json_formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(message)s')
file_handler = logging.FileHandler(os.path.join(DATA_DIR, "log", "main.log"))
file_handler.setFormatter(json_formatter)
logger.addHandler(file_handler)
logger.addHandler(RichHandler())

# Initialize transcription queue
Queue = SqlQueue(os.path.join(TMP_DIR, "deepgram_transcriptions.queue.db"))

if DEEPGRAM_API_KEY is None:
    logger.error("Please set the DEEPGRAM_API_KEY environment variable")
    sys.exit(1)


# Transcription collector
class TranscriptCollector:
    def __init__(self):
        self.reset()

    def reset(self):
        self.transcript_parts = []

    def add_part(self, part):
        self.transcript_parts.append(part)

    def get_full_transcript(self):
        return ' '.join(self.transcript_parts)


transcript_collector = TranscriptCollector()


# Deepgram transcription
async def get_transcript():
    try:
        config = DeepgramClientOptions(api_key=DEEPGRAM_API_KEY, options={"keepalive": "true"})
        deepgram = DeepgramClient(DEEPGRAM_API_KEY, config)

        dg_connection = deepgram.listen.asynclive.v("1")

        async def on_message(result, **kwargs):
            sentence = result['channel']['alternatives'][0]['transcript']
            if not result['is_final']:
                transcript_collector.add_part(sentence)
            else:
                transcript_collector.add_part(sentence)
                full_sentence = transcript_collector.get_full_transcript().strip()
                if full_sentence:
                    Queue.put(full_sentence)
                transcript_collector.reset()

        async def on_error(error, **kwargs):
            logger.error(f"Deepgram Error: {error}")

        dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
        dg_connection.on(LiveTranscriptionEvents.Error, on_error)

        options = LiveOptions(
            model=DEEPGRAM_MODEL,
            punctuate=True,
            language=SPEECHRECOGNITION_LANGUAGE,
            encoding="linear16",
            channels=1,
            sample_rate=16000,
            endpointing=True
        )

        await dg_connection.start(options)
        logger.info("Deepgram connection started")

        # Open microphone stream
        microphone = Microphone(dg_connection.send)
        microphone.start()
        logger.info("Microphone started")

        while True:
            if not microphone.is_active():
                logger.info("Microphone stopped")
                break
            await asyncio.sleep(1)

        microphone.finish()
        dg_connection.finish()

    except Exception as e:
        logger.error(f"Error in transcription: {e}")
        if str(e).endswith("HTTP 401"):
            logger.error("Invalid Deepgram API Key")
            sys.exit(1)


# Vocalize input using Deepgram
async def vocalizeInput(prompt: Optional[str] = "", timeout: float = 5.0) -> str:
    if prompt:
        print(prompt)
    await get_transcript()  # Start transcription
    return Queue.get(timeout=timeout)  # Retrieve the transcription


# Main process
async def main():
    print("Jarvis Online! How can I help you?")
    while True:
        try:
            # Get user input via voice
            user_input = await vocalizeInput("Listening for your command...")
            print(f"User said: {user_input}")

            # Simulated response processing
            response = f"You said: {user_input}"
            print(response)

        except Exception as e:
            logger.error(f"Error: {e}")
            print("An error occurred. Please try again.")


if __name__ == "__main__":
    asyncio.run(main())
