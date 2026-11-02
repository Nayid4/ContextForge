---
name: project-knowledge
description: Use when extracting deep project context, architectural analysis, C4 models, UML diagrams, business rules, external service catalogs, and modular documentation to feed AI agents with unbiased context.
---

# Skill: Extracción de Base de Conocimiento y Arquitectura del Proyecto

## Rol y Persona
Actúa como un **Ingeniero Principal de Software y Arquitecto de Sistemas (Staff / Principal Software Engineer)** con amplia maestría en **Domain-Driven Design (DDD)**, **Clean Architecture**, **Sistemas Distribuidos**, **Event-Driven Architecture (EDA)** y **Documentación Soberana Docs-as-Code**.

Tu objetivo es inspeccionar el repositorio con rigor ingenieril, comprender a fondo cada subsistema, dominio funcional y flujo de datos, y generar la **Base de Conocimiento Canónica** en `project-docs/knowledge/`. Esta documentación es la **Única Fuente de Verdad (Single Source of Truth)** para desarrolladores humanos y agentes de inteligencia artificial (Google Antigravity, Claude Code, Open Code, GitHub Copilot, Codex), garantizando **cero sesgo**, **cero alucinaciones** y **pleno respeto a los patrones existentes**.

---

## Cuándo Usar Esta Skill
- Al inicializar el arnés en un proyecto nuevo o existente para transferir el contexto completo a las IAs.
- Tras realizar cambios arquitecturales significativos, migraciones de base de datos o incorporación de nuevos bounded contexts.
- Antes de planificar features complejas (`/generate-spec`) o refactorizaciones estructurales.
- Cuando la IA o el equipo necesiten consultar diagramas C4, diagramas de clases, secuencias o reglas de negocio para tomar decisiones técnicas certeras.

---

## Salida Generada

La skill produce una estructura organizada dentro de `project-docs/knowledge/`:

```
project-docs/knowledge/
├── knowledge-index.json         # Índice unificado con diagramas Mermaid, reglas y contratos
├── c4-model.md                  # Modelo C4 completo: C1 Contexto, C2 Contenedores, C3 Componentes
├── uml-diagrams.md              # Diagramas UML: Clases con tipos, Secuencias con alt/else, Casos de Uso
├── business-rules.md            # Catálogo formal de reglas de negocio e invariantes (BR-*)
├── external-services.md         # Matriz de integraciones externas, protocolos, SLAs y failover
├── coding-standards.md          # Estándares, patrones canónicos y directrices anti-sesgo para IA
└── modules/                     # Documentación granular por Bounded Context identificado
    ├── {modulo_1}/
    │   ├── module-spec.md       # Alcance, entidades, contratos DTO y servicios
    │   ├── rules.md             # Invariantes exclusivas del módulo
    │   └── sequence.md          # Diagrama de secuencia del flujo transaccional principal
    └── {modulo_N}/
        ├── module-spec.md
        ├── rules.md
        └── sequence.md
```

---

## Procedimiento de Análisis Ingenieril

### Paso 1: Exploración Estructural y Bounded Contexts (DDD Estratégico)
1. **Mapeo de Dominios y Bounded Contexts**:
   - Inspeccionar la estructura de directorios (`src/`, `apps/`, `packages/`, `modules/`, `core/`, `domain/`).
   - Identificar el Lenguaje Ubicuo (*Ubiquitous Language*) y los límites de cada contexto (ej. Catálogo, Pagos/Facturación, Carrito, Autenticación, Órdenes, Notificaciones).
2. **Identificación del Paradigma Arquitectónico**:
   - Clean / Hexagonal / Onion: Confirmar la regla de dependencia hacia adentro (Dominio -> Aplicación -> Infraestructura/Adaptadores).
   - Event-Driven / CQRS: Localizar publicadores de eventos, manejadores (*Handlers*), colas (RabbitMQ, Kafka, SQS) y modelos de lectura/escritura segregados.
   - Microservicios o Monolito Modular: Definir fronteras de red, protocolos IPC y persistencia compartida o aislada.

---

### Paso 2: Generar Diagramas del Modelo C4 (Industrial Grade)
En `project-docs/knowledge/c4-model.md`, redactar con sintaxis **Mermaid**:

1. **C4 Nivel 1 — Contexto del Sistema (System Context C1)**:
   - Actores (clientes web, móviles, administradores, sistemas externos, APIs de socios).
   - El sistema en análisis como caja negra central con sus límites de responsabilidad.
   - Protocolos de entrada y salida (HTTPS, WSS, REST, gRPC).
2. **C4 Nivel 2 — Contenedores (Container Diagram C2)**:
   - Cada ejecutable o almacenamiento independiente: SPA / Frontend, API Gateway, Microservicios / Workers, Bases de datos (PostgreSQL, MongoDB), Cachés distribuidas (Redis), Message Brokers (RabbitMQ).
   - Especificar protocolos e interfaces (`HTTPS/JSON`, `AMQP 0-9-1`, `TCP/RESP`, `JDBC/Pool`).
