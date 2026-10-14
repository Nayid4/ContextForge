"""Standardized Technical Documentation Blueprints and Templates."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class DocumentBlueprint:
    """Blueprint representing a standardized technical documentation template."""

    id: str
    name: str
    category: str
    description: str
    default_module: str
    default_tags: list[str]
    markdown_template: str

    @property
    def tags(self) -> list[str]:
        return self.default_tags

    @property
    def module(self) -> str:
        return self.default_module

    @property
    def template(self) -> str:
        return self.markdown_template



ADR_TEMPLATE = """---
title: "{title}"
module: "{module}"
project_slug: "{project_slug}"
author: "{author}"
tags: [{tags}]
status: "Propuesto"
date: "{date}"
---

# ADR: {title}

## 1. Contexto y Definición del Problema
Describe el problema arquitectónico o técnico que motiva esta decisión.
Incluye requisitos no funcionales (rendimiento, escalabilidad, seguridad, costos) y restricciones del entorno.

## 2. Decisión Arquitectónica Adoptada
Detalla la solución elegida de forma clara e inequívoca.
Explica cómo se implementará y los patrones de diseño involucrados.

## 3. Diagrama de Arquitectura de la Solución
```mermaid
flowchart TD
    Client["Cliente / Consumidor"] --> Gateway["API Gateway / Router"]
    Gateway --> Service["Servicio de Negocio"]
    Service --> Storage[("Almacén de Datos Soberano")]
```

## 4. Consecuencias y Compensaciones
### Consecuencias Positivas
- Beneficio 1: Mejora en rendimiento o mantenibilidad.
- Beneficio 2: Reducción de acoplamiento.

### Consecuencias Negativas o Riesgos
- Trade-off 1: Complejidad operativa adicional.
- Medidas de mitigación previstas.

## 5. Alternativas Evaluadas y Descartadas
1. **Alternativa A**: Motivo por el cual fue descartada.
2. **Alternativa B**: Motivo por el cual fue descartada.
"""


BUSINESS_FLOW_TEMPLATE = """---
title: "{title}"
module: "{module}"
project_slug: "{project_slug}"
author: "{author}"
tags: [{tags}]
version: "1.0"
date: "{date}"
---

# Regla de Negocio y Flujo: {title}

## 1. Propósito y Valor de Negocio
Explica la regla operativa o de negocio y el impacto directo que tiene en la operativa de la empresa.

## 2. Actores Involucrados y Precondiciones
- **Actor Principal**: Rol o usuario que inicia el flujo.
- **Sistemas Participantes**: Componentes de backend, pasarelas o servicios externos.
- **Precondiciones**: Estado requerido de los datos antes de iniciar la operación.

## 3. Diagrama de Secuencia del Flujo
```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Operador / Usuario
    participant UI as Capa de Presentación
    participant Core as Dominio de Negocio
    participant DB as Persistencia

    Usuario->>UI: Solicita iniciar proceso
    UI->>Core: Valida reglas e invariantes
    alt Reglas Cumplidas
        Core->>DB: Guarda nuevo estado
        DB-->>Core: Confirmación OK
        Core-->>UI: Operación exitosa
        UI-->>Usuario: Muestra confirmación
    else Validación Fallida
        Core-->>UI: Retorna error de negocio
        UI-->>Usuario: Muestra mensaje correctivo
    end
```

## 4. Matriz de Estados y Transiciones
| Estado Inicial | Evento Desencadenante | Estado Final | Acción Asociada |
| :--- | :--- | :--- | :--- |
| Pendiente | Validación Exitosa | Aprobado | Notificar al usuario |
| Pendiente | Rechazo de Regla | Cancelado | Registrar causa en bitácora |

## 5. Manejo de Casos Borde y Excepciones
Describe cómo se manejan situaciones anómalas (desconexiones, datos incompletos o accesos concurrentes).
"""


API_INTEGRATION_TEMPLATE = """---
title: "{title}"
module: "{module}"
project_slug: "{project_slug}"
author: "{author}"
tags: [{tags}]
date: "{date}"
---

# Especificación de Integración de API: {title}

## 1. Visión General del Servicio y Autenticación
- **Servicio Integrado**: Nombre y propósito del servicio externo o interno.
- **Tipo de API**: REST / Webhook / gRPC.
- **Mecanismo de Autenticación**: Bearer JWT / API Key / mTLS.

## 2. Diagrama de Flujo de Datos
```mermaid
flowchart LR
    App["ContextForge Core"] -->|HTTP POST Request + JWT| ExternalAPI["API Externa"]
    ExternalAPI -->|Respuesta JSON / 200 OK| App
    ExternalAPI -.->|Webhook Eventual| WebhookHandler["Manejador de Webhooks"]
```

