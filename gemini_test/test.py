import google.generativeai as genai

# Replace 'YOUR_API_KEY' with your actual API key
genai.configure(api_key="AIzaSyAoROMDsI7uMg1mts9gnqCiORy1UMqbVRo")

# Initialize the Gemini 1.5 Flash model
model = genai.GenerativeModel("gemini-1.5-flash")

# Define your prompt
prompt = "hi"

# Generate content based on the prompt
response = model.generate_content(prompt)

# Print the generated content
print(response.text)
