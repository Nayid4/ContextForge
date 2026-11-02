---
name: project-knowledge
description: Use when extracting deep project context, architectural analysis, C4 models, UML diagrams, business rules, external service catalogs, and modular documentation to feed AI agents with unbiased context.
---

# Skill: Extracción de Base de Conocimiento y Arquitectura del Proyecto

## Descripción
Realiza un análisis exhaustivo y sistemático de un proyecto para extraer su **Base de Conocimiento Canónica**. Su objetivo es capturar la arquitectura real implementada, diagramas de modelo C4 (Contexto, Contenedores, Componentes), diagramas UML (Clases, Secuencia, Casos de Uso), el catálogo completo de reglas de negocio, consumos de servicios externos y los estándares y forma de programar observados.

Esta información elimina el sesgo de las IAs y evita errores por falta de contexto, asegurando que todos los agentes (Google Antigravity, Claude Code, Open Code, GitHub Copilot, Codex) sigan las convenciones exactas del proyecto.

---

## Cuándo Usar Esta Skill
- Al iniciar a trabajar en un proyecto nuevo o heredado para darle contexto completo a la IA.
- Tras realizar cambios arquitecturales o agregar nuevos módulos.
- Antes de planificar features complejas o refactorizaciones de gran escala.
- Cuando la IA necesite consultar diagramas C4, diagramas de clases, secuencias o reglas de negocio para no alucinar.

---

## Salida Generada

La skill produce una estructura organizada dentro de `project-docs/knowledge/`:

```
project-docs/knowledge/
├── knowledge-index.json         # Índice estructurado para consumo por agentes y UI
├── c4-model.md                  # Diagramas C4: C1 Contexto, C2 Contenedores, C3 Componentes
├── uml-diagrams.md              # Diagramas UML: Clases, Secuencias críticas, Casos de Uso
├── business-rules.md            # Catálogo consolidado de reglas de negocio
├── external-services.md         # Catálogo de servicios externos y contratos
├── coding-standards.md          # Estándares, patrones y convenciones observadas
└── modules/                     # Documentación granular por módulo identificado
    ├── {modulo_1}/
    │   ├── module-spec.md       # Alcance, entidades, contratos DTO y servicios
    │   ├── rules.md             # Reglas de negocio exclusivas del módulo
    │   └── sequence.md          # Diagrama de secuencia del flujo principal
    └── {modulo_N}/
        ├── module-spec.md
        ├── rules.md
        └── sequence.md
```

---

## Procedimiento de Ejecución

### Paso 1: Inspección de Estructura y Código Fuente
1. **Identificar Módulos y Bounded Contexts**:
   - Analizar directorios principales (`src/`, `apps/`, `packages/`, `modules/`, etc.).
   - Detectar la separación de responsabilidades y agrupar por dominios funcionales.
2. **Identificar el Estilo Arquitectónico**:
   - Clean Architecture (Onion / Hexagonal): verificar si existen capas de Domain, Application e Infrastructure con inversión de dependencias.
   - Event-Driven Architecture (EDA): verificar si hay publicadores, consumidores, eventos de dominio o colas (RabbitMQ, Kafka, SQS).
   - Monolito Modular o Microservicios.

### Paso 2: Generar Diagramas del Modelo C4
En `project-docs/knowledge/c4-model.md`, generar con sintaxis **Mermaid**:
1. **Nivel 1 — Diagrama de Contexto del Sistema (System Context)**:
   - Usuarios, sistemas externos, pasarelas y el sistema principal con sus fronteras.
2. **Nivel 2 — Diagrama de Contenedores (Container Diagram)**:
   - Aplicaciones web, APIs backend, bases de datos relacionales/NoSQL, brokers de mensajería, servidores de cache.
3. **Nivel 3 — Diagrama de Componentes (Component Diagram)**:
   - Desglose interno de los controladores, servicios de aplicación, repositorios y adaptadores del contenedor principal.

### Paso 3: Generar Diagramas UML
En `project-docs/knowledge/uml-diagrams.md`, generar con sintaxis **Mermaid**:
1. **Diagrama de Clases de Dominio (Class Diagram)**:
   - Entidades principales, value objects, relaciones (composición, agregación, herencia), atributos clave y métodos de negocio.
2. **Diagramas de Secuencia (Sequence Diagrams)**:
   - Al menos 2 flujos críticos del proyecto (ej. Autenticación y Checkout/Procesamiento transaccional).
3. **Diagrama de Casos de Uso (Use Case Diagram)**:
   - Actores (Usuario, Administrador, Sistema Externo, Worker) e interacciones con el sistema.

### Paso 4: Extraer Reglas de Negocio
En `project-docs/knowledge/business-rules.md`:
- Extraer invariantes de dominio (ej. "Un carrito de compras expira a las 24h si el usuario es anónimo").
- Fórmulas de cálculo (ej. "Algoritmo de redondeo Banker's rounding IEEE 754 a dos decimales").
- Reglas de validación, estados permitidos y transiciones de ciclo de vida.
- Asignar a cada regla un identificador único (ej. `BR-AUTH-001`, `BR-BILL-002`).

### Paso 5: Catalogar Servicios Externos
En `project-docs/knowledge/external-services.md`:
- Documentar pasarelas de pago, servicios de email/SMS, proveedores OAuth, APIs de terceros.
- Indicar protocolo (REST, gRPC, Webhook), autenticación requerida, políticas de reintentos y timeouts.

### Paso 6: Documentar Estándares y Convenciones de Código
En `project-docs/knowledge/coding-standards.md`:
- Documentar convenciones de nomenclatura (PascalCase, camelCase, snake_case).
- Patrones de diseño implementados (Repository, CQRS, Idempotency, Circuit Breaker).
- Manejo de excepciones y tipos de resultado (Result pattern, DTOs, validaciones con Zod/FluentValidation).
- **Directrices anti-sesgo para agentes de IA**: Qué prácticas NO están permitidas y qué bibliotecas deben preferirse.

### Paso 7: Generar Documentación Modular
Para cada módulo identificado en el Paso 1:
- Crear carpeta `project-docs/knowledge/modules/{modulo}/`.
- Generar `module-spec.md`, `rules.md` y `sequence.md`.

### Paso 8: Generar el Índice `knowledge-index.json`
Consolidar el resumen en formato JSON para que el tablero de seguimiento (`project-docs/index.html`) pueda visualizar los diagramas y exploradores de conocimiento interactivamente.

---

## Verificación de Calidad
- Todos los diagramas Mermaid deben tener sintaxis válida sin errores de renderizado.
- Las referencias a archivos y módulos deben existir en el proyecto.
- Los estándares documentados deben reflejar el código existente real del repositorio.
