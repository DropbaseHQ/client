# for cryptography
import base64
import json
from uuid import UUID

from cryptography.fernet import Fernet
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from server.constants import ENCRYPT_SECRET


def _create_fernet(workspace_id):
    cstPassword = bytes(ENCRYPT_SECRET, "utf-8")
    salt = bytes(workspace_id, "utf-8")

    if not salt:
        return None

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend(),
    )
    key = base64.urlsafe_b64encode(kdf.derive(cstPassword))
    return Fernet(key)


def _encrypt_creds(user_id: UUID, creds: dict):
    f = _create_fernet(str(user_id))
    creds_json = json.dumps(creds)
    return f.encrypt(bytes(creds_json, "utf-8")).decode("utf-8")


def _decrypt_db_creds(user_id: UUID, creds: str):
    f = _create_fernet(str(user_id))
    return json.loads(f.decrypt(bytes(creds.encode("utf-8"))).decode("utf-8"))
