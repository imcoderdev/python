import time
from selenium import webdriver
from selenium.webdriver import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Set up Chrome options
chrome_options = webdriver.ChromeOptions()
chrome_options.add_experimental_option("detach", True)
EMAIL="976447sa@gmail.com"
PASSWORD="Namdev@meta.com"
# Initialize the WebDriver
driver = webdriver.Chrome(options=chrome_options)

try:
    # Navigate to Tinder's login page
    driver.get("https://tinder.com/")
    print("Opened Tinder website")

    # Wait for the "Log in" button to be clickable


    # Wait for the "More Options" button to be clickable
    try:
        click_more = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, '//button[contains(text(), "More Options")]'))
        )
        click_more.click()
        print("Clicked the More Options button")
    except Exception as e:
        print("Failed to find or click the More Options button:", e)

    # Wait for the "Log in with Facebook" button to be clickable
    try:
        facebook_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, '//*[@id="s-1232519249"]/div/div/div/div[1]/div/div/div[2]/div[2]/span/div[2]/button'))
        )
        facebook_button.click()
        print("Clicked the Log in with Facebook button")
    except Exception as e:
        print("Failed to find or click the Log in with Facebook button:", e)

    # Wait for the next page to load
    time.sleep(5)
    try:
        # Get the current window handle (Tinder window)
        tinder_window = driver.current_window_handle

        # Wait for the new window (Facebook login pop-up) to open
        WebDriverWait(driver, 10).until(EC.number_of_windows_to_be(2))

        # Switch to the new window
        for window_handle in driver.window_handles:
            if window_handle != tinder_window:
                driver.switch_to.window(window_handle)
                break
        print("Switched to the Facebook login pop-up")
    except Exception as e:
        print("Failed to switch to the Facebook login pop-up:", e)

    # Wait for the email field to be clickable and enter the email
    # try:
    #     email_field = WebDriverWait(driver, 10).until(
    #         EC.element_to_be_clickable((By.ID, "email"))
    #     )
    #     email_field.send_keys(EMAIL,Keys.ENTER)
    #     print("Entered email")
    # except Exception as e:
    #     print("Failed to enter email:", e)
    #
    # # Wait for the password field to be clickable and enter the password
    # try:
    #     time.sleep(3)
    #     password_field = WebDriverWait(driver, 10).until(
    #         EC.element_to_be_clickable((By.ID, "pass"))
    #     )
    #     password_field.send_keys(PASSWORD,Keys.ENTER)
    #     print("Entered password")
    #     time.sleep(10)
    # except Exception as e:
    #     print("Failed to enter password:", e)

    try:
        time.sleep(15)
        continue_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, '//div[@aria-label="Continue as Dev"]'))
        )
        continue_button.click()
        print("Clicked the Continue as [Your Name] button")
    except Exception as e:
        print("Failed to find or click the Continue as [Your Name] button:", e)

    # Wait for the next page to load
    time.sleep(5)



    # Submit the form by pressing Enter
    # try:
    #     password_field.send_keys(Keys.ENTER)
    #     print("Submitted the login form")
    # except Exception as e:
    #     print("Failed to submit the login form:", e)

    # Wait for the next page to load
    time.sleep(5)
    try:
        accept=driver.find_element(By.XPATH,'//*[@id="s-1232519249"]/div/div[2]/div/div/div[1]/div[2]/button')
        accept.click()
        allow_location=driver.find_element(By.XPATH,'//*[@id="s-1232519249"]/div/div/div/div/div[3]/button[1]')
        allow_location.click()
        no_notification=driver.find_element(By.XPATH,'//*[@id="s-1232519249"]/div/div/div/div/div[3]/button[2]')
        no_notification.click()
        heart=driver.find_element(By.XPATH,'//*[@id="main-content"]/div[1]/div/div/div/div[1]/div/div/div[4]/div/div[4]/button')
    except Exception as e:
        print("An error occurred during script execution:", e)

finally:
    # Close the browser
    driver.quit()
    print("Browser closed")