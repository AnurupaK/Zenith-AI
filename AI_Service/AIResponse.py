from dotenv import load_dotenv
import os
import google.generativeai as genai
from groq import Groq


load_dotenv()

api_key_groq = os.getenv("GROQ_API_KEY")
if not api_key_groq:
    raise ValueError("API key for Groq is not set in the environment variables.")

##Whisper
client = Groq(api_key=api_key_groq)
def get_whisper(audio_file_path):
    """Transcribe audio using Whisper."""
    with open(audio_file_path, "rb") as audio_file:
        response = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=audio_file,
            language="en"
        )
    if response.text:
        return response.text
    else:
        return "Error processing the audio"

##Gemini
api_key_gemini = os.getenv("GOOGLE_API_KEY")
if not api_key_gemini:
    raise ValueError("API key for Google Generative AI is not set in the environment variables.")


genai.configure(api_key=api_key_gemini)

generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 100,
    "response_mime_type": "text/plain",
}


instruction = "You are a helpul chatbot and your name is Zenith"

gemini = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction=instruction
)


chat_session_gemini = gemini.start_chat(history=[])

def get_gemini_response(prompt):
    try:
        response  = chat_session_gemini.send_message(prompt)
        return response.text
    except Exception as e:
        return "Oops! it seems I didn't get your question"