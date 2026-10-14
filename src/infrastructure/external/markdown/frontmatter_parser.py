"""Frontmatter and Markdown Body Parser."""

from __future__ import annotations

from typing import Any
import yaml


class FrontmatterParser:
    """Extracts YAML Frontmatter metadata and raw Markdown body."""

    @staticmethod
    def extract_frontmatter(content: str) -> tuple[dict[str, Any], str]:
        """Split raw content into metadata dict and Markdown body."""
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                fm_text = parts[1].strip()
                try:
                    loaded = yaml.safe_load(fm_text)
                    if isinstance(loaded, dict):
                        return loaded, parts[2].strip()
                except Exception:
                    pass
        return {}, content.strip()
