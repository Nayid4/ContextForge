"""GetDocTemplates response DTO."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class GetDocTemplatesResponse:
    """Response containing catalog of available templates."""

    templates: list[dict[str, Any]]

