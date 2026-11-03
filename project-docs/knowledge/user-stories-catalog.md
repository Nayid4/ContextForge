# Catálogo de Historias de Usuario (INVEST, Scrum & XP)

> [!NOTE]
> Catálogo de Historias de Usuario bajo principios INVEST, Acuerdos de Calidad Scrum (DoR/DoD) y Prácticas Técnicas de Extreme Programming (XP).

---

## 1. Acuerdos de Calidad del Equipo

### Definition of Ready (DoR) — Criterios para iniciar una Feature
- [ ] La feature cuenta con nombre descriptivo en `snake_case` y rama `{type}/INT-{id}/{name}` $\le 80$ caracteres.
- [ ] Especificación técnica redactada por `spec-author` en `specs/{NNN}_{name}/` con requerimientos EARS, ADRs y checklist de tasks.
- [ ] Criterios de aceptación redactados en formato Given / When / Then (Gherkin).
- [ ] **Puerta Humana aprobada al 100%** mediante la herramienta `ask_question`.

### Definition of Done (DoD) — Criterios para cerrar una Feature
- [ ] Código de producción implementado y limpio según estándares de arquitectura.
- [ ] 100% de las pruebas automatizadas pasando en verde (`npm test`, `checks.test`).
- [ ] Tabla de trazabilidad $R \leftrightarrow \text{Tests}$ documentada en `progress/impl_{name}.md`.
- [ ] Auditoría independiente del subagente `reviewer` con veredicto **APROBADO** en `progress/review_{name}.md`.
- [ ] Datos sincronizados en el tablero con `node project-docs/sync-data.js`.
- [ ] Commit semántico creado en la rama de trabajo.

---

## 2. Historias de Usuario (INVEST)

### US-001: Orquestación Multi-Agente con Puertas Humanas
- **Como** líder de ingeniería de software,
- **Quiero** que el arnés coordine agentes especializados (`leader`, `spec-author`, `implementer`, `reviewer`) con pausas obligatorias `ask_question`,
- **Para** asegurar que ninguna línea de código se escriba sin spec aprobado ni se fusione sin revisión independiente de calidad.
- **Criterios de Aceptación (Gherkin)**:
  - *Dado* que se inicia una nueva tarea `INT-001`,
  - *Cuando* el subagente `spec-author` termina los requerimientos,
  - *Entonces* el sistema se detiene y solicita aprobación explícita al usuario humano antes de invocar al `implementer`.

### US-002: Sincronización Triple de Skills
- **Como** desarrollador políglota de IA (Google Antigravity, OpenCode, Copilot),
- **Quiero** que cualquier cambio en `.opencode/skills/` se replique automáticamente a `.github/` y `.agents/`,
- **Para** contar con las mismas 18 capacidades de ingeniería sin importar la herramienta de IA que utilice.
- **Criterios de Aceptación (Gherkin)**:
  - *Dado* que se crea una nueva skill en `.opencode/skills/`,
  - *Cuando* se ejecuta `/sync-skills`,
  - *Entonces* se crean copias idénticas en `.github/skills/` y `.agents/skills/` con paridad total de frontmatter.

### US-003: Biblioteca Editorial con Lector ContextForge y Editor Dual
- **Como** arquitecto de sistemas,
- **Quiero** una interfaz web con biblioteca por estantes temáticos, columna de lectura de 780px y editor dual Markdown/Bloques,
- **Para** consultar y editar la documentación técnica del arnés con alta legibilidad y scroll sincronizado.
- **Criterios de Aceptación (Gherkin)**:
  - *Dado* que abro `project-docs/index.html` en el navegador,
  - *Cuando* selecciono un documento de arquitectura,
  - *Entonces* se visualiza en formato editorial con TOC lateral y al pulsar `Modo Editor` puedo editar directamente en bloques visuales o Markdown.

### US-004: Búsqueda Global Omnibox con Atajo Ctrl+K
- **Como** usuario del tablero,
- **Quiero** abrir un buscador modal omnibox presionando `Ctrl+K` o `Cmd+K`,
- **Para** localizar en milisegundos tareas (`INT-*`), documentos de arquitectura, reglas de negocio (`BR-*`) o módulos.
- **Criterios de Aceptación (Gherkin)**:
  - *Dado* que estoy en cualquier pestaña del tablero,
  - *Cuando* presiono `Ctrl+K`,
  - *Entonces* se abre el modal Omnibox permitiendo navegación por teclado y selección inmediata de resultados.

### US-005: Suite de Pruebas Automatizadas Nativas
- **Como** ingeniero de QA,
- **Quiero** ejecutar pruebas unitarias y de aceptación con `npm test` sin dependencias externas pesadas,
- **Para** verificar la integridad del arnés en menos de 500ms en entornos locales y pipelines CI/CD.
- **Criterios de Aceptación (Gherkin)**:
  - *Dado* que ejecuto `npm test`,
  - *Cuando* se evalúan los tests de serialización, lectura y reglas de ramas,
  - *Entonces* el 100% de las aserciones pasan en verde sin advertencias.
