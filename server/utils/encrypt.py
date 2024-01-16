# for cryptography
import base64

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
