"""Infrastructure Settings, Multi-LLM, CLI Discovery, Storage & KPIs REST v1 Router (0 classes)."""

from __future__ import annotations

from dataclasses import asdict
import shlex
from typing import Any
from fastapi import APIRouter, Depends, Query, Request

from application.users.commands.SaveLlmProviderConfig import SaveLlmProviderConfigCommand
from application.users.commands.UpdateSystemSettings import UpdateSystemSettingsCommand
from application.users.queries.DiscoverCliEngines import DiscoverCliEnginesQuery
from application.users.queries.GetSystemHealthKpis import GetSystemHealthKpisQuery
from application.users.queries.ListLlmProviders import ListLlmProvidersQuery
from domain.common import DomainException
from domain.users import AuthPrincipal, CliSecurityPolicy, LlmProviderConfigEntity, PermissionAction
from infrastructure.config import EnvFileLoader
from infrastructure.di import DependencyContainer, get_container
from infrastructure.integrations import AIStrategyFactory, ProviderModelDiscoveryService, StorageConnectionTester
from infrastructure.persistence.database import DatabaseConnectionTester
from presentation.api.dependencies import build_cqrs_context, require_permission
from presentation.api.v1.schemas import (
    ActivateProviderPayload,
    DbTestPayload,
    LlmProviderPayload,
    StorageTestPayload,
    SystemSettingsPayload,
)

router = APIRouter(tags=["Infrastructure Settings, Multi-LLM & KPIs (CFG)"])


