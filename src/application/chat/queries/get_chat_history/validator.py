"""Validator for GetChatHistoryQuery."""

from __future__ import annotations

from application.chat.queries.get_chat_history.query import GetChatHistoryQuery
from application.commons.exceptions.application_exceptions import ValidationException


class GetChatHistoryValidator:
    """Validates parameters for GetChatHistoryQuery."""

    def validate(self, query: GetChatHistoryQuery) -> None:
        if not query.session_id or not query.session_id.strip():
            raise ValidationException("Session ID cannot be empty.")
