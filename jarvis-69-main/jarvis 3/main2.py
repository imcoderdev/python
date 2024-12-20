import sys
import os
from datetime import datetime
from rich import print
import json
from dotenv import load_dotenv

# Ensure project root is in Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import modules
from modules.llm._groq import Groq, LLAMA_31_70B_VERSATILE
from modules.prompt.base import Prompt, Role, File, Image, Text, Function
from speech_to_text import listen

# Load environment variables
load_dotenv()


# Function to load emotion from JSON
def getEmotion(emotion: str):
    jsonFile = r"data/config/emotion.config.json"
    with open(jsonFile) as f:
        data = json.load(f)
        for item in data:
            if item["emotion"] == emotion:
                return item
    return data[0]


# Create a prompt template
emotionPrompt = f"""You are a language model that must express a specific emotion in your responses. Below is the emotion you need to embody:

{getEmotion('Happiness')}

**Important**: You are required to respond only in this emotion. Your response must reflect the chosen emotion in every aspect, including tone, word choice, and overall expression. Any deviation from this emotion will not be acceptable.
Your response should clearly reflect the specified emotion as described above.
"""

promptTemplate = Prompt(
    template=[
        File(r"data/personality/humor_jarvis.json"),
        emotionPrompt,
        Function(lambda: f'**Date:** {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}'),
        ""
    ],
    separator=f'\n{"-" * 50}\n'
)

# Initialize the LLM
prompt, images = promptTemplate()
llm = Groq(model=LLAMA_31_70B_VERSATILE, systemPrompt=prompt)


# Main function
def main():
    print("Welcome to Jarvis! Choose your mode:")
    print("1. Voice Input")
    print("2. Text Input")
    print("3. Exit")

    while True:
        choice = input("Enter your choice (1/2/3): ").strip()

        if choice == "1":
            # Voice Input Mode
            try:
                print("Listening for speech...")
                speech = listen()
                print("Speech Input:", speech)
                print("LLM Response:", llm.run(speech))
            except Exception as e:
                print(f"Error in voice processing: {e}")

        elif choice == "2":
            # Text Input Mode
            text = input("Enter your text query: ").strip()
            print("LLM Response:", llm.run(text))

        elif choice == "3":
            print("Exiting. Goodbye!")
            break

        else:
            print("Invalid choice. Please select 1, 2, or 3.")


# Entry point
if __name__ == "__main__":
    main()
