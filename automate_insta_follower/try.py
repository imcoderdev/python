import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Instagram credentials
EMAIL = "factt80@gmail.com"
PASSWORD = "Factt@123"
USERNAME = "factt80"
SIMILAR_ACCOUNT = "virat.kohli"

class InstaFollower:
    def __init__(self):
        # Set up Chrome options
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_experimental_option("detach", True)
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.get("https://www.instagram.com/accounts/login/")

    def login(self):
        # Wait for the login form to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.NAME, "username"))
        )

        # Enter email/username
        insta_username = self.driver.find_element(By.NAME, "username")
        insta_username.send_keys(EMAIL)

        # Enter password
        insta_pass = self.driver.find_element(By.NAME, "password")
        insta_pass.send_keys(PASSWORD)

        # Click the login button
        login_button = self.driver.find_element(By.XPATH, '//*[@id="loginForm"]/div[1]/div[3]/button')
        login_button.click()


bot=InstaFollower()
bot.login()