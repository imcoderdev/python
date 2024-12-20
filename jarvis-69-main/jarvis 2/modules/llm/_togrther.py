try:
    from modules.llm.base import LLM, Model, ModelType, Role
except ImportError:
    import os
    import sys
    
    sys.path.append(os.path.dirname(__file__))
    from base import LLM, Model, ModelType, Role

from typing import Optional, List, Dict, Generator
from dotenv import load_dotenv
from rich import print
from copy import deepcopy

import os
import together

load_dotenv()

LLAMA_VISION_FREE = Model(name="meta-llama/Llama-Vision-Free", typeof=ModelType.textandimage)

# TODO: Add more models here

class Together(LLM):
    def __init__(
        self,
        model: Model,
        apiKey: Optional[str] = None,
        messages: List[Dict[str, str]] = [],
        temperature: float = 0.0,
        systemPrompt: Optional[str] = None,
        maxTokens: int = 2048,
        cheatCode: Optional[str] = None,
    ):
        super().__init__(model, apiKey, messages, temperature, systemPrompt, maxTokens)
        
        self.cheatCode = cheatCode
        self.client: together.Together = self.constructClient()
        
        if cheatCode is None:
            p = self.testClient()
            if p:
                self.logger.info("Test successful for Together API key. Model found.")
        else:
            self.logger.info("Cheat code provided. Model found.")
    
    def constructClient(self):
        import logging
        self.logger = logging.getLogger(__name__)
        logging.basicConfig(level=logging.INFO)

        try:
            client = together.Together(
            api_key=os.environ["TOGETHER_API_KEY"] if self.apiKey is None else self.apiKey,
            )
            return client
        except Exception as e:
            print(e)
            self.logger.error(e)
    
    def testClient(self) -> bool:
        try:
            modelListResponse = self.client.models.list()
            models = modelListResponse
            
            for modelinfo in models:
                if modelinfo.id == self.model.name:
                    break
            else:
                self.logger.error("Model not found")
                raise Exception("Model not found in Together, please add it to the code.")
            return True
        except Exception as e:
            print(e)
            self.logger.error(e)
    
    def streamRun(self, prompt: str = "", imageUrl: Optional[str] = None, save: bool = True) -> Generator[str, None, None]:
        toSend = []
        if save and prompt:
            self.addMessage(Role.user, prompt, imageUrl)
        elif not save and prompt:
            toSend.append(self.getMessage(Role.user, prompt, imageUrl))

        try:
            extra = {}
            if self.cheatCode is not None:
                extra["seed"] = 0

            chat_completion = self.client.chat.completions.create(
                messages=self.messages + toSend,
                model=self.model.name,
                temperature=self.temperature,
                max_tokens=self.maxTokens,
                stream=True,
                **extra
            )
        except Exception as e:
            self.logger.error(e)
            return "Please check log file some error occured."

        final_response = ""
        
        for completion in chat_completion:
            if completion.usage is not None:
                self.logger.info(completion)
                break

            if completion.choices[0].delta is not None:
                final_response += completion.choices[0].delta.content
                yield completion.choices[0].delta.content

        if save:
            self.addMessage(Role.assistant, final_response)

    
    def run(self, prompt: str = "", imageUrl: Optional[str] = None, save: bool = True) -> str:
        toSend = []
        if save and prompt:
            self.addMessage(Role.user, prompt, imageUrl)
        elif not save and prompt:
            toSend.append(self.getMessage(Role.user, prompt, imageUrl))

        try:
            extra = {}
            if self.cheatCode is not None:
                extra["seed"] = 0

            chat_completion = self.client.chat.completions.create(
                messages=self.messages + toSend,
                model=self.model.name,
                temperature=self.temperature,
                max_tokens=self.maxTokens,
                **extra
            )
        except Exception as e:
            self.logger.error(e)
            return "Please check log file some error occured."

        log_completion = deepcopy(chat_completion)
        log_completion.choices[0].message.content = log_completion.choices[0].message.content[:20]
        self.logger.info(log_completion)

        if save:
            self.addMessage(Role.assistant, chat_completion.choices[0].message.content)


        return chat_completion.choices[0].message.content

print("DATA_DIR:", DATA_DIR)  # Debugging

if __name__ == "__main__":
    llm = Together(LLAMA_VISION_FREE, apiKey=os.getenv("TOGETHER_API_KEY"))

    # Example 1: Text-only query
    response = llm.run(prompt="What is 2+2?", save=True)
    print("Response:", response)

    # Example 2: Text with image query
    image_url = "data:image/webp;base64,..."
    response = llm.run(prompt="What is in the image?", imageUrl=image_url, save=True)
    print("Response:", response)

