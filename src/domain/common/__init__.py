"""Domain Common Primitives (pure re-exports)."""

from __future__ import annotations

from domain.common.aggregate_root import AggregateRoot
from domain.common.domain_error import DomainError
from domain.common.domain_event import DomainEvent
from domain.common.domain_exception import DomainException
from domain.common.error_or import ErrorOr
from domain.common.error_type import ErrorType
from domain.common.page_params import PageParams
from domain.common.paged_result import PagedResult

PageRequest = PageParams

__all__ = [
    "AggregateRoot",
    "DomainError",
    "DomainEvent",
    "DomainException",
    "ErrorOr",
    "ErrorType",
    "PageParams",
    "PageRequest",
    "PagedResult",
]
