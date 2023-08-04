import os

from dotenv import load_dotenv

load_dotenv()

ENCRYPT_SECRET = os.environ.get("ENCRYPT_SECRET")
