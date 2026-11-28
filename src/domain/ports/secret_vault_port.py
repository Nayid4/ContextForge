"""Secret encryption and masking vault port (AES-256-GCM at rest)."""

from __future__ import annotations

from typing import Protocol


class ISecretVault(Protocol):
    def encrypt(self, plaintext: str) -> str: ...
    def decrypt(self, ciphertext: str) -> str: ...
    def mask(self, secret: str) -> str: ...
