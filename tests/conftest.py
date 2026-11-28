from __future__ import annotations
import os
from pathlib import Path
from typing import Iterator
import pytest

@pytest.fixture(scope="session", autouse=True)
def configure_test_env(tmp_path_factory: pytest.TempPathFactory) -> Iterator[None]:
    base = tmp_path_factory.mktemp("cf_v2_runtime")
    db_file = (base / "database" / "test_contextforge.db").as_posix()
    chroma_dir = (base / "database" / "chroma").as_posix()
    storage_dir = (base / "storage").as_posix()
    docs_dir = (base / "docs").as_posix()
    Path(docs_dir).mkdir(parents=True, exist_ok=True)
    (Path(docs_dir) / "arch_retries.md").write_text(
        "# Política de Reintentos\n\nEn webhooks aplicamos backoff exponencial hasta 5 intentos antes de DLQ con código ERR_WEBHOOK_504.",
        encoding="utf-8",
    )

    os.environ["APP_ENV"] = "qa"
    os.environ["AUTH_MODE"] = "local"
    os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{db_file}"
    os.environ["CHROMA_PERSIST_DIR"] = chroma_dir
    os.environ["LOCAL_STORAGE_PATH"] = storage_dir
    os.environ["DOCS_ROOT_PATH"] = docs_dir
    os.environ["AUTO_SEED_DATA"] = "true"
    os.environ["ALLOW_PUBLIC_CLI_AGENTS"] = "false"

    from infrastructure.di import reset_container
    reset_container()
    yield
