import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import ElementClickInterceptedException, NoSuchElementException, StaleElementReferenceException, TimeoutException

EMAIL = "factt80@gmail.com"
PASSWORD = "Factt@123"
USERNAME = "factt80"
SIMILAR_ACCOUNT = "virat.kohli"


class InstaFollower:
    def __init__(self):
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_experimental_option("detach", True)
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.get("https://www.instagram.com/accounts/login/")

    def login(self):
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

        # Handle "Save Login Info" prompt
        try:
            not_now_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, '//div[@role="button" and text()="Not now"]'))
            )
            not_now_button.click()
        except:
            print("Save Login Info prompt did not appear.")

    def find_followers(self):
        # Navigate to the similar account's profile
        self.driver.get(f"https://www.instagram.com/{SIMILAR_ACCOUNT}")

        # Wait for the followers link to be present and click it
        try:
            followers_link = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, f'a[href="/{SIMILAR_ACCOUNT}/followers/"]'))
            )
            followers_link.click()
        except Exception as e:
            print(f"Failed to locate the followers link: {e}")
            return

        # Wait for the followers modal to load
        try:
            modal = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//div[@role="dialog"]'))
            )
            print("Followers modal located.")
        except Exception as e:
            print(f"Failed to locate the followers modal: {e}")
            return

        # Locate the scrollable container inside the modal
        try:
            scrollable_container = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//div[@role="dialog"]//div[@style="height: auto; overflow: hidden auto;"]'))
            )
            print("Scrollable container located.")
        except Exception as e:
            print(f"Failed to locate the scrollable container: {e}")
            return

        # Scroll through the followers list
        scroll_pause_time = 2  # Pause between scrolls
        scroll_height = 0

        for _ in range(10):  # Scroll 10 times
            try:
                # Scroll to the bottom of the container
                self.driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", scrollable_container)
                print("Scrolled down.")

                # Wait for new followers to load
                time.sleep(scroll_pause_time)

                # Get the new scroll height
                new_scroll_height = self.driver.execute_script("return arguments[0].scrollHeight", scrollable_container)
                print(f"New scroll height: {new_scroll_height}")

                # Break the loop if no more followers are loaded
                if new_scroll_height == scroll_height:
                    print("No more followers loaded. Stopping scroll.")
                    break

                # Update the scroll height
                scroll_height = new_scroll_height
            except Exception as e:
                print(f"Error during scrolling: {e}")
                break

    def follow(self):
        # Locate all "Follow" buttons within the scrollable container
        try:
            follow_buttons = WebDriverWait(self.driver, 10).until(
                EC.presence_of_all_elements_located((By.XPATH, '//div[@role="dialog"]//button[text()="Follow"]'))
            )
            print(f"Found {len(follow_buttons)} follow buttons.")
        except TimeoutException:
            print("No follow buttons found. The scroll might not have loaded any new followers.")
            return
        except Exception as e:
            print(f"Unexpected error while locating follow buttons: {e}")
            return

        # Click each "Follow" button
        for button in follow_buttons:
            try:
                button.click()
                print("Clicked a follow button.")
                time.sleep(1.1)  # Avoid rapid clicking
            except ElementClickInterceptedException:
                # Handle the case where the user is already being followed
                try:
                    cancel_button = self.driver.find_element(By.XPATH, '//button[text()="Cancel"]')
                    cancel_button.click()
                    print("Clicked Cancel on the confirmation dialog.")
                    time.sleep(1.1)
                except NoSuchElementException:
                    print("Could not find the Cancel button.")
            except StaleElementReferenceException:
                print("Stale element reference. Skipping this button.")
                continue
            except Exception as e:
                print(f"Unexpected error: {e}")
                continue


# Example usage
bot = InstaFollower()
bot.login()
bot.find_followers()
bot.follow()