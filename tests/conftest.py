from typing import AsyncGenerator
import pytest
from infrastructure.database.connection import create_engine_instance, init_db


_DB_INITIALIZED = False


@pytest.fixture(autouse=True)
async def initialize_test_database() -> AsyncGenerator[None, None]:
    """Ensure database tables and initial seed exist for tests."""
    global _DB_INITIALIZED
    if not _DB_INITIALIZED:
        engine = create_engine_instance()
        await init_db(engine, seed=True)
        await engine.dispose()
        _DB_INITIALIZED = True
    yield


