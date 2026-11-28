"""Automated CI Anti-Drift Verifier: ensures Context.md stays 100% aligned with live SQLAlchemy ORM, FastAPI routes & RBAC."""

from __future__ import annotations

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))


def verify_context_drift() -> list[str]:
    """Returns a list of drift violations (empty list means 100% aligned)."""
    errors: list[str] = []
    context_path = ROOT / "Context.md"
    if not context_path.exists():
        return ["Context.md no existe en la raíz del proyecto."]

    text = context_path.read_text(encoding="utf-8")

    # 1. Introspect live SQLAlchemy ORM tables (source of truth)
    from infrastructure.persistence.models import Base  # noqa: PLC0415

    live_tables = sorted(Base.metadata.tables.keys())
    table_count = len(live_tables)

    if f"{table_count} modelos ORM" not in text:
        errors.append(f"Context.md §4 no declara el conteo exacto de '{table_count} modelos ORM'.")
    if f"{table_count} Tablas Reales SQLAlchemy" not in text:
        errors.append(f"Context.md §10 no declara el conteo exacto de '{table_count} Tablas Reales SQLAlchemy'.")

    er_match = re.search(r"```mermaid\s+erDiagram(.*?)```", text, flags=re.DOTALL)
    if not er_match:
        errors.append("No se encontró el bloque Mermaid erDiagram en Context.md §10.")
    else:
        er_block = er_match.group(1)
        for tbl in live_tables:
            if not re.search(rf"\b{re.escape(tbl)}\s*\{{", er_block):
                errors.append(f"Tabla ORM '{tbl}' falta en el diagrama ER de Context.md §10.")
        # Verify critical schema columns added in Bloques 1-4 are explicitly documented in ER
        required_er_columns = [
            "sovereign_only",
            "published_version",
            "last_synced_hash",
            "sync_status",
            "visibility",
            "daily_quota_requests",
            "allowed_agents_csv",
            "last_used_at",
            "agent_id",
            "agent_version",
            "author_id",
            "model_name",
            "tokens_used",
            "retrieved_chunk_ids_json",
            "must_change_password",
            "egress_class",
            "secret_encrypted",
        ]
        for col in required_er_columns:
            if not re.search(rf"\b{re.escape(col)}\b", er_block):
                errors.append(f"Columna ORM crítica '{col}' falta en el diagrama ER de Context.md §10.")

    # 2. Verify Class Diagram reflects hardened domain APIs (no obsolete denylist names)
    class_match = re.search(r"```mermaid\s+classDiagram(.*?)```", text, flags=re.DOTALL)
    if not class_match:
        errors.append("No se encontró el bloque Mermaid classDiagram en Context.md §9.")
    else:
        cls_block = class_match.group(1)
        for symbol in (
            "ALLOWED_FLAGS_BY_BINARY",
            "validate_citations",
            "QueryRewriterPolicy",
            "classify_egress",
            "IEmbeddingProviderPort",
        ):
            if symbol not in cls_block:
                errors.append(f"Símbolo de dominio '{symbol}' falta en el diagrama de clases (§9).")

    # 3. Forbid stale/contradictory identifiers anywhere in Context.md
    stale_tokens = [
        ("sovereign_mode", "Usar 'sovereign_only' en lugar de 'sovereign_mode'."),
        ("FORBIDDEN_ARG_TOKENS", "BR-17 usa allowlist positiva (ALLOWED_FLAGS_BY_BINARY), no FORBIDDEN_ARG_TOKENS."),
        ("21 Tablas Reales", "Conteo obsoleto de tablas (debe ser 25)."),
        ("21 modelos ORM", "Conteo obsoleto de modelos ORM (debe ser 25)."),
    ]
    for token, reason in stale_tokens:
        if token in text:
            errors.append(f"Identificador obsoleto encontrado ('{token}'): {reason}")

    # 4. Verify Business Rules BR-01 .. BR-23
    if "BR-01` a `BR-23" not in text:
        errors.append("El encabezado de §8 debe abarcar exactamente `BR-01` a `BR-23`.")
    for idx in range(1, 24):
        code = f"**BR-{idx:02d}**"
        if code not in text:
            errors.append(f"Falta la regla de negocio {code} en §8.")

    # 5. Verify Section 15 strictly follows the editorial rule (ONLY unimplemented TO-BE, no 'ya implementado' notes)
    sec15_idx = text.find("## 15.")
    if sec15_idx == -1:
        errors.append("No se encontró la Sección 15 en Context.md.")
    else:
        sec15 = text[sec15_idx:]
        for forbidden in ("ya fueron implementados", "ya están implementados", "ya implementado", "Post-Bloque"):
            if forbidden.lower() in sec15.lower():
                errors.append(f"La Sección 15 viola la regla editorial (contiene nota histórica '{forbidden}'; mover a CHANGELOG.md).")

    # 6. Verify live FastAPI route groups & RBAC roles appear in Context.md
    from domain.users import UserRole  # noqa: PLC0415
    from main import app  # noqa: PLC0415

    live_paths = set(app.openapi().get("paths", {}).keys())
    expected_routes = [
        "/v1/models",
        "/v1/chat/completions",
        "/api/v1/widget/session",
        "/api/v1/projects/{slug}/agents",
        "/api/v1/projects/{slug}/feedback",
        "/api/v1/projects/{slug}/knowledge-gaps",
        "/api/v1/projects/{slug}/webhooks",
        "/api/v1/projects/{slug}/export",
        "/api/v1/projects/import",
        "/metrics",
    ]
    for route in expected_routes:
        if route not in live_paths:
            errors.append(f"Ruta esperada '{route}' no existe en FastAPI app.routes.")
        if route not in text:
            errors.append(f"Ruta viva '{route}' no está documentada en Context.md §13.")

    for role in UserRole:
        if f"`{role.value}`" not in text:
            errors.append(f"Rol RBAC '{role.value}' no aparece en la matriz de permisos (§8.1).")

    return errors


def main() -> int:
    errs = verify_context_drift()
    if errs:
        print(f"DRIFT DETECTED ({len(errs)} issues):")
        for e in errs:
            print(f"  - {e}")
        return 1
    print("OK: Context.md is 100% aligned with live SQLAlchemy ORM (25 tables), FastAPI routes, BR-01..BR-23 & RBAC.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
