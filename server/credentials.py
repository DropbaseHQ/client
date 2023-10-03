import os

from dotenv import load_dotenv

load_dotenv()

POSTGRES_DB_HOST = os.environ.get("POSTGRES_DB_HOST")
POSTGRES_DB_PORT = os.environ.get("POSTGRES_DB_PORT")
POSTGRES_DB_NAME = os.environ.get("POSTGRES_DB_NAME")
POSTGRES_DB_USER = os.environ.get("POSTGRES_DB_USER")
POSTGRES_DB_PASS = os.environ.get("POSTGRES_DB_PASS")

print("TESTTESTSTEST")
print(POSTGRES_DB_HOST.split())

AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")

ENVIRONMENT = os.environ.get("ENVIRONMENT")


OPENAI_ORG_ID = os.getenv("OPENAI_ORG_ID")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
