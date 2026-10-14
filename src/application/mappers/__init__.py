"""Application mappers package."""

from application.mappers.book_registry_mapper import (
    AttachmentMapper,
    BookRegistryMapper,
)
from application.mappers.catalog_mapper import BookMapper, CatalogMapper
from application.mappers.chat_mapper import ChatMapper
from application.mappers.social_mapper import SocialMapper

__all__ = [
    "CatalogMapper",
    "BookMapper",
    "BookRegistryMapper",
    "AttachmentMapper",
    "SocialMapper",
    "ChatMapper",
]
