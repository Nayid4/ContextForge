"""RFC 7807 (application/problem+json) Global Exception Handlers mapping DomainException & ErrorType."""

from __future__ import annotations

from typing import Any
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from domain.common import DomainError, DomainException, ErrorType

ERROR_TYPE_TO_HTTP: dict[ErrorType, tuple[int, str]] = {
    ErrorType.VALIDATION: (422, "Unprocessable Entity"),
    ErrorType.NOT_FOUND: (404, "Not Found"),
    ErrorType.CONFLICT: (409, "Conflict"),
    ErrorType.UNAUTHORIZED: (401, "Unauthorized"),
    ErrorType.FORBIDDEN: (403, "Forbidden"),
    ErrorType.LOCKED: (423, "Locked"),
    ErrorType.PAYLOAD_TOO_LARGE: (413, "Payload Too Large"),
    ErrorType.UNSUPPORTED_MEDIA: (415, "Unsupported Media Type"),
    ErrorType.RATE_LIMITED: (429, "Too Many Requests"),
    ErrorType.EXTERNAL_FAILURE: (502, "Bad Gateway"),
}


def build_problem_response(request: Request, error: DomainError) -> JSONResponse:
    status_code, title = ERROR_TYPE_TO_HTTP.get(error.error_type, (400, "Bad Request"))
    trace_id = getattr(request.state, "trace_id", "")
    headers = {"X-Trace-Id": str(trace_id)} if trace_id else {}

    # OpenAI-compatible Gateway (/v1/*) must return OpenAI standard {"error": {...}} JSON contract
    if str(request.url.path).startswith("/v1/"):
        oai_status = 400 if status_code == 422 else status_code
        oai_type = {
            400: "invalid_request_error",
            401: "authentication_error",
            403: "permission_error",
            404: "not_found_error",
            429: "rate_limit_error",
        }.get(oai_status, "api_error")
        return JSONResponse(
            status_code=oai_status,
            content={
                "error": {
                    "message": error.message,
                    "type": oai_type,
                    "param": None,
                    "code": error.code,
                }
            },
            headers=headers,
        )

    body: dict[str, Any] = {
        "type": f"https://contextforge.local/errors/{error.code.replace('_', '-')}",
        "title": title,
        "status": status_code,
        "detail": error.message,
        "code": error.code,
        "instance": str(request.url.path),
    }
    if error.details:
        body["details"] = error.details
    if trace_id:
        body["trace_id"] = trace_id
    return JSONResponse(status_code=status_code, media_type="application/problem+json", content=body, headers=headers)


def register_problem_details_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainException)
    async def domain_exception_handler(request: Request, exc: DomainException) -> JSONResponse:
        return build_problem_response(request, exc.error)

    @app.exception_handler(RequestValidationError)
    async def request_validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        sanitized = [
            {"loc": [str(part) for part in err.get("loc", ())], "msg": str(err.get("msg", "")), "type": str(err.get("type", ""))}
            for err in exc.errors()
        ]
        summary = "; ".join(f"{'.'.join(e['loc'])}: {e['msg']}" for e in sanitized)
        err = DomainError.validation("request_validation_error", summary or "Parámetros de entrada inválidos.", errors=sanitized)
        return build_problem_response(request, err)
