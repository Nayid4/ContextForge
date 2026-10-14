"""Integration tests for background filesystem watcher and debounced re-indexing."""

import asyncio
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock
import pytest
from infrastructure.services.fs_watcher import BackgroundDocsWatcher, DocsChangeHandler
from watchdog.events import FileModifiedEvent


def test_docs_change_handler_project_inference(tmp_path: Path) -> None:
    """Verify DocsChangeHandler infers project slug correctly from relative path hierarchy."""
    docs_dir = tmp_path / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)

    callback_mock = MagicMock()
    handler = DocsChangeHandler(base_path=docs_dir, on_change_detected=callback_mock)

    # 1. Multi-project paths
    slug_iuris = handler._infer_project_slug(docs_dir / "iuristrack" / "billing" / "invoice.md")
    assert slug_iuris == "iuristrack"

    slug_upc = handler._infer_project_slug(docs_dir / "mesa-servicio-upc" / "tickets" / "sla.md")
    assert slug_upc == "mesa-servicio-upc"

    # 2. Legacy root or default categories
    slug_legacy = handler._infer_project_slug(docs_dir / "architecture" / "adrs" / "adr1.md")
    assert slug_legacy == "default"

    slug_root = handler._infer_project_slug(docs_dir / "readme.md")
    assert slug_root == "default"


def test_docs_change_handler_filters_irrelevant_files(tmp_path: Path) -> None:
    """Verify DocsChangeHandler ignores non-markdown, temp files, and directory events."""
    docs_dir = tmp_path / "docs"
    callback_mock = MagicMock()
    handler = DocsChangeHandler(base_path=docs_dir, on_change_detected=callback_mock)

    # Temporary file -> Ignored
    handler.on_any_event(FileModifiedEvent(str(docs_dir / "iuristrack" / "doc.tmp")))
    callback_mock.assert_not_called()

    # Hidden editor file -> Ignored
    handler.on_any_event(FileModifiedEvent(str(docs_dir / "iuristrack" / ".hidden.md")))
    callback_mock.assert_not_called()

    # Backup editor file -> Ignored
    handler.on_any_event(FileModifiedEvent(str(docs_dir / "iuristrack" / "~backup.md")))
    callback_mock.assert_not_called()

    # Binary/Image file -> Ignored
    handler.on_any_event(FileModifiedEvent(str(docs_dir / "iuristrack" / "diagram.png")))
    callback_mock.assert_not_called()

    # Valid Markdown file -> Dispatched
    handler.on_any_event(FileModifiedEvent(str(docs_dir / "iuristrack" / "billing" / "plan.md")))
    callback_mock.assert_called_once_with("iuristrack")


@pytest.mark.asyncio
async def test_background_docs_watcher_debounce_execution(tmp_path: Path) -> None:
    """Verify BackgroundDocsWatcher consolidates multiple rapid events into a single debounced callback."""
    docs_dir = tmp_path / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)

    reindexed_projects: list[str] = []

    async def mock_reindex(slug: str) -> None:
        reindexed_projects.append(slug)

    loop = asyncio.get_running_loop()
    watcher = BackgroundDocsWatcher(
        docs_path=str(docs_dir),
        debounce_seconds=0.1,  # Short debounce for rapid test execution
        reindex_callback=mock_reindex,
        loop=loop,
    )

    watcher.start()
    assert watcher.is_running is True

    # Simulate 5 rapid bursts for project "iuristrack"
    for _ in range(5):
        watcher._handle_change_threadsafe("iuristrack")
        await asyncio.sleep(0.02)

    # Wait for debounce timer (0.1s) to elapse
    await asyncio.sleep(0.25)

    # Verify callback was executed exactly ONCE for iuristrack
    assert len(reindexed_projects) == 1
    assert reindexed_projects[0] == "iuristrack"

    # Stop watcher
    watcher.stop()
    assert watcher.is_running is False

