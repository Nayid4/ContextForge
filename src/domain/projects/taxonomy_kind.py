"""Taxonomy classification kind enum (Module vs Tag)."""

from __future__ import annotations

from enum import Enum


class TaxonomyKind(str, Enum):
    MODULE = "module"
    TAG = "tag"
