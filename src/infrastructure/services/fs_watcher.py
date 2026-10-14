"""Background Filesystem Watcher with Debounced Project Re-indexing."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from typing import Any, Callable, Coroutine
from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

logger = logging.getLogger("infrastructure.watcher")


class DocsChangeHandler(FileSystemEventHandler):
    """Watches documentation filesystem events and dispatches debounced notifications."""

    def __init__(
        self,
        base_path: Path,
        on_change_detected: Callable[[str], None],
    ) -> None:
        super().__init__()
        self._base_path = base_path
        self._on_change_detected = on_change_detected

    def on_any_event(self, event: FileSystemEvent) -> None:
        if event.is_directory:
            return

        src_path = str(event.src_path)
        # Only watch Markdown files and project.json metadata
        if not (src_path.endswith(".md") or src_path.endswith("project.json")):
            return

        # Ignore temporary, backup, or hidden editor files
        path_obj = Path(src_path)
        if path_obj.name.startswith(".") or path_obj.name.startswith("~") or path_obj.name.endswith(".tmp"):
            return

        project_slug = self._infer_project_slug(path_obj)
        logger.debug("Filesystem change detected in project '%s': %s", project_slug, src_path)
        self._on_change_detected(project_slug)

    def _infer_project_slug(self, file_path: Path) -> str:
        try:
            rel_parts = file_path.relative_to(self._base_path).parts
            if len(rel_parts) >= 2:
                candidate = rel_parts[0]
                if candidate not in {"architecture", "modules", "troubleshooting", "general"}:
                    return candidate
            return "default"
        except Exception:
            return "default"


class BackgroundDocsWatcher:
    """Manages background observer with thread-safe debounced asyncio reindexing."""

    def __init__(
        self,
        docs_path: str = "./docs",
        debounce_seconds: float = 1.5,
        reindex_callback: Callable[[str], Coroutine[Any, Any, Any]] | None = None,
        loop: asyncio.AbstractEventLoop | None = None,
    ) -> None:
        self._docs_path = Path(docs_path)
        self._debounce_seconds = debounce_seconds
        self._reindex_callback = reindex_callback
        self._loop = loop
        self._observer: Any = None
        self._pending_tasks: dict[str, asyncio.TimerHandle] = {}
        self._is_running = False

    @property
    def is_running(self) -> bool:
        return self._is_running

    def start(self) -> None:
        """Start filesystem observer thread."""
        if self._is_running:
            return

        self._docs_path.mkdir(parents=True, exist_ok=True)
        if self._loop is None:
            try:
                self._loop = asyncio.get_running_loop()
            except RuntimeError:
                self._loop = None

        event_handler = DocsChangeHandler(
            base_path=self._docs_path,
            on_change_detected=self._handle_change_threadsafe,
        )

        self._observer = Observer()
        self._observer.schedule(event_handler, str(self._docs_path), recursive=True)
        self._observer.daemon = True
        self._observer.start()
        self._is_running = True
        logger.info("Background Docs Watcher started on path: %s", self._docs_path)

    def stop(self) -> None:
        """Stop filesystem observer thread and cancel pending debounces."""
        if not self._is_running:
            return

        for timer in self._pending_tasks.values():
            timer.cancel()
        self._pending_tasks.clear()

        if self._observer:
            self._observer.stop()
            self._observer.join(timeout=2.0)
            self._observer = None

        self._is_running = False
        logger.info("Background Docs Watcher stopped.")

    def _handle_change_threadsafe(self, project_slug: str) -> None:
        """Threadsafe entry point called from watchdog background thread."""
        target_loop = self._loop
        if target_loop and target_loop.is_running():
            target_loop.call_soon_threadsafe(self._schedule_debounce, project_slug)
        else:
            # Fallback for synchronous test harnesses
            pass

    def _schedule_debounce(self, project_slug: str) -> None:
        """Reset debounce timer for the specified project slug."""
        if project_slug in self._pending_tasks:
            self._pending_tasks[project_slug].cancel()

        if self._loop and self._loop.is_running():
            timer = self._loop.call_later(
                self._debounce_seconds,
                self._fire_reindex,
                project_slug,
            )
            self._pending_tasks[project_slug] = timer

    def _fire_reindex(self, project_slug: str) -> None:
        """Execute async reindex callback once debounce period expires."""
        self._pending_tasks.pop(project_slug, None)
        if self._reindex_callback and self._loop and self._loop.is_running():
            logger.info("Triggering debounced reindex for project: %s", project_slug)
            asyncio.create_task(self._reindex_callback(project_slug))
