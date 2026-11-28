"""Trace ID, Latency Telemetry, Security Headers, MCP Auth Gate, Rate Limiting & Global Exception Middleware."""

from __future__ import annotations

import hashlib
import logging
import time
import uuid
from urllib.parse import quote
from fastapi import Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from domain.common import DomainError, DomainException
from infrastructure.di import get_container
from presentation.api.dependencies.auth_guards import get_client_ip
from presentation.api.middlewares.problem_details_middleware import build_problem_response

logger = logging.getLogger("contextforge.http")

_PUBLIC_WEB_PREFIXES = ("/login", "/change-password", "/static/", "/health", "/api/", "/v1/", "/mcp", "/metrics", "/favicon.ico")


class TraceAndSecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        trace_id = request.headers.get("X-Trace-Id") or str(uuid.uuid4())
        request.state.trace_id = trace_id
        t0 = time.perf_counter()

        container = get_container()
        client_ip = get_client_ip(request, container.settings.env.trusted_proxies)
        path = request.url.path

        # Browser Web UI authentication & forced password change redirect in enterprise_rbac mode
        if (
            container.settings.env.auth_mode == "enterprise_rbac"
            and request.method == "GET"
            and not any(path.startswith(p) for p in _PUBLIC_WEB_PREFIXES)
            and "text/html" in (request.headers.get("accept") or "")
        ):
            cookie_tok = (request.cookies.get("cf_access_token") or "").strip()
            auth_hdr = (request.headers.get("Authorization") or "").strip()
            raw_tok = auth_hdr[7:].strip() if auth_hdr.lower().startswith("bearer ") else cookie_tok
            if not raw_tok:
                return RedirectResponse(url=f"/login?next={quote(path, safe='/')}", status_code=302)
            dec = container.jwt_service.verify_access_token(raw_tok)
            if dec.is_error:
                return RedirectResponse(url=f"/login?next={quote(path, safe='/')}", status_code=302)
            if dec.value.must_change_password:
                return RedirectResponse(url="/change-password", status_code=302)

        # Enforce Sliding-Window Rate Limiting on REST v1, OpenAI compat & Widget session (RIC-05)
        if path.startswith("/api/v1/") or path.startswith("/v1/"):
            is_ai = any(tok in path for tok in ("/rag/ask", "/rag/stream", "/chat/completions", "/agents/", "/widget/session"))
            limit = container.settings.env.rate_limit_ai_per_minute if is_ai else container.settings.env.rate_limit_read_per_minute
            rl_res = container.rate_limiter.check(f"{client_ip}:{'ai' if is_ai else 'api'}", limit)
            if rl_res.is_error:
                return build_problem_response(request, rl_res.first_error)

        # Enforce MCP SSE / Messages authentication in enterprise_rbac mode (BR-18)
        if path.startswith("/mcp/") and path != "/mcp/info" and container.settings.env.auth_mode == "enterprise_rbac":
            api_key_raw = (request.headers.get("X-API-Key") or "").strip()
            auth_hdr = (request.headers.get("Authorization") or "").strip()
            authorized = False
            if api_key_raw:
                key_hash = hashlib.sha256(api_key_raw.encode("utf-8")).hexdigest()
                key_ent = await container.api_key_repo.get_by_hash(key_hash)
                if key_ent is not None and key_ent.is_valid:
                    authorized = True
            elif auth_hdr.lower().startswith("bearer "):
                token = auth_hdr[7:].strip()
                dec = container.jwt_service.verify_access_token(token)
                if not dec.is_error:
                    authorized = True
            if not authorized:
                return build_problem_response(
                    request,
                    DomainError.unauthorized(
                        "mcp_auth_required",
                        "Autenticación requerida para el servidor MCP en modo enterprise_rbac (envía X-API-Key o Bearer JWT).",
                    ),
                )

        try:
            response = await call_next(request)
        except DomainException as dexc:
            response = build_problem_response(request, dexc.error)
        except Exception as exc:
            logger.exception("Unhandled server exception [trace_id=%s]: %s", trace_id, exc)
            response = JSONResponse(
                status_code=500,
                media_type="application/problem+json",
                content={
                    "type": "https://contextforge.local/errors/internal-server-error",
                    "title": "Internal Server Error",
                    "status": 500,
                    "detail": "Ocurrió un error interno controlado en el servidor.",
                    "instance": path,
                    "trace_id": trace_id,
                },
            )

        elapsed_ms = round((time.perf_counter() - t0) * 1000.0, 2)
        container.metrics.observe_http(request.method, response.status_code)
        response.headers["X-Trace-Id"] = trace_id
        response.headers["X-Response-Time-Ms"] = str(elapsed_ms)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        return response
