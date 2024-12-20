# capture audio with microphone
# process audio [...]
# convert audio to text

# capture audio with microphone

# 

# import os
from speech_to_text import listen

# Ensure the directory exists
# os.makedirs("data/tmp", exist_ok=True)

# voicedata = SqlQueue("data/tmp/async_deepgram_sr.queue.db")

while True:
    speech = listen()
    print("Final Extraction:",speech)
