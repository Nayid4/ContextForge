# ==============================================================================
# ContextForge v2.0 — Multi-Stage Production Dockerfile (Self-Hosted Grafana/Vault Style)
# ==============================================================================
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /build

COPY pyproject.toml README.md LICENSE requirements.txt ./
COPY src/contextforge ./src/contextforge

RUN pip install --no-cache-dir --upgrade pip && \
    pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# ------------------------------------------------------------------------------
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src \
    APP_ENV=prod \
    AUTH_MODE=local \
    DB_PROVIDER=sqlite \
    DATABASE_URL=sqlite+aiosqlite:///./data/database/contextforge.db \
    DOCS_ROOT_PATH=/app/docs \
    CHROMA_PERSIST_DIR=/app/data/database/chroma \
    LOCAL_STORAGE_PATH=/app/data/storage

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 10001 cfgroup \
    && useradd --uid 10001 --gid cfgroup --shell /bin/bash --create-home cfuser

COPY --from=builder /wheels /wheels
COPY pyproject.toml README.md LICENSE ./
COPY src ./src
COPY run_mcp.py ./run_mcp.py

RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/* \
    && pip install --no-cache-dir --no-deps -e . \
    && rm -rf /wheels \
    && mkdir -p /app/docs /app/data/database /app/data/storage/documents /app/data/storage/attachments /app/data/storage/bundles \
    && chown -R cfuser:cfgroup /app

USER cfuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8000/health/ready || exit 1

CMD ["uvicorn", "main:app", "--app-dir", "src", "--host", "0.0.0.0", "--port", "8000"]
