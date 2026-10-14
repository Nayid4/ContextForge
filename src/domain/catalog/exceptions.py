"""Catalog Domain Exceptions."""

from __future__ import annotations

from domain.shared_kernel.exceptions import DomainException


class CatalogException(DomainException):
    """Base exception for catalog domain operations."""
    pass


class LibraryNotFoundException(CatalogException):
    """Raised when a requested library/project is not found."""

    def __init__(self, identifier: str) -> None:
        super().__init__(f"Library with identifier '{identifier}' was not found.")
        self.identifier = identifier


class BookNotFoundException(CatalogException):
    """Raised when a requested book or document is not found."""

    def __init__(self, identifier: str) -> None:
        super().__init__(f"Book with identifier '{identifier}' was not found.")
        self.identifier = identifier
