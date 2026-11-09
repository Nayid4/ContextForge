---
id: "DOC-ARCH-PATTERNS"
title: "Diagnóstico AS-IS de Arquitectura, Flujos de Datos y Catálogo de Patrones"
collection: "engineering"
parent: "c4-model.md"
owner: "leader"
module: "global"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-03"
tags: ["architecture-as-is","design-patterns","gof","screaming-architecture","data-flows"]
labels: ["architecture-as-is","design-patterns","gof","screaming-architecture","data-flows","engineering"]
---

# Diagnóstico AS-IS de Arquitectura, Flujos de Datos y Catálogo de Patrones

> [!NOTE]
> Diagnóstico forense de la arquitectura real implementada en el repositorio, dirección de dependencias, flujos de datos paso a paso y matriz de patrones de diseño verificados en el código fuente.

---

## 1. Diagnóstico del Estilo Arquitectónico Implementado (AS-IS)

### 1.1 Organización por Screaming Architecture
El repositorio implementa una **Arquitectura que Grita su Propósito (Screaming Architecture)**. El código no está organizado por capas genéricas superficiales (`controllers/`, `views/`), sino que separa claramente el motor del arnés, las configuraciones de agentes y los slices de dominio de la aplicación:

```text
harness_anginnering/
├── .agents/             # Dominio: Orquestación Antigravity 2.0 (Reglas, Roles y Skills)
├── .github/             # Dominio: Espejo GitHub Copilot (Instructions y Skills)
├── .opencode/           # Dominio: Fuente Canónica OpenCode (Rules y Skills fuente de verdad)
├── project-docs/        # Aplicación: Tablero de Seguimiento Interactivo & Docs-as-Code
│   ├── src/             # Frontend Modular en Vanilla JS + Tailwind v4 (Screaming Architecture)
│   │   ├── core/        # Núcleo técnico (store Observer Pub-Sub, router hash, event-bus, api-client, db)
│   │   ├── modules/     # Dominios de Negocio Screaming (Projects, Issues, Cycles, Pages, Harness)
│   │   ├── shared/      # Componentes UI reutilizables (Badge, BaseModal, Icons SVG, MasterLayout, utils)
│   │   └── features/    # Adaptadores y puentes de compatibilidad hacia atrás
│   ├── data/            # Persistencia Relacional SQLite WAL (harness.db)
│   ├── knowledge/       # Base de Conocimiento Soberana (Docs-as-Code)
│   ├── specs/           # Especificaciones Técnicas SDD, Subtareas Jira DEV/QA y Evidencias
│   └── dist/            # Bundle autocontenido IIFE (app.bundle.js)
└── tests/               # Suite de Verificación en 9 Niveles (Unit, E2E Smoke, Whitebox, Blackbox, System, Load, Acceptance Playwright, Sync)
```

### 1.2 Topología Macro y Persistencia Dual (SQLite WAL + Markdown en Disco)
- **Modo Servidor Local HTTP**: Servidor nativo de Node.js (`project-docs/serve.js`) con base de datos SQLite relacional (`harness.db`) en modo WAL, endpoints REST `/api/plane/*` y sincronización bidireccional automática hacia archivos Markdown.
- **Modo Offline-First Puro (`file:///`)**: Invariante `BR-DASH-001`. El tablero web puede abrirse con doble clic directamente en el navegador sin servidor web ni conexión a internet, alimentado por el módulo de respaldo `project-docs/data-fallback.js` sincronizado automáticamente por `sync-data.js`.

---

## 2. Catálogo Forense de Patrones de Diseño Detectados

| Patrón de Diseño | Categoría | Archivo / Componente | Propósito y Problema que Resuelve en el Arnés |
|---|---|---|---|
| **Reactive Store (Pub/Sub)** | Comportamiento | `project-docs/src/core/store.js` | Mantiene el estado inmutable del tablero y notifica reactivamente a los componentes suscritos ante cambios. |
| **Fallback Data Cache** | Resiliencia / Datos | `project-docs/src/core/api.js` y `data-fallback.js` | Garantiza funcionamiento 100% offline y silencia errores CORS cuando el navegador ejecuta bajo protocolo `file:///`. |
| **Triple Mirror Sync** | Arquitectónico | `.opencode/rules/skills-sync.md` y `sync-skills` | Mantiene una única fuente de verdad canónica (`.opencode/`) y replica unidireccionalmente hacia Copilot y Antigravity. |
| **Dual Editor Mode** | UI / Interacción | `project-docs/src/shared/MarkdownViewer.js` | Permite alternar bidireccionalmente entre edición Markdown textual y bloques visuales interactivos con scroll sincronizado. |
| **Component Factory / Renderer** | Creacional | `project-docs/src/shared/` (`Badge.js`, `Button.js`, `Icons.js`, `MermaidViewer.js`) | Genera elementos HTML vectoriales estándar con parametrización de estilos y sin dependencias de frameworks externos. |
| **Asynchronous Retry Guard** | Resiliencia | `project-docs/src/main.js` (`initMermaidDiagrams`) | Reintenta de forma controlada la inicialización de librerías CDN (Mermaid) para evitar diagramas en blanco si la carga tarda milisegundos. |
| **Separation of Concerns (SoC)** | Arquitectónico | `.agents/agents/` | Separa la especificación (`spec-author`), implementación (`implementer`) y revisión imparcial (`reviewer`) sin permitir edición cruzada. |

---

## 3. Flujos de Datos Extremo a Extremo (Data Flows)

### 3.1 Flujo 1: Sincronización y Carga de Datos en el Tablero
```text
1. Agente o Desarrollador modifica specs, reglas o feature_list.json
2. Ejecución de `node project-docs/sync-data.js`
3. `sync-data.js` lee archivos markdown, extrae metadatos, tiempo de lectura y diagramas Mermaid
4. Genera `project-docs/data-fallback.js` y actualiza `project-docs/dist/app.bundle.js`
5. Al abrir `index.html`:
   - Si es HTTP: `api.js` realiza fetch con cache-buster hacia los JSON
   - Si es file:///: `api.js` lee instantáneamente `window.__FALLBACK_DATA__` sin red
6. `store.js` recibe el payload, actualiza su estado interno y dispara re-render en las vistas activas
```

### 3.2 Flujo 2: Ciclo de Vida SDD Multi-Agente
```text
1. Usuario solicita nueva feature o bugfix
2. Subagente `leader` valida entorno y crea rama `{type}/INT-{id}/{name}` (≤80c)
3. Subagente `spec-author` redacta requirements.md, design.md y tasks.md
4. Puerta Humana obligatoria: `ask_question` congela ejecución hasta aprobación 100%
5. Subagente `implementer` escribe código de producción y tests automatizados
6. Subagente `reviewer` audita build, tests, cobertura y trazabilidad (sin editar código)
7. Puerta Humana de cierre: `ask_question` consulta si fusionar a rama base
```

### 3.3 Flujo 3: Cálculo de Métricas Editoriales (PageService & Reading Time)
En `PageService` (`page.service.js`), utilidades compartidas (`dates.js`) y sincronización SQLite (`sqlite-sync.js`), el cálculo de telemetría de lectura se rige por:
- **Conteo de Palabras**: `words = text.trim().split(/\s+/).filter(Boolean).length`.
- **Tiempo de Lectura**: `readingTimeMin = Math.max(1, Math.ceil(words / 200))` (velocidad canónica de 200 palabras por minuto con piso mínimo de 1 min).
- **Conteo de Caracteres y Párrafos**: `charCount = text.length`, `paragraphCount = text.split(/\n\s*\n/).filter(Boolean).length`.
