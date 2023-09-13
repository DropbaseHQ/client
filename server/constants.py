import os

from dotenv import load_dotenv

load_dotenv()

ENCRYPT_SECRET = os.environ.get("ENCRYPT_SECRET")

GPT_MODEL = "gpt-3.5-turbo"
GPT_TEMPERATURE = 0.0
