"""Module for loading secrets or even creating if necessary"""

import secrets
from atomicwrites import atomic_write
import secrets

def get_secret():
    """Get secret from file (I want to be able to put this on github)"""
    try:
        secret_file = open("secret.txt", "r", encoding='utf-8')
        secret = secret_file.read()
        secret_file.close()
    except (FileNotFoundError, OSError, IOError):
        #Secret file does not exist -> create one -> read secret from file
        new_secret = secrets.token_hex()
        with atomic_write("secret.txt", overwrite=True) as file:
            file.write(new_secret)
        secret_file = open("secret.txt", "r", encoding='utf-8')
        secret = secret_file.read()
        secret_file.close()
    return secret
