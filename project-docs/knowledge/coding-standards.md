---
id: "DOC-CODING-STANDARDS_MD"
title: "Estándares Canónicos de Código y Directrices Anti-Sesgo — ContextForge"
collection: "general"
parent: "01-project-overview-and-business.md"
owner: "reviewer"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-25"
tags: []
labels: ["coding-standards","anti-bias","python","typing","clean-architecture","general"]
icon: "shield"
---

# Estándares Canónicos de Código y Directrices Anti-Sesgo

> [!IMPORTANT]
> Directrices normativas verificadas en [`pyproject.toml`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/pyproject.toml) y en la arquitectura real de **ContextForge**.

---

## 1. Stack y Lista Blanca de Dependencias

Solo se permite utilizar paquetes declarados en `pyproject.toml`:
- **Web / ASGI**: `fastapi`, `uvicorn[standard]`, `jinja2`, `python-multipart`, `aiofiles`, `httpx`.
- **Validación y Configuración**: `pydantic`, `pydantic-settings`, `python-frontmatter`, `marko`.
- **Persistencia y Búsqueda**: `sqlalchemy` (2.0 Async), `aiosqlite`, `greenlet`, `chromadb`, `rank-bm25`, `tiktoken`, `watchdog`.
- **Extractores Multiformato**: `pypdf`, `python-docx`, `openpyxl`, `pandas`.
- **Calidad y Tests**: `pytest`, `pytest-asyncio`, `pytest-cov`, `mypy`.

Queda prohibido introducir ORMs alternativos, bundlers JS pesados (Webpack/Vite) o paquetes no registrados sin aprobación previa.

---

## 2. Convenciones de Código Python y Frontend

| Aspecto | Convención Obligatoria |
|---|---|
| **Tipado Estático** | `from __future__ import annotations` + 100% compatibilidad con `mypy --strict src`. |
| **Capas Clean Architecture** | `domain/` nunca importa de `infrastructure/` ni `presentation/`. |
| **CQRS Granular** | Cada caso de uso nuevo en `src/application/{modulo}/{commands|queries}/{accion}/` con `command.py`/`query.py`, `response.py`, `validator.py` y `handler.py`. |
| **Seguridad CLI** | Prohibido `shell=True` en `subprocess`. Pasar siempre listas de argumentos y enmascarar API keys en respuestas HTTP. |
| **Frontend Screaming UI** | Jinja2 + HTMX + Alpine.js + TailwindCSS v4. Cero `alert()` nativos (usar `window.$toast`). Cero interpolación inline `onclick` con texto libre del LLM (usar `addEventListener`). |
| **Tema Claro / Oscuro** | Toda clase de color en HTML/CSS debe declarar explícitamente variantes de modo claro y `dark:*`. |
| **Idioma** | Inglés para código, clases, variables y commits semánticos; español para documentación y copy de usuario. |
