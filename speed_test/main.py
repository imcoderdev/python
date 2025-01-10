import time
from sys import executable

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

CHROME_DRIVER_PATH = ("C:/Users/Elibrary/PycharmProjects/speed_test/chromedriver.exe")

class InternetSpeedTwitterBot:
    def __init__(self,chrome_driver_path):
        self.driver=webdriver.Chrome()
        self.PROMISED_DOWN = 150
        self.PROMISED_UP = 1



    def get_internet_speed(self):
        self.driver.get("https://www.speedtest.net/")
        continue_=self.driver.find_element(By.XPATH,'//*[@id="onetrust-accept-btn-handler"]')
        continue_.click()
        time.sleep(5)

        go=self.driver.find_element(By.XPATH,'//*[@id="container"]/div[1]/div[3]/div/div/div/div[2]/div[3]/div[1]/a')
        go.click()

    def tweet_at_provider(self):
        pass


bot=InternetSpeedTwitterBot(CHROME_DRIVER_PATH)
bot.get_internet_speed()
bot.tweet_at_provider()
time.sleep(60)