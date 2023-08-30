import hashlib


def get_file_name_hash(file_name: str):
    hash_object = hashlib.sha256(file_name.encode("utf-8"))
    return hash_object.hexdigest() + "." + file_name.split(".")[-1]


def get_confirmation_token_hash(payload: str):
    hash_object = hashlib.sha256(payload.encode("utf-8"))
    return hash_object.hexdigest()
