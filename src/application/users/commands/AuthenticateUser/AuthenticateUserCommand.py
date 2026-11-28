from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand

@dataclass(frozen=True)
class AuthenticateUserCommand(ICommand[dict[str, object]]):
    email: str
    password: str
