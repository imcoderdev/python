import time
from time import sleep
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


chrome_options=webdriver.ChromeOptions()
chrome_options.add_experimental_option("detach",True)
driver=webdriver.Chrome(options=chrome_options)
driver.get("https://tinder.com/")


try:
    login_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//*[text()="Log in"]'))
    )
    login_button.click()
    print("Clicked the Log In button")
except Exception as e:
    print("Failed to find or click the Log In button:", e)
try:
    click_more = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//button[contains(text(), "More Options")]'))
    )
    click_more.click()
    print("Clicked the More Options button")
except Exception as e:
    print("Failed to find or click the More Options button:", e)
try:

    facebook_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//span[text()="Log in with Facebook"'))
    )
    facebook_button.click()
    print("Clicked the Log in with Facebook button")
    base_window = driver.window_handles[0]
    fb_login_window = driver.window_handles[1]
    driver.switch_to.window(fb_login_window)
    print(driver.title)
except Exception as e:
    print("Failed to find or click the Log in with Facebook button:", e)
try:

    time.sleep(18)
    continue_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//div[@aria-label="Continue as dev'))
    )
    continue_button.click()
    print("Clicked the Continue as [Your Name] button")
except Exception as e:
    print("Failed to find or click the Continue as [Your Name] button:", e)
























