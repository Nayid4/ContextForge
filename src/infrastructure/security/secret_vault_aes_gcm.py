"""AES-256-GCM authenticated secret encryption at rest (RNF-03, RF-CFG-002)."""

from __future__ import annotations

import base64
import hashlib
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


class SecretVaultAesGcm:
    PREFIX = "enc:v1:"

    def __init__(self, master_secret: str) -> None:
        self._key = hashlib.sha256(master_secret.encode("utf-8")).digest()
        self._aes = AESGCM(self._key)

    def encrypt(self, plaintext: str) -> str:
        if not plaintext:
            return ""
        if plaintext.startswith(self.PREFIX):
            return plaintext
        nonce = os.urandom(12)
        ct = self._aes.encrypt(nonce, plaintext.encode("utf-8"), None)
        blob = base64.urlsafe_b64encode(nonce + ct).decode("ascii")
        return f"{self.PREFIX}{blob}"

    def decrypt(self, ciphertext: str) -> str:
        if not ciphertext:
            return ""
        if not ciphertext.startswith(self.PREFIX):
            return ciphertext
        raw = base64.urlsafe_b64decode(ciphertext[len(self.PREFIX) :].encode("ascii"))
        nonce, ct = raw[:12], raw[12:]
        return self._aes.decrypt(nonce, ct, None).decode("utf-8")

    def mask(self, secret: str) -> str:
        if not secret:
            return ""
        if len(secret) <= 4:
            return "****"
        return f"****{secret[-4:]}"
