---
description: Regla obligatoria de consulta de la base de conocimiento para evitar sesgo y mantener consistencia arquitectural en GitHub Copilot y agentes de IA.
---

# Regla de Consulta Obligatoria de la Base de Conocimiento (Knowledge Base)

## Propósito
Evitar el sesgo (bias), las alucinaciones y las decisiones arquitecturales inconsistentes por falta de contexto en los agentes de IA (Google Antigravity, Claude Code, Open Code, GitHub Copilot, Codex).

## Regla de Oro
**Antes de redactar especificaciones (`/generate-spec`, `/spec`), implementar código (`/implement-tdd`, `/implement-sdd`, `/implement-ftd`) o realizar revisiones de calidad (`/review`), todo agente DEBE consultar los artefactos de la Base de Conocimiento en `project-docs/knowledge/`**.

## Artefactos Canónicos a Consultar

1. **`project-docs/knowledge/c4-model.md`**:
   - Verificar en qué contenedor y componente se ubica la feature antes de crear nuevos archivos o modificar rutas.
2. **`project-docs/knowledge/uml-diagrams.md`**:
   - Revisar el modelo de clases y las secuencias existentes para no duplicar entidades ni alterar los flujos transaccionales.
3. **`project-docs/knowledge/business-rules.md`**:
   - Respetar estrictamente los identificadores de reglas de negocio (`BR-*`). Todo cambio de código debe validar que ninguna regla de negocio sea vulnerada.
4. **`project-docs/knowledge/external-services.md`**:
   - Utilizar exclusivamente los contratos, cabeceras y protocolos definidos para servicios externos (ej. pasarelas de pago Stripe, brokers RabbitMQ, Redis, etc.).
5. **`project-docs/knowledge/coding-standards.md`**:
   - Respetar la forma en que se ha venido programando: convenciones de nomenclatura, manejo de excepciones (`Result` pattern o excepciones de dominio), DTOs y patrones de inyección.
6. **`project-docs/knowledge/modules/{modulo}/`**:
   - Respetar los límites de contexto (*Bounded Contexts*) del módulo correspondiente.