3. **C4 Nivel 3 — Componentes (Component Diagram C3)**:
   - Radiografía interna del contenedor principal: Controladores / Routers, Casos de Uso / Comandos CQRS, Interfaces de Dominio, Repositorios concretos y Adaptadores de Infraestructura.

---

### Paso 3: Generar Diagramas UML Exhaustivos
En `project-docs/knowledge/uml-diagrams.md`, generar con sintaxis **Mermaid**:

1. **Diagrama de Clases de Dominio (Class Diagram)**:
   - Modelar las entidades raíz (*Aggregate Roots*), Value Objects y Enums.
   - Declarar atributos con su tipo exacto (`string`, `UUID`, `decimal`, `DateTime`) y visibilidad (`+`, `-`, `#`).
   - Indicar relaciones precisas: Composición (`*--`), Agregación (`o--`), Herencia (`<|--`) y Dependencia (`..>`), con multiplicidades (`1`, `0..1`, `1..*`).
2. **Diagramas de Secuencia Transaccionales (Sequence Diagrams)**:
   - Modelar al menos 2 flujos críticos (ej. Autenticación / Refresh Token y Checkout / Pago Idempotente).
   - **Obligatorio**: Incluir bloques condicionales (`alt / else / opt`), timeouts, validación de firmas criptográficas (HMAC), cabeceras de idempotencia y compensaciones ante fallos.
3. **Diagrama de Casos de Uso (Use Case Diagram)**:
   - Actores primarios y secundarios, casos de uso principales y relaciones de inclusión (`<<include>>`) y extensión (`<<extend>>`).
4. **Diagrama de Máquina de Estados (State Diagram)** (si aplica):
   - Transiciones de ciclo de vida de entidades transaccionales (ej. `Order: Pending -> Reserved -> Paid -> Dispatched -> Cancelled`).

---

### Paso 4: Catálogo Formal de Reglas de Negocio (`BR-*`)
En `project-docs/knowledge/business-rules.md`, consolidar las invariantes:

Para cada regla:
- **ID Único**: `BR-[MODULO]-[NUMERO]` (ej. `BR-BILL-001`, `BR-AUTH-002`).
- **Título Descriptivo**: Resumen de la invariante.
- **Severidad**: `Crítica` (afecta dinero, seguridad o datos) o `Alta` (integridad de negocio).
- **Módulo / Bounded Context**: Contexto al que pertenece.
- **Descripción e Invariante Matemática/Lógica**: La regla exacta sin ambigüedades (ej. "La tasa de redondeo utiliza Banker's Rounding IEEE 754 a 2 decimales; no se aceptan transacciones con monto <= 0").
- **Condición de Rechazo y Excepción**: Código de error o excepción arrojada ante incumplimiento.

---

### Paso 5: Matriz de Servicios Externos & Integraciones
En `project-docs/knowledge/external-services.md`:
- Catalogar pasarelas de pago, bases de datos, brokers, proveedores de correo (SES/SMTP), auth providers (OAuth2/OIDC).
- Documentar: Nombre, Tipo, Protocolo, Método de Autenticación, Variable de Entorno requerida, SLA / Timeout configurado, y **Política de Contingencia (Failover / Circuit Breaker / DLQ)**.

---

### Paso 6: Estándares de Codificación & Guardrails Anti-Sesgo
En `project-docs/knowledge/coding-standards.md`:
- Convenciones de nomenclatura (archivos, clases, funciones, bases de datos).
- Patrones arquitecturales obligatorios (Result pattern, Repository, Unit of Work, MediatR/CQRS).
- **Guardrails Estrictos Anti-Alucinación**: Lista explícita de bibliotecas prohibidas y librerías canónicas obligatorias (para impedir que la IA invente librerías o rompa la arquitectura).

---

### Paso 7: Documentación Modular Granular
Para cada Bounded Context identificado:
- Crear `project-docs/knowledge/modules/{modulo}/`.
- Redactar `module-spec.md` (responsabilidades y contratos), `rules.md` (invariantes locales) y `sequence.md` (flujo detallado).

---

### Paso 8: Generar `knowledge-index.json` y Sincronización Automática
1. Consolidar la información en `project-docs/knowledge/knowledge-index.json` conteniendo:
   - Lista completa de diagramas Mermaid (`id`, `title`, `type`, `level`, `description`, `mermaid`).
   - Catálogo de reglas de negocio (`id`, `title`, `module`, `severity`, `description`).
   - Catálogo de servicios externos (`name`, `type`, `protocol`, `auth`, `env_var`, `failover`).
   - Estándares y guardrails anti-sesgo.
2. **Sincronización con el Tablero Visual**:
   - Ejecutar obligatoriamente:
     ```bash
     node project-docs/sync-data.js
     ```
   - Esto inyecta los datos reales dentro de `project-docs/data-fallback.js` y recompila el bundle para que el tablero muestre la información de inmediato tanto por servidor local como en modo offline (`file:///`).

---

## Verificación de Calidad
- Cada bloque Mermaid debe ser sintácticamente válido y visualmente comprensible.
- Ninguna regla de negocio debe ser inventada; debe reflejar el código y dominio real del proyecto.
- Los guardrails deben cubrir los errores más comunes cometidos por modelos de lenguaje en el stack analizado.
