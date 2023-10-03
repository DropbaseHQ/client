import os

from dotenv import load_dotenv

load_dotenv()

ENCRYPT_SECRET = os.environ.get("ENCRYPT_SECRET")

GPT_MODEL = "gpt-3.5-turbo"
GPT_TEMPERATURE = 0.0


ACCESS_TOKEN_EXPIRE_SECONDS = 60 * 60 * 24 * 1  # 1 day
REFRESH_TOKEN_EXPIRE_SECONDS = 60 * 60 * 24 * 7  # 7 days
WORKER_URL = "http://localhost:5000"
