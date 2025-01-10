import time
from time import sleep

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

chrome_options=webdriver.ChromeOptions()
chrome_options.add_experimental_option("detach",True)
driver=webdriver.Chrome(options=chrome_options)
driver.get("https://tinder.com/")

time.sleep(5)
login_button = driver.find_element(By.XPATH, value='//*[text()="Log in"]')
login_button.click()
time.sleep(4)
click_more=driver.find_element(By.XPATH,'//*[@id="s-1232519249"]/div/div/div/div[1]/div/div/div[2]/div[2]/span/button')
click_more.click()
time.sleep(3)
click_google=driver.find_element(By.XPATH,value='//iframe[@title="Sign in with facebook Button"]')
click_google.click()
time.sleep(5)

# click_password=driver.find_element(By.ID,"")
# click_decline=driver.find_element(By.XPATH,'//*[@id="s-1453859685"]/div/div[2]/div/div/div[1]/div[2]/button')
# click_decline.click()
# try:
# click_cross = driver.find_element(By.XPATH, '//*[@id="s-1232519249"]/div/div/div[3]/button')
# click_cross.click()

# click_login=driver.find_element(By.CLASS_NAME,"lxn9zzn")
# click_login.click()
# click_login1=driver.find_element(By.XPATH,'//*[@id="s-1453859685"]/div/div[1]/div/main/div[1]/div/div/div/div/div/header/div/div[2]/div[2]/a')
# click_login1.click()
# except:


