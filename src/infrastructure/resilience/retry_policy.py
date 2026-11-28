"""Exponential backoff with jitter retry helper."""

from __future__ import annotations

import asyncio
import random
from typing import Awaitable, Callable, TypeVar

T = TypeVar("T")


async def retry_with_backoff(
    fn: Callable[[], Awaitable[T]],
    *,
    max_attempts: int = 3,
    base_delay_sec: float = 0.25,
) -> T:
    last_exc: Exception | None = None
    for attempt in range(1, max_attempts + 1):
        try:
            return await fn()
        except Exception as exc:
            last_exc = exc
            if attempt == max_attempts:
                break
            jitter = random.uniform(0.0, 0.1)
            await asyncio.sleep(base_delay_sec * (2 ** (attempt - 1)) + jitter)
    assert last_exc is not None
    raise last_exc
