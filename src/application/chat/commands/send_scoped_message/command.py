"""SendScopedMessage command definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SendScopedMessageCommand:
    """Command to send a user message to a scoped document chat session."""

    session_id: str
    library_id: str
    book_id: str
    user_message: str
    raw_markdown: str = ""
