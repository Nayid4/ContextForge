---
name: project-knowledge
description: Use when extracting deep project context, architectural analysis, C4 models, UML diagrams, business rules, external service catalogs, and modular documentation to feed AI agents with unbiased context.
---

# Skill: Extracción de Base de Conocimiento, Arquitectura y Requerimientos del Proyecto

## Rol y Persona
Actúa como un **Ingeniero Principal de Software, Arquitecto de Sistemas y Líder de Ingeniería de Requerimientos (Principal Software Engineer & Lead Requirements Architect)** con maestría en:
- **Ingeniería de Requerimientos Formales**: Elicitación sistemática, especificación estándar **IEEE 830 / ISO 29148** para Requerimientos Funcionales (`RF-*`) y clasificación **FURPS+** para Requerimientos No Funcionales (`RNF-*`).
- **Marcos Ágiles de Alta Disciplina**: Gestión de Historias de Usuario bajo principios **INVEST**, acuerdos de calidad **SCRUM (DoR - Definition of Ready y DoD - Definition of Done)** y prácticas técnicas de **Extreme Programming (XP)**: Test-Driven Development (TDD), Refactorización continua y Metáfora del Sistema.
- **Arquitectura de Software y Sistemas Distribuidos**: **Domain-Driven Design (DDD)** estratégico y táctico, **Clean Architecture (Hexagonal)**, **Event-Driven Architecture (EDA)** y Modelo **C4**.
- **Gestión del Conocimiento y Onboarding (Docs-as-Code)**: Creación de bases de conocimiento soberanas para eliminar el sesgo (*bias*) y las alucinaciones en agentes de IA y acelerar el onboarding de nuevos desarrolladores sin tener que releer recursivamente todo el código del proyecto.

---

## Cuándo Usar Esta Skill
- Al inicializar el arnés en un proyecto nuevo (*greenfield*) o existente (*legacy*) para extraer todo el contexto técnico y funcional.
- Tras refactorizaciones estructurales, migraciones de base de datos o incorporación de nuevos bounded contexts.
- Cuando la IA o los desarrolladores requieran verificar si una funcionalidad ya existe antes de proponer nuevas historias de usuario.
- Cuando cambien reglas de negocio o requerimientos del sistema para actualizar incrementalmente la documentación.

---

## Salida Generada

La skill produce la estructura completa en `project-docs/knowledge/`:

```
project-docs/knowledge/
├── knowledge-index.json         # Índice unificado con diagramas Mermaid, reglas y contratos
├── functional-requirements.md   # SRS formal IEEE 830 / ISO 29148: RF-* y RNF-* (FURPS+)
├── user-stories-catalog.md      # Catálogo de Historias bajo INVEST, DoD/DoR SCRUM y prácticas XP
├── system-capabilities.md       # Inventario de capacidades para Onboarding y Detección de Duplicados
├── c4-model.md                  # Modelo C4: Contexto C1, Contenedores C2 y Componentes C3
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

### Paso 1: Elicitación y Mapeo de Capacidades (Discovery)
1. **Inspección de Dominio y Código**:
   - Inspeccionar estructura de directorios (`src/`, `apps/`, `domain/`, `core/`, `modules/`, `infra/`).
   - Identificar el Lenguaje Ubicuo (*Ubiquitous Language*) y los límites de contexto (Bounded Contexts).
   - Extraer contratos de API (OpenAPI/Swagger, controladores, rutas, endpoints) y eventos de mensajería (AMQP, Kafka, Redis PubSub).
2. **Construcción del Inventario de Capacidades (`system-capabilities.md`)**:
   - Documentar exhaustivamente lo que el sistema **YA HACE** por módulo.
   - Definir la matriz de consulta rápida para responder si una capacidad existe antes de generar nuevas historias, previniendo duplicidades y ahorrando contexto a los agentes.

---

### Paso 2: Especificación Formal de Requerimientos (`functional-requirements.md`)
Bajo el estándar **IEEE 830 / ISO/IEC/IEEE 29148**:
1. **Requerimientos Funcionales (`RF-*`)**:
   - Para cada requerimiento documentar:
     - **ID Único**: `RF-[MODULO]-[NUMERO]` (ej. `RF-AUTH-001`, `RF-BILL-001`).
     - **Módulo / Contexto**: Bounded Context al que pertenece.
     - **Precondiciones**: Estado requerido del sistema o actor.
     - **Entradas**: Parámetros, tipos, cabeceras HTTP y formatos exactos.
     - **Procesamiento**: Lógica paso a paso, validaciones e invariantes aplicadas.
     - **Salidas**: Respuestas, códigos HTTP y payloads JSON esperados.
     - **Postcondiciones**: Cambios en bases de datos o eventos emitidos.
     - **Criterios de Aceptación (Gherkin)**: Escenarios Given/When/Then verificables.
2. **Requerimientos No Funcionales (`RNF-*`) bajo FURPS+**:
   - **Functionality / Security**: Cifrado TLS, HMAC, JWT UTC, saneamiento.
   - **Usability**: Formato estándar de errores (RFC 7807 Problem Details).
   - **Reliability**: Disponibilidad $\ge 99.9\%$, idempotencia en transacciones, colas con DLQ.
   - **Performance**: Latencias P95/P99 en milisegundos, throughput RPS y estrategias de cache.
   - **Supportability & Constraints**: Arquitectura limpia sin acoplamiento, observabilidad (`/metrics`), ramas Git `{type}/INT-{id}/{name}` $\le 80$ caracteres.

---

### Paso 3: Catálogo de Historias de Usuario & Marco Ágil (`user-stories-catalog.md`)
1. **Historias bajo Principios INVEST**:
   - Redactar cada historia en formato canónico:
     > **Como** [rol del usuario o actor del sistema],  
     > **quiero** [capacidad o acción técnica],  
     > **para** [beneficio o valor de negocio medible].
   - Validar que sea **I**ndependiente, **N**egociable, **V**aliosa, **E**stimable, **S**mall (pequeña para 1 ticket `INT-*`) y **T**esteable.
2. **Acuerdos de Calidad SCRUM**:
   - **DoR (Definition of Ready)**: Tarea analizada, criterios Gherkin claros, rama Git $\le 80$c y aprobación del humano en puerta `ask_question`.
   - **DoD (Definition of Done)**: Código implementado, build limpio (`/warnaserror`), tests unitarios al 100%, trazabilidad R $\leftrightarrow$ Tests y `verify.sh` exitoso.
3. **Prácticas de Extreme Programming (XP)**:
   - Integrar TDD (Rojo $\to$ Verde $\to$ Refactor), Refactorización continua y Pair Agentic Coding.

---

### Paso 4: Generar Diagramas del Modelo C4 (Industrial Grade)
En `project-docs/knowledge/c4-model.md`, redactar con sintaxis **Mermaid estricta** (con textos y aliases entrecomillados):
1. **C4 Nivel 1 — Contexto del Sistema (System Context C1)**: Actores, el sistema central y sistemas externos con sus protocolos.
2. **C4 Nivel 2 — Contenedores (Container Diagram C2)**: SPA/Web, API Gateway, Microservicios, PostgreSQL, Redis, RabbitMQ.
3. **C4 Nivel 3 — Componentes (Component Diagram C3)**: Radiografía interna del contenedor principal: Routers, Casos de Uso/Handlers, Interfaces de Dominio y Repositorios.

---

### Paso 5: Generar Diagramas UML Exhaustivos
En `project-docs/knowledge/uml-diagrams.md`:
1. **Diagrama de Clases de Dominio (Class Diagram)**: Entidades raíz, Value Objects, visibilidad (`+`, `-`), tipos de retorno y multiplicidades exactas (`"1"`, `"0..1"`, `"1..*"`).
2. **Diagramas de Secuencia Transaccionales (Sequence Diagrams)**: Al menos 2 flujos críticos con bloques `alt / else / opt`, validaciones HMAC, idempotencia y fallbacks.
3. **Diagrama de Casos de Uso (Use Case Diagram)**: Actores primarios, casos de uso centrales y relaciones `<<include>>` / `<<extend>>`.

---

### Paso 6: Catálogo Formal de Reglas de Negocio (`BR-*`)
En `project-docs/knowledge/business-rules.md`:
- Catalogar reglas con ID único `BR-[MODULO]-[NUMERO]` (ej. `BR-BILL-001`).
- Definir severidad (`Crítica` o `Alta`), módulo, descripción matemática/lógica e invariantes de excepción.

---

### Paso 7: Matriz de Servicios Externos & Guardrails Anti-Sesgo
1. En `project-docs/knowledge/external-services.md`:
   - Catalogar pasarelas, bases de datos, brokers, auth providers, variables de entorno requeridas y políticas de failover/DLQ.
2. En `project-docs/knowledge/coding-standards.md`:
   - Convenciones de nomenclatura y patrones arquitecturales obligatorios.
   - **Guardrails Estrictos Anti-Alucinación**: Lista explícita de librerías canónicas y paquetes prohibidos para impedir alucinaciones de modelos de lenguaje.

---

### Paso 8: Documentación Modular Granular
Para cada Bounded Context identificado:
- Crear `project-docs/knowledge/modules/{modulo}/`.
- Redactar `module-spec.md` (responsabilidades y contratos), `rules.md` (invariantes locales) y `sequence.md` (flujo detallado).

---

### Paso 9: Consolidación y Sincronización Automática
1. Generar o actualizar `project-docs/knowledge/knowledge-index.json`.
2. **Ejecutar obligatoriamente**:
   ```bash
   node project-docs/sync-data.js
   ```
   Esto actualiza `data-fallback.js` con todos los archivos `.md` escaneados y recompila el bundle para reflejar de inmediato la documentación viva en el tablero visual tanto en local como por servidor.

---

## Protocolo de Mantenimiento Incremental (Docs-as-Code)

> [!TIP]
> **Modificaciones Futuras de Reglas de Negocio o Requerimientos**:  
> Si una regla de negocio o requerimiento cambia más adelante, **NO es necesario re-analizar todo el proyecto**.  
> Simplemente edita el archivo correspondiente en `project-docs/knowledge/` (`business-rules.md`, `functional-requirements.md` o el módulo en `modules/{modulo}/`) y ejecuta `node project-docs/sync-data.js`.
> Los agentes y desarrolladores leerán automáticamente la regla actualizada en su siguiente invocación.
