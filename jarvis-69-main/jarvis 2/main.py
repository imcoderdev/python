

from dotenv import load_dotenv
from modules.llm._groq import Groq, LLAMA_31_70B_VERSATILE, Role



# Load environment variables from .env file
load_dotenv()

# Suppress logging output
# import logging
# logging.getLogger().setLevel(logging.CRITICAL)

# Initialize the Groq model with the new model
llm = Groq(model=LLAMA_31_70B_VERSATILE)
response = llm.run("hi")
print(response)
#
# llm.addMessage(
#     role=Role.user,
#     content="my name is Namdev"
# )
# print(f"{llm.messages = }")
#
# print(llm.run("what is my name?"))
#
# print(f"{llm.messages = }")