## 3. Contratos de Datos y Endpoints Principales
### Endpoint: `/api/v1/recurso`
- **Método**: `POST`
- **Payload de Solicitud**:
```json
{
  "id": "item_12345",
  "accion": "sincronizar",
  "timestamp": "2026-10-13T12:00:00Z"
}
```
- **Respuesta Esperada (200 OK)**:
```json
{
  "status": "success",
  "codigo_transaccion": "tx_98765"
}
```

## 4. Resiliencia, Reintentos y Manejo de Errores
- **Política de Reintentos**: Retroceso exponencial (2^n seg) hasta 3 intentos.
- **Circuit Breaker**: Umbral de 5 fallos consecutivos abre el circuito durante 30s.
- **Rate Limiting**: Máximo de 100 solicitudes por minuto.
"""


TROUBLESHOOTING_TEMPLATE = """---
title: "{title}"
module: "{module}"
project_slug: "{project_slug}"
author: "{author}"
tags: [{tags}]
severidad: "Media"
date: "{date}"
---

# Guía de Troubleshooting: {title}

## 1. Síntomas Visibles e Impacto
Describe cómo se manifiesta el error en la interfaz de usuario, en los logs del servidor o en las métricas de monitoreo.

## 2. Árbol de Decisión de Diagnóstico
```mermaid
flowchart TD
    Inicio["Reporte de Incidencia"] --> VerLog{"¿Error registrado en logs?"}
    VerLog -- Sí --> TipoError{"¿Error de BD o Red?"}
    VerLog -- No --> VerEstado["Verificar estado del servicio"]
    TipoError -- Red --> CheckConn["Validar DNS y conectividad"]
    TipoError -- BD --> CheckPool["Verificar pool de conexiones SQLite"]
    CheckConn --> SolucionRed["Restablecer socket o gateway"]
    CheckPool --> SolucionDB["Liberar bloqueos o vaciar WAL"]
```

## 3. Procedimiento de Mitigación Inmediata
1. **Paso 1**: Aislar el componente afectado.
2. **Paso 2**: Ejecutar reinicio controlado o conmutación por error.
3. **Paso 3**: Verificar el restablecimiento del servicio con health checks.

## 4. Análisis de Causa Raíz y Prevención
- **Causa Raíz Típica**: Brecha en timeouts o saturación de disco.
- **Acción Preventiva**: Monitoreo de alertas tempranas y ajuste de umbrales.
"""


_BLUEPRINTS: dict[str, DocumentBlueprint] = {
    "adr": DocumentBlueprint(
        id="adr",
        name="Architecture Decision Record (ADR)",
        category="Arquitectura",
        description="Registro formal de decisiones arquitectónicas técnicas, contexto, consecuencias y compensaciones.",
        default_module="architecture",
        default_tags=["adr", "arquitectura", "decision"],
        markdown_template=ADR_TEMPLATE,
    ),
    "business_flow": DocumentBlueprint(
        id="business_flow",
        name="Flujo de Reglas de Negocio",
        category="Negocio",
        description="Definición de procesos y flujos de negocio, actores, secuencia y matriz de transiciones de estado.",
        default_module="business_flows",
        default_tags=["negocio", "flujo", "reglas"],
        markdown_template=BUSINESS_FLOW_TEMPLATE,
    ),
    "api_integration": DocumentBlueprint(
        id="api_integration",
        name="Integración de API y Servicios",
        category="Integraciones",
        description="Especificación técnica de contratos de API REST/Webhooks, esquemas JSON y políticas de resiliencia.",
        default_module="integrations",
        default_tags=["api", "integracion", "rest"],
        markdown_template=API_INTEGRATION_TEMPLATE,
    ),
    "troubleshooting": DocumentBlueprint(
        id="troubleshooting",
        name="Guía de Troubleshooting y Runbook",
        category="Operaciones",
        description="Guía paso a paso para el diagnóstico, mitigación y resolución de incidentes técnicos en producción.",
        default_module="troubleshooting",
        default_tags=["troubleshooting", "incidentes", "runbook"],
        markdown_template=TROUBLESHOOTING_TEMPLATE,
    ),
}


def get_all_blueprints() -> list[DocumentBlueprint]:
    """Retrieve all available documentation blueprints."""
    return list(_BLUEPRINTS.values())


def get_blueprint_by_id(blueprint_id: str) -> DocumentBlueprint | None:
    """Retrieve a specific blueprint by identifier."""
    return _BLUEPRINTS.get(blueprint_id.strip().lower())


list_blueprints = get_all_blueprints

