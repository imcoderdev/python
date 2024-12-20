from typing import Optional
from weakref import finalize

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import time

website_path = "https://rtstt-nethytech.netlify.app/"
wait_time = 10

chrome_options = Options()
chrome_options.add_argument("--use-fake-ui-for-media-stream")
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")
chrome_options.add_argument("--headless=new")

driver = webdriver.Chrome(options=chrome_options)
wait = WebDriverWait(driver, wait_time)

def stream(content: str):
    print("\033[96m\rUser Speaking: \033[93m" + f"{content}",end="\r",flush=True)

def get_text():
    return driver.find_element(By.ID, "output").get_attribute("value").strip()

def click_start_button():
    start_button= wait.until(EC.element_to_be_clickable((By.ID, "startButton")))
    start_button.click()

def main() -> Optional[str]:
    driver.get(website_path)
    print("Speech to Text app loaded...")
    click_start_button()
    previous_transcription = ""
    finalized_transcription = ""
    while True:
        current_transcript = get_text()
        if current_transcript and current_transcript != previous_transcription:
            stream(current_transcript)
            previous_transcription = current_transcript
        if current_transcript.strip() and current_transcript != finalized_transcription:
            finalized_transcription = current_transcript
            print(f"033[92mFinalized : {finalized_transcription}\033[0m",end="\r")

        start_button_text = driver.find_element(By.ID, "startButton").text
        if start_button_text.strip().lower() == "start":
            break

        time.sleep(0.1)

    return finalized_transcription

def listen(prints:bool=False) -> Optional[str]:
    while True:
        result = main()
        if result and len(result) != 0:
            print("\r" + ""*(len(result) + 16) + "\r",end="",flush=True)
            if prints:
                print("\033\92m\rYOU SAID:" + f"{result}\033[0m")
            break
    return result
