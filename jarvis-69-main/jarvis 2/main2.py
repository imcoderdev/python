import os
from dotenv import load_dotenv
import logging
from speech_to_text import listen
from modules.llm._groq import Groq, LLAMA_31_70B_VERSATILE, Role

# Load environment variables from .env file
load_dotenv()

# Suppress logging output
logging.getLogger().setLevel(logging.CRITICAL)

# Initialize the Groq model
llm = Groq(model=LLAMA_31_70B_VERSATILE)
print("Groq LLM initialized and ready to use.")

# Infinite loop for processing audio input
while True:
    # Capture audio and convert to text
    speech = listen()
    print("User Input (speech-to-text):", speech)

    # Send the audio input text to the LLM
    llm.addMessage(
        role=Role.user,
        content=speech
    )

    # Fetch response from the LLM
    response = llm.run(speech)
    print("LLM Response:", response)

    # Display the history of messages
    print(f"{llm.messages = }")
