"""OWASP-compliant salted PBKDF2-HMAC-SHA256 password hasher."""

from __future__ import annotations

import base64
import hashlib
import hmac
import os


class PasswordHasher:
    ITERATIONS = 260_000

    @classmethod
    def hash_password(cls, password: str) -> str:
        salt = os.urandom(16)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, cls.ITERATIONS)
        return f"pbkdf2_sha256${cls.ITERATIONS}${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"

    @classmethod
    def verify_password(cls, password: str, encoded: str) -> bool:
        try:
            algo, iters_s, salt_b64, dk_b64 = encoded.split("$", 3)
            if algo != "pbkdf2_sha256":
                return False
            salt = base64.b64decode(salt_b64.encode())
            expected = base64.b64decode(dk_b64.encode())
            candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iters_s))
            return hmac.compare_digest(candidate, expected)
        except Exception:
            return False
