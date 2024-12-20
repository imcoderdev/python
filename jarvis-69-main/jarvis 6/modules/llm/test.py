import os
import openai
from dotenv import load_dotenv
import logging

class Openrouter:
    def __init__(self, model="meta-llama/Llama-2-7b-chat-hf", temperature=0.7, cheat_code="demo", verbose=False):
        """Initialize the Openrouter class."""
        # Load API key from environment
        load_dotenv()
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise EnvironmentError("OPENROUTER_API_KEY not found. Please set it in your environment.")

        self.model = model
        self.temperature = temperature
        self.cheat_code = cheat_code
        self.verbose = verbose
        self.messages = []

        # Configure logger
        self.logger = logging.getLogger("Openrouter")
        logging.basicConfig(level=logging.DEBUG if verbose else logging.INFO)

        self.client = None
        try:
            self.constructClient()
        except Exception as e:
            self.logger.error("Failed to initialize OpenRouter client: %s", e)
            raise

        try:
            self.testClient()
        except Exception as e:
            self.logger.error("Model test failed: %s", e)
            raise

    def constructClient(self):
        """Construct the OpenRouter client."""
        try:
            openai.api_base = "https://openrouter.ai/api/v1"
            openai.api_key = self.api_key
            self.logger.info("Client initialized successfully.")
        except Exception as e:
            self.logger.error("Error during client initialization: %s", e)
            raise

    def testClient(self):
        """Test if the specified model is available."""
        try:
            available_models = openai.Model.list()
            model_ids = [model.id for model in available_models.get("data", [])]
            if self.model not in model_ids:
                raise ValueError(f"Model {self.model} is not available in OpenRouter.")
            self.logger.info("Model test passed for %s", self.model)
        except Exception as e:
            self.logger.error("Error during model testing: %s", e)
            raise

    def addMessage(self, role, content, image_url=None):
        """Add a message to the context."""
        message = {"role": role, "content": content}
        if image_url:
            message["image_url"] = image_url
        self.messages.append(message)
        self.logger.debug("Added message: %s", message)

    def streamRun(self):
        """Run the model in streaming mode."""
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=self.messages,
                temperature=self.temperature,
                stream=True,
            )
            self.logger.info("Streaming response received.")
            for chunk in response:
                if "choices" in chunk:
                    delta = chunk["choices"][0].get("delta", {}).get("content", "")
                    print(delta, end="", flush=True)
            print()  # Newline after streaming output
        except Exception as e:
            self.logger.error("Error during streaming: %s", e)
            raise

    def run(self):
        """Run the model and return the result."""
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=self.messages,
                temperature=self.temperature,
            )
            result = response["choices"][0]["message"]["content"]
            self.logger.info("Response received: %s", result)
            return result
        except Exception as e:
            self.logger.error("Error during execution: %s", e)
            raise

if __name__ == "__main__":
    try:
        openrouter = Openrouter(verbose=True)
        print("Welcome to the OpenRouter interactive CLI!")
        while True:
            user_input = input("You: ")
            if user_input.lower() in {"exit", "quit"}:
                print("Goodbye!")
                break
            openrouter.addMessage("user", user_input)
            print("Assistant: ", end="")
            openrouter.streamRun()
    except Exception as e:
        logging.error("Fatal error: %s", e)