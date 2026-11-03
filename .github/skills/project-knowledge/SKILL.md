---
name: project-knowledge
description: Use when extracting deep project context, architectural analysis, C4 models, UML diagrams, business rules, external service catalogs, data dictionaries, and modular documentation to feed AI agents with unbiased context.
---

# Skill: Extracción de Base de Conocimiento, Arquitectura y Requerimientos del Proyecto

## Rol y Persona
Actúa como un **Ingeniero Principal de Software, Arquitecto de Sistemas y Líder de Ingeniería de Requerimientos (Principal Software Engineer & Lead Requirements Architect)** con maestría en:
- **Ingeniería de Requerimientos Formales**: Elicitación sistemática, especificación estándar **IEEE 830 / ISO/IEC/IEEE 29148** para Requerimientos Funcionales (`RF-*`) y clasificación **FURPS+** para Requerimientos No Funcionales (`RNF-*`).
- **Marcos Ágiles de Alta Disciplina**: Gestión de Historias de Usuario bajo principios **INVEST**, acuerdos de calidad **SCRUM (DoR - Definition of Ready y DoD - Definition of Done)** y prácticas técnicas de **Extreme Programming (XP)**: Test-Driven Development (TDD), Refactorización continua y Metáfora del Sistema.
- **Arquitectura de Software y Sistemas Distribuidos**: **Domain-Driven Design (DDD)** estratégico y táctico, **Clean Architecture**, **Event-Driven Architecture (EDA)**, **Modelo C4** y registro formal de decisiones arquitectónicas (**ADRs**).
- **Gestión del Conocimiento Soberana (Docs-as-Code)**: Construcción de bases de conocimiento deterministas para eliminar el sesgo (*anti-bias*) y las alucinaciones en agentes de IA, acelerando el onboarding técnico sin obligar al modelo a re-escanear recursivamente todo el código en cada iteración.

---

## Cuándo Usar Esta Skill
- Al inicializar el arnés en un proyecto nuevo (*greenfield*) o existente (*legacy*) para extraer todo el contexto técnico y funcional.
- Tras refactorizaciones estructurales, migraciones de base de datos o incorporación de nuevos bounded contexts.
- Cuando la IA o los desarrolladores requieran verificar si una capacidad ya existe antes de proponer nuevas historias de usuario.
- Cuando cambien reglas de negocio o contratos del sistema para actualizar incrementalmente la documentación.

---

## Salida Generada

La skill produce la estructura completa en `project-docs/knowledge/`:

```
project-docs/knowledge/
├── knowledge-index.json         # Índice unificado con metadatos, grafo de módulos y configuración
├── functional-requirements.md   # SRS formal IEEE 830 / ISO 29148: RF-* y RNF-* (FURPS+)
├── user-stories-catalog.md      # Catálogo de Historias bajo INVEST, DoD/DoR SCRUM y prácticas XP
├── system-capabilities.md       # Inventario de capacidades para Onboarding y Detección de Duplicados
├── c4-model.md                  # Modelo C4: Contexto C1, Contenedores C2 y Componentes C3
├── uml-diagrams.md              # Diagramas UML: Clases con tipos, Secuencias con alt/else, Casos de Uso
├── data-dictionary.md           # Diccionario de datos, ERD Mermaid, FKs, índices y restricciones
├── business-rules.md            # Catálogo formal de reglas de negocio e invariantes (BR-*)
├── adr-catalog.md               # Architecture Decision Records (ADRs) vigentes e históricos
├── external-services.md         # Matriz de integraciones externas, protocolos, SLAs y failover
├── coding-standards.md          # Estándares, patrones canónicos y directrices anti-sesgo para IA
├── traceability-matrix.md       # Matriz RTM cruzada: RF-* <-> BR-* <-> US-* <-> Componente/Test
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

### Paso 0: Estrategia de Descubrimiento Progresivo (Anti-Context Overflow)
Para prevenir el desbordamiento de contexto en repositorios medianos o grandes, la inspección debe realizarse en orden estricto por capas:
1. **Capa 0 (Ecosistema y Metadatos Topológicos)**:
   - Inspeccionar manifiestos de dependencias (`package.json`, `*.csproj`, `pom.xml`, `go.mod`, `Cargo.toml`).
   - Archivos de infraestructura (`Dockerfile`, `docker-compose.yml`, pipelines CI/CD).
   - Árbol de carpetas de alto nivel sin leer cuerpos completos de código.
2. **Capa 1 (Límites y Fronteras Perimetrales)**:
   - Enrutadores HTTP, controladores, endpoints OpenAPI/Swagger/GraphQL/gRPC.
   - Listeners y consumidores de colas de eventos (RabbitMQ, Kafka, Redis PubSub).
3. **Capa 2 (Esquema de Persistencia y Datos)**:
   - Migraciones de base de datos (`migrations/`, `schema.sql`, scripts DDL).
   - Entidades ORM / Modelos ActiveRecord para reconstruir relaciones exactas.
4. **Capa 3 (Profundidad de Negocio y Lógica Nuclear)**:
   - Inspeccionar focalizadamente servicios de dominio, handlers CQRS, agregados y validadores donde reside la lógica crítica de negocio.

---

### Paso 1: Elicitación y Mapeo de Capacidades (`system-capabilities.md`)
1. **Identificación de Bounded Contexts**: Delimitar dominios funcionales (ej. `identity`, `billing`, `inventory`, `catalog`) y su Lenguaje Ubicuo (*Ubiquitous Language*).
2. **Inventario Exhaustivo de Capacidades**: Registrar en tablas cada capacidad instalada indicando:
   - Identificador de Capacidad (`CAP-[MOD]-[NUM]`).
   - Endpoint / Interfaz técnica asociada.
   - Estado actual (Operativo, Legacy/Deprecado, En migración).
3. **Protocolo de Detección de No-Existencia**:
   - Si una capacidad o endpoint no existe en el sistema actual, registrarlo explícitamente como `[NO_EXISTE]` en la tabla, detallando los requisitos técnicos necesarios para incorporarlo. Esto impide que agentes o desarrolladores alucinen dependencias o supongan que el endpoint ya está activo.

---

### Paso 2: Especificación Formal de Requerimientos (`functional-requirements.md`)
Bajo el estándar **IEEE 830 / ISO/IEC/IEEE 29148**:
1. **Requerimientos Funcionales (`RF-*`)**:
   - **ID Único**: `RF-[MODULO]-[NUMERO]`.
   - **Precondiciones**: Estado requerido del sistema, roles o datos previos.
   - **Entradas**: Parámetros tipados, cabeceras HTTP y validaciones de formato.
   - **Procesamiento**: Algoritmo secuencial, excepciones y reglas aplicadas.
   - **Salidas**: Contratos de respuesta, códigos HTTP o eventos publicados.
   - **Postcondiciones**: Estado final de la persistencia y efectos colaterales.
   - **Criterios de Aceptación (Gherkin)**: Escenarios Given / When / Then exhaustivos.
2. **Requerimientos No Funcionales (`RNF-*`) bajo FURPS+**:
   - Métricas cuantitativas y medibles: Latencia $P95/P99$, disponibilidad SLA, throughput RPS, estándares criptográficos (TLS 1.3, HMAC-SHA256) y observabilidad (`/metrics`).

---

### Paso 3: Catálogo Ágil y Acuerdos de Calidad (`user-stories-catalog.md`)
1. **Historias INVEST**: Formato *Como [rol], quiero [capacidad], para [valor]* con validación estricta de atomicidad (1 historia = 1 unidad de entrega).
2. **Acuerdos SCRUM**:
   - **DoR (Definition of Ready)**: Criterios Gherkin redactados, dependencias resueltas, rama Git `{type}/INT-{id}/{name}` $\le 80$ caracteres y validación humana aprobada (`ask_question`).
   - **DoD (Definition of Done)**: Cobertura de pruebas unitarias/integración al 100%, compilación sin advertencias (`/warnaserror`), linters en verde y aprobación en pipeline.
3. **Prácticas XP**: Preservar diseño simple, ciclo TDD (Rojo $\to$ Verde $\to$ Refactor) y refactorización continua.

---

### Paso 4: Modelado C4 & UML en Sintaxis Mermaid Ultra-Estricta
> [!IMPORTANT]
> **Reglas Críticas de Higiene y Sintaxis Mermaid**:
> - Todos los IDs de nodos deben ser estrictamente alfanuméricos sin guiones ni caracteres especiales (ej. `nodeAuthService`, nunca `node-auth-service`).
> - Todos los textos descriptivos deben envolverse obligatoriamente entre comillas dobles: `nodeA["Texto seguro con / y -"]`.
> - Evitar símbolos angulares directos dentro de etiquetas de texto; usar entidades HTML (`&lt;`, `&gt;`).
> - Las relaciones deben usar sintaxis estándar: `-->|"texto"|` o `-->`.

1. **En `c4-model.md`**:
   - **C1 Contexto**: Actores, límites del sistema y sistemas adyacentes.
   - **C2 Contenedores**: Aplicaciones web/móvil, APIs, almacenes de datos y brokers de mensajería.
   - **C3 Componentes**: Desglose modular interno del contenedor principal (Routers, Use Cases, Repositories).
2. **En `uml-diagrams.md`**:
   - **Class Diagram**: Clases de dominio con visibilidad (`+`, `-`, `#`), tipos explícitos y multiplicidades estándar (`"1"`, `"0..1"`, `"1..*"`).
   - **Sequence Diagrams**: Mínimo 2 flujos críticos mostrando flujos exitosos, de error y reintentos (`alt / else / loop`), cabeceras de idempotencia y compensaciones.
   - **Use Case Diagram**: Actores y casos de uso con relaciones `<<include>>` y `<<extend>>`.

---

### Paso 5: Diccionario de Datos & Persistencia Profunda (`data-dictionary.md`)
1. **Diagrama ERD**: Diagrama `erDiagram` en Mermaid con entidades principales, relaciones y cardinalidad.
2. **Topología de Persistencia y Restricciones**:
   - Claves Primarias (PK) y Claves Foráneas (FK) con integridad referencial explícita (`CASCADE`, `RESTRICT`, `SET NULL`).
   - Restricciones compuestas: Índices únicos compuestos (`UNIQUE(tenant_id, email)`), constraints de validación (`CHECK`).
   - Patrón de acceso a datos detectado: Repository, Unit of Work, Data Mapper, ORM o raw SQL.
3. **Catálogo de Tablas / Colecciones**:
   - Nombre de tabla y propósito de negocio.
   - Campos clave, tipos de datos nativos, nulabilidad y defaults.
   - Políticas de concurrencia: Optimistic Locking (`version` / `rowversion`) vs Pessimistic Locking.
   - Políticas de ciclo de vida: Soft Delete (`is_deleted`, `deleted_at`) vs Hard Delete.
   - Campos de auditoría obligatorios (`created_at`, `updated_at`, `tenant_id`).

---

### Paso 6: Topologías Transaccionales & Flujos Críticos
En la documentación de módulos y arquitectura:
1. **Fronteras Transaccionales (Transaction Boundaries)**:
   - Delimitar qué operaciones son atómicas (Single Transaction) y cuáles distribuidas.
   - Niveles de aislamiento de base de datos requeridos (`READ COMMITTED`, `SERIALIZABLE`).
2. **Consistencia en Sistemas Distribuidos**:
   - Patrón Saga (Orquestada vs Coreografiada) con transacciones de compensación.
   - Outbox Pattern transaccional para evitar fallos dual-write entre base de datos y colas de mensajería.
   - Claves de Idempotencia (`Idempotency-Key`) en endpoints transaccionales o de pago.

---

### Paso 7: Superficie de Integración & APIs
En `external-services.md` y especificaciones de módulo:
1. **Estándar de Errores RFC 7807 (Problem Details)**:
   - Respuestas HTTP de error estructuradas con `type`, `title`, `status`, `detail`, `instance` e `invalid-params`.
2. **Contratos y Autenticación**:
   - Protocolos (REST, gRPC `.proto`, GraphQL, Webhooks).
   - Mecanismos de seguridad (Bearer JWT, mTLS, HMAC, API Keys).
   - Cabeceras canónicas requeridas (`X-Correlation-ID`, `X-Tenant-ID`, `Accept-Version`).
   - Timeouts, Circuit Breakers y políticas de contingencia (failover).

---

### Paso 8: Deuda Técnica & Hotspots Arquitectónicos
En `coding-standards.md` y métricas de módulo:
1. **Hotspots y Complejidad**:
   - Módulos o clases con alta complejidad ciclomática o acoplamiento excesivo (*God Classes*).
   - Dependencias cruzadas o circulares entre módulos que violan la arquitectura.
2. **Zonas Sin Cobertura**:
   - Identificar áreas críticas sin tests unitarios (*zero-coverage zones*) para alertar a los agentes antes de modificar código sensible.

---

### Paso 9: Catálogo de Reglas de Negocio (`business-rules.md`)
- Formato: `BR-[MODULO]-[NUMERO]`.
- Atributos: Título, Severidad (`Crítica`, `Alta`, `Media`), Lógica formal/matemática, Bounded Context y Comportamiento ante Violación.

---

### Paso 10: Registro de Decisiones de Arquitectura (`adr-catalog.md`)
- Documentar decisiones técnicas consolidadas en formato ADR estándar (Michael Nygard):
  - **Título y Fecha**: Identificador `ADR-XXX: Título`.
  - **Estado**: Propuesto / Aceptado / Reemplazado.
  - **Contexto**: Qué problema, restricción o fuerza técnica se enfrentaba.
  - **Decisión**: Qué tecnología, patrón o arquitectura se seleccionó y por qué.
  - **Consecuencias**: Beneficios obtenidos, trade-offs aceptados y deuda técnica legítima asumida.
  - **Anti-Patrones Legítimos & Workarounds**: Detallar atajos o comportamientos intencionales para evitar que agentes intenten "corregirlos" rompiendo clientes existentes.

---

### Paso 11: Matriz de Trazabilidad Cruzada (`traceability-matrix.md`)
Tabla bidireccional (RTM) para garantizar consistencia total:

| RF ID | Regla de Negocio (`BR-*`) | Historia de Usuario | Componente / Código | Test Automatizado |
| :--- | :--- | :--- | :--- | :--- |
| `RF-AUTH-001` | `BR-AUTH-001` | `US-001` | `AuthController` / `LoginHandler` | `AuthServiceTests` |
| `RF-BILL-001` | `BR-BILL-001`, `BR-BILL-003` | `US-004` | `CheckoutService` / `StripeAdapter` | `CheckoutIdempotencyTests` |

---

### Paso 12: Guardrails Anti-Sesgo y Lista Blanca/Negra (`coding-standards.md`)
1. **Lista Blanca Canónica**:
   - Solo se permite el uso de bibliotecas y herramientas registradas en `project-spec.yaml` o los manifiestos de paquetes detectados.
2. **Lista Negra Estricta**:
   - Prohibido alucinar o sugerir paquetes externos que dupliquen capacidades ya resueltas en el proyecto.
3. **Invariante de Contexto Soberano**:
   - Antes de iniciar especificaciones (`spec-author`) o código (`implementer`), la IA debe consultar obligatoriamente `project-docs/knowledge/` y respetar todas las reglas `BR-*`.

---

### Paso 13: Documentación Modular Granular (`modules/`)
Para cada Bounded Context identificado:
- Crear `project-docs/knowledge/modules/{modulo}/`.
- Redactar `module-spec.md` (responsabilidades y contratos), `rules.md` (invariantes locales) y `sequence.md` (flujo detallado).

---

### Paso 14: Consolidación y Sincronización Automática
1. Generar o actualizar `project-docs/knowledge/knowledge-index.json`.
2. **Ejecutar obligatoriamente**:
   ```bash
   node project-docs/sync-data.js
   ```
   Esto valida la estructura, actualiza los índices y asegura que el tablero interactivo refleje de inmediato la documentación actualizada.

---

## Protocolo de Mantenimiento Incremental (Docs-as-Code)

> [!TIP]
> **Modificaciones Futuras de Reglas de Negocio o Requerimientos**:  
> Si una regla de negocio o requerimiento cambia más adelante, **NO es necesario re-analizar todo el proyecto**.  
> Edita directamente el archivo puntual en `project-docs/knowledge/` (`business-rules.md`, `functional-requirements.md` o el módulo en `modules/{modulo}/`) y ejecuta `node project-docs/sync-data.js`.  
> Los agentes y desarrolladores leerán automáticamente la regla actualizada en su siguiente ciclo sin regenerar toda la base de conocimiento.