@router.get("/settings")
async def get_settings(
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    st = await c.settings_repo.get_settings()
    data = asdict(st)
    data["updated_at"] = st.updated_at.isoformat()
    return data


@router.put("/settings")
@router.post("/settings")
async def update_settings(
    payload: SystemSettingsPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_INFRA_AND_SECURITY)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    st = await c.mediator.execute_or_raise(
        UpdateSystemSettingsCommand(**payload.model_dump()),
        context=build_cqrs_context(request, principal),
    )
    data = asdict(st)
    data["updated_at"] = st.updated_at.isoformat()
    return data


@router.get("/settings/llm-providers")
async def list_llm_providers(
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    items = await c.mediator.execute_or_raise(ListLlmProvidersQuery())
    return {"items": items}


def _assert_safe_cli_payload(payload: LlmProviderPayload) -> None:
    if payload.engine_type == "local_cli" or payload.provider.endswith("_cli"):
        default_bin = payload.provider.removesuffix("_cli")
        binary = (payload.cli_command or ("agy" if payload.provider == "antigravity_cli" else default_bin)).strip()
        args = shlex.split(payload.cli_args) if (payload.cli_args or "").strip() else []
        chk = CliSecurityPolicy.validate(binary, args)
        if chk.is_error:
            raise DomainException(chk.first_error)


@router.post("/settings/llm-providers")
@router.post("/settings/llm")
async def save_llm_provider(
    payload: LlmProviderPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_INFRA_AND_SECURITY)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    _assert_safe_cli_payload(payload)
    saved: dict[str, Any] = await c.mediator.execute_or_raise(
        SaveLlmProviderConfigCommand(**payload.model_dump()),
        context=build_cqrs_context(request, principal),
    )
    return {"status": "success", "message": f"Proveedor {payload.provider} guardado.", "config": saved, **saved}


@router.post("/settings/llm/activate")
async def activate_llm_provider(
    payload: ActivateProviderPayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_INFRA_AND_SECURITY)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    res = await c.llm_config_repo.set_active(payload.provider)
    if res is None:
        return {"status": "error", "detail": f"Proveedor '{payload.provider}' no encontrado."}
    st = await c.settings_repo.get_settings()
    st.active_llm_model = res.default_model or st.active_llm_model
    await c.settings_repo.save_settings(st)
    return {"status": "success", "message": f"Motor '{res.name}' activado.", "provider": res.provider, "model": res.default_model}


@router.post("/settings/llm/test")
async def test_llm_provider(
    payload: LlmProviderPayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_INFRA_AND_SECURITY)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    _assert_safe_cli_payload(payload)
    existing = await c.llm_config_repo.get_by_provider(payload.provider)
    enc = c.vault.encrypt(payload.api_key) if payload.api_key else (existing.api_key_encrypted if existing else "")
    decrypted = c.vault.decrypt(enc) if enc else ""
    _, key_source = EnvFileLoader.resolve_provider_api_key(payload.provider, decrypted)
    cfg = LlmProviderConfigEntity(
        provider=payload.provider,
        engine_type=payload.engine_type,
        name=payload.name or payload.provider,
        base_url=payload.base_url or (existing.base_url if existing else ""),
        api_key_encrypted=enc,
        default_model=payload.default_model or (existing.default_model if existing else ""),
        cli_command=payload.cli_command or (existing.cli_command if existing else ""),
        cli_args=payload.cli_args or (existing.cli_args if existing else ""),
        temperature=payload.temperature,
        max_tokens=payload.max_tokens,
    )
    adapter = AIStrategyFactory.create(cfg, c.vault, timeout_sec=60.0)
    ok, msg, lat = await adapter.check_health()
    return {
        "healthy": ok,
        "message": msg,
        "latency_ms": lat,
        "provider": cfg.provider,
        "model_tested": cfg.default_model,
        "key_source": key_source,
    }


@router.post("/settings/llm/models")
async def discover_provider_models(
    payload: LlmProviderPayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    existing = await c.llm_config_repo.get_by_provider(payload.provider)
    stored_plain = c.vault.decrypt(existing.api_key_encrypted) if (existing and existing.api_key_encrypted) else ""
    eff_key, _ = EnvFileLoader.resolve_provider_api_key(payload.provider, payload.api_key or stored_plain)
    return await ProviderModelDiscoveryService.discover_models(
        provider=payload.provider,
        engine_type=payload.engine_type or (existing.engine_type if existing else "local_http"),
        base_url=payload.base_url or (existing.base_url if existing else ""),
        api_key=eff_key,
        cli_command=payload.cli_command or (existing.cli_command if existing else ""),
    )


@router.get("/settings/llm/discover-cli")
@router.get("/settings/discover-cli")
async def discover_cli_engines(
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    res: dict[str, Any] = await c.mediator.execute_or_raise(DiscoverCliEnginesQuery())
    return res


@router.post("/settings/database/test")
async def test_database_connection(
    payload: DbTestPayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_INFRA_AND_SECURITY)),
) -> dict[str, Any]:
    ok, msg, lat = await DatabaseConnectionTester.test_connection(
        provider=payload.provider,
        connection_url=payload.connection_url,
        host=payload.host,
        port=payload.port,
    )
    return {"healthy": ok, "reachable": ok, "message": msg, "latency_ms": lat}


@router.post("/settings/storage/test")
async def test_storage_connection(
    payload: StorageTestPayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_INFRA_AND_SECURITY)),
) -> dict[str, Any]:
    ok, msg, lat = await StorageConnectionTester.test_storage(
        provider=payload.provider,
        base_path=payload.base_path,
        endpoint_url=payload.endpoint_url,
        bucket_name=payload.bucket_name,
        project_id=payload.project_id,
    )
    return {"healthy": ok, "reachable": ok, "message": msg, "latency_ms": lat}


@router.get("/settings/embeddings/status")
async def get_embeddings_reindex_status(
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    st = await c.settings_repo.get_settings()
    return c.vector_store.get_reindex_status(st.embedding_model)


@router.post("/settings/embeddings/reindex")
async def trigger_embeddings_reindex(
    request: Request,
    project: str | None = Query(None),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    projects = [p for p in await c.project_repo.list_projects() if not project or p.slug == project]
    reindexed_docs = 0
    for proj in projects:
        pub_docs = await c.doc_repo.list_all(project_slug=proj.slug, only_published=True)
        for doc in pub_docs:
            await c.index_document_callback(doc)
            reindexed_docs += 1
    st = await c.settings_repo.get_settings()
    await c.event_store.append_audit(
        actor_id=principal.subject_id,
        role=principal.role.value,
        project_slug=project or "workspace",
        operation="rag.reindex_embeddings",
        resource_id=st.embedding_model,
        succeeded=True,
        latency_ms=0.0,
        client_ip=request.client.host if request.client else "local",
    )
    status = c.vector_store.get_reindex_status(st.embedding_model)
    return {"reindexed_documents": reindexed_docs, **status}


@router.get("/analytics/system")
async def get_system_health_kpis(
    project: str = Query("default"),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    report: dict[str, Any] = await c.mediator.execute_or_raise(GetSystemHealthKpisQuery(project_slug=project))
    return report
