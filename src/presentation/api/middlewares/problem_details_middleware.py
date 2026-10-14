"""Problem Details RFC 7807 Error Handling Middleware."""

from __future__ import annotations

import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from domain.shared_kernel.exceptions import (
    BusinessRuleViolationException,
    DomainException,
    EntityNotFoundException,
    ValidationException,
)

logger = logging.getLogger("presentation.problem_details")


def register_problem_details_handlers(app: FastAPI) -> None:
    """Register global exception handlers returning RFC 7807 problem details."""

    @app.exception_handler(EntityNotFoundException)
    async def entity_not_found_handler(request: Request, exc: EntityNotFoundException) -> JSONResponse:
        return JSONResponse(
            status_code=404,
            media_type="application/problem+json",
            content={
                "type": "https://errors.librarysystem.local/entity-not-found",
                "title": "Entidad no encontrada",
                "status": 404,
                "detail": exc.message,
                "instance": str(request.url.path),
            },
        )

    @app.exception_handler(ValidationException)
    async def validation_exception_handler(request: Request, exc: ValidationException) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            media_type="application/problem+json",
            content={
                "type": "https://errors.librarysystem.local/validation-error",
                "title": "Error de validación",
                "status": 422,
                "detail": exc.message,
                "instance": str(request.url.path),
            },
        )

    @app.exception_handler(BusinessRuleViolationException)
    async def business_rule_handler(request: Request, exc: BusinessRuleViolationException) -> JSONResponse:
        return JSONResponse(
            status_code=409,
            media_type="application/problem+json",
            content={
                "type": "https://errors.librarysystem.local/business-rule-violation",
                "title": "Violación de regla de negocio",
                "status": 409,
                "detail": exc.message,
                "instance": str(request.url.path),
            },
        )

    @app.exception_handler(DomainException)
    async def general_domain_handler(request: Request, exc: DomainException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            media_type="application/problem+json",
            content={
                "type": "https://errors.librarysystem.local/domain-error",
                "title": "Error de dominio",
                "status": exc.status_code,
                "detail": exc.message,
                "instance": str(request.url.path),
            },
        )

