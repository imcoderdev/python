from Frontend.GUI import (
    GraphicalUserInterface,
    SetAssistantStatus,
    ShowTextToScreen,
    TempDirectoryPath,
    SetMicrophoneStatus,
    AnswerModifier,
    QueryModifier,
    GetMicrophoneStatus,
    GetAssistantStatus
)
from Backend.Model import FirstLayerDMM
from Backend.RealtimeSearchEngine import RealtimeSearchEngine
from Backend.Automation import Automation
from Backend.SpeechToText import SpeechRecognition
from Backend.Chatbot import ChatBot
from Backend.TextTospeech import TextToSpeech
from dotenv import dotenv_values
from asyncio import run
from time import sleep
import subprocess
import threading
import json
import os

# Load environment variables
env_vars = dotenv_values(".env")
Username = env_vars.get("Username", "User")
Assistantname = env_vars.get("Assistantname", "Assistant")
DefaultMessage = f"""{Username} : Hello {Assistantname}, How are you?
{Assistantname} : Welcome {Username}. I am doing well. How may I help you?"""
subprocesses = []
Functions = ["open", "close", "play", "system", "content", "google search", "youtube search"]

def ShowDefaultChatIfNoChats():
    try:
        if not os.path.exists('Data/ChatLog.json'):
            print("ChatLog.json file not found.")
            return

        with open(r'Data/ChatLog.json', "r", encoding='utf-8') as file:
            if len(file.read()) < 5:
                with open(TempDirectoryPath('Database.data'), 'w', encoding='utf-8') as db_file:
                    db_file.write("")

                with open(TempDirectoryPath('Responses.data'), "w", encoding='utf-8') as resp_file:
                    resp_file.write(DefaultMessage)
    except Exception as e:
        print(f"Error in ShowDefaultChatIfNoChats: {e}")

def ReadChatLogJson():
    try:
        with open(r'Data/ChatLog.json', 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        print("ChatLog.json file not found.")
        return []
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return []

def ChatLogIntegration():
    try:
        json_data = ReadChatLogJson()
        formatted_chatlog = ""
        for entry in json_data:
            if entry.get("role") == "user":
                formatted_chatlog += f"User: {entry.get('content', '')}\n"
            elif entry.get("role") == "assistant":
                formatted_chatlog += f"Assistant: {entry.get('content', '')}\n"

        formatted_chatlog = formatted_chatlog.replace("User", Username + " ")
        formatted_chatlog = formatted_chatlog.replace("Assistant", Assistantname + " ")

        with open(TempDirectoryPath('Database.data'), "w", encoding='utf-8') as file:
            file.write(AnswerModifier(formatted_chatlog))
    except Exception as e:
        print(f"Error in ChatLogIntegration: {e}")

def ShowChatsOnGUI():
    try:
        with open(TempDirectoryPath('Database.data'), "r", encoding='utf-8') as file:
            data = file.read()

        if data:
            lines = data.split('\n')
            result = '\n'.join(lines)

            with open(TempDirectoryPath('Responses.data'), "w", encoding='utf-8') as resp_file:
                resp_file.write(result)
    except Exception as e:
        print(f"Error in ShowChatsOnGUI: {e}")

def InitialExecution():
    try:
        SetMicrophoneStatus("False")
        ShowTextToScreen("")
        ShowDefaultChatIfNoChats()
        ChatLogIntegration()
        ShowChatsOnGUI()
    except Exception as e:
        print(f"Error in InitialExecution: {e}")

InitialExecution()

def MainExecution():
    try:
        TaskExecution = False
        ImageExecution = False
        ImageGenerationQuery = ""

        SetAssistantStatus("Listening...")
        Query = SpeechRecognition()
        ShowTextToScreen(f"{Username} : {Query}")
        SetAssistantStatus("Thinking...")
        Decision = FirstLayerDMM(Query)

        print(f"Decision : {Decision}")

        G = any(i.startswith("general") for i in Decision)
        R = any(i.startswith("realtime") for i in Decision)

        Mearged_query = " and ".join(
            [" ".join(i.split()[1:]) for i in Decision if i.startswith("general") or i.startswith("realtime")]
        )

        for queries in Decision:
            if "generate " in queries:
                ImageGenerationQuery = str(queries)
                ImageExecution = True

        for queries in Decision:
            if not TaskExecution and any(queries.startswith(func) for func in Functions):
                run(Automation(list(Decision)))
                TaskExecution = True

        if ImageExecution:
            with open(r"Frontend/Files/ImageGeneratoion.data", "w") as file:
                file.write(f"{ImageGenerationQuery},True")

            try:
                p1 = subprocess.Popen(['python', r'Backend/ImageGeneration.py'],
                                      stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                      stdin=subprocess.PIPE, shell=False)
                subprocesses.append(p1)
            except Exception as e:
                print(f"Error starting ImageGeneration.py: {e}")

        if G and R or R:
            SetAssistantStatus("Searching...")
            Answer = RealtimeSearchEngine(QueryModifier(Mearged_query))
            ShowTextToScreen(f"{Assistantname} : {Answer}")
            SetAssistantStatus("Answering...")
            TextToSpeech(Answer)
            return True

        else:
            for Queries in Decision:
                if "general" in Queries:
                    SetAssistantStatus("Thinking...")
                    QueryFinal = Queries.replace("general ", "")
                    Answer = ChatBot(QueryModifier(QueryFinal))
                    ShowTextToScreen(f"{Assistantname} : {Answer}")
                    SetAssistantStatus("Answering...")
                    TextToSpeech(Answer)
                    return True

                elif "realtime" in Queries:
                    SetAssistantStatus("Searching...")
                    QueryFinal = Queries.replace("realtime ", "")
                    Answer = RealtimeSearchEngine(QueryModifier(QueryFinal))
                    ShowTextToScreen(f"{Assistantname} : {Answer}")
                    SetAssistantStatus("Answering...")
                    TextToSpeech(Answer)
                    return True

                elif "exit" in Queries:
                    QueryFinal = "Okay, Bye!"
                    Answer = ChatBot(QueryModifier(QueryFinal))
                    ShowTextToScreen(f"{Assistantname} : {Answer}")
                    SetAssistantStatus("Answering...")
                    TextToSpeech(Answer)
                    SetAssistantStatus("Answering...")
                    os._exit(1)
    except Exception as e:
        print(f"Error in MainExecution: {e}")

def FirstThread():
    while True:
        try:
            CurrentStatus = GetAssistantStatus()

            if CurrentStatus == "True":
                MainExecution()
            else:
                AIStatus = GetAssistantStatus()

                if "Available..." in AIStatus:
                    sleep(0.1)
                else:
                    SetAssistantStatus("Available...")
        except Exception as e:
            print(f"Error in FirstThread: {e}")

def SecondThread():
    try:
        GraphicalUserInterface()
    except Exception as e:
        print(f"Error in SecondThread: {e}")

if __name__ == "__main__":
    thread2 = threading.Thread(target=FirstThread, daemon=True)
    thread2.start()
    SecondThread()
