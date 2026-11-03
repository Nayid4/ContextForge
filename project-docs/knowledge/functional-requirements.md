# Especificación de Requerimientos del Sistema (SRS IEEE 830 / ISO 29148)

> [!NOTE]
> Requerimientos Funcionales (`RF-*`) y Requerimientos No Funcionales (`RNF-*`) bajo clasificación FURPS+ para el Arnés de Ingeniería SDD.

---

## 1. Requerimientos Funcionales (`RF-*`)

### Módulo: agent-orchestrator
- **RF-ORCH-001**: El orquestador DEBE validar que toda rama de trabajo cumpla con la expresión regular `^(feature|bugfix)/INT-\d{3,4}/[a-z0-9_]+$` y una longitud menor o igual a 80 caracteres.
- **RF-ORCH-002**: El orquestador DEBE invocar de manera aislada al subagente `spec-author` con workspace heredado (`Workspace: "inherit"`) para redactar la especificación formal antes de escribir código.
- **RF-ORCH-003**: El orquestador DEBE pausar la ejecución mediante `ask_question` para solicitar aprobación humana del spec generado antes de permitir el inicio de la fase de implementación.
- **RF-ORCH-004**: Al concluir la implementación, el orquestador DEBE invocar de forma independiente al subagente `reviewer` para emitir veredicto formal de calidad y trazabilidad.

### Módulo: triple-sync-engine
- **RF-SYNC-001**: El motor DEBE comparar el árbol de skills en `.opencode/skills/` contra `.github/skills/` y `.agents/skills/` para identificar diferencias de contenido o metadatos.
- **RF-SYNC-002**: La skill `/sync-skills` DEBE replicar archivos de forma no destructiva preservando el frontmatter YAML y el formato Markdown.

### Módulo: knowledge-engine
- **RF-KNOW-001**: La skill `/project-knowledge` DEBE realizar el descubrimiento en 2 fases para evitar desbordamiento de contexto (escaneo topológico previo a inspección de código).
- **RF-KNOW-002**: El generador de diagramas DEBE sanitizar identificadores y textos en sintaxis Mermaid estricta con comillas dobles para evitar fallos del parser en tiempo de ejecución.

### Módulo: dashboard-visualizer
- **RF-DASH-001**: El tablero DEBE presentar una biblioteca organizada en 6 estantes temáticos con tarjeta Hero destacada y filtros rápidos por categoría.
- **RF-DASH-002**: El lector de artículos DEBE renderizar el documento con columna centrada a 780px, interlineado de 1.75em, anclas de encabezados y barra lateral flotante con la Tabla de Contenidos (TOC).
- **RF-DASH-003**: El editor dual DEBE permitir alternar instantáneamente entre modo Markdown split-pane y modo Bloques Visuales ContextForge con scroll sincronizado proporcional y reordenamiento de tarjetas.
- **RF-DASH-004**: El buscador Omnibox DEBE responder al atajo `Ctrl+K` o `Cmd+K` y permitir búsqueda en tiempo real sobre tareas, documentos, reglas e índices.
- **RF-DASH-005**: La vista 3D DEBE estructurar los nodos en 4 niveles piramidales en Three.js con anillos translúcidos y distribución armónica radial sin solapamiento de etiquetas.

### Módulo: testing-qa-suite
- **RF-TEST-001**: La suite DEBE ejecutar pruebas unitarias automatizadas mediante el ejecutor nativo `node --test` reportando resultados en menos de 500ms.
- **RF-TEST-002**: La suite DEBE incluir pruebas de aceptación tipo smoke para validar la integridad del bundle web y la compatibilidad con el protocolo `file:///`.

---

## 2. Requerimientos No Funcionales (`RNF-*`) bajo FURPS+

### Functionality (Seguridad e Integridad)
- **RNF-SEC-001**: Prohibición estricta de credenciales, tokens de API o connection strings hardcodeados en los archivos de especificación o base de conocimiento.
- **RNF-SEC-002**: Aislamiento estricto de subagentes impidiendo que el subagente `reviewer` modifique código de producción o pruebas.

### Usability (Experiencia Editorial & Heurísticas)
- **RNF-USAB-001**: Cumplimiento de WCAG AAA en contraste de texto y soporte nativo de modo claro y oscuro sin parpadeo (FOUC).
- **RNF-USAB-002**: Búsqueda con debouncing para no bloquear la digitación del usuario en inputs de búsqueda (180ms - 260ms).

### Reliability (Confiabilidad & Cero-Server)
- **RNF-RELI-001**: Disponibilidad offline del 100% de la documentación y tablero interactivo mediante `data-fallback.js` sin requerir servidor HTTP ni sufrir bloqueos CORS.
- **RNF-RELI-002**: Gestión adecuada del ciclo de vida en Three.js con limpieza completa de memoria (`mount`/`unmount`) al cambiar de pestaña para prevenir fugas de memoria.

### Performance (Rendimiento)
- **RNF-PERF-001**: Tiempo de carga inicial del tablero web inferior a 800ms en modo local.
- **RNF-PERF-002**: Ejecución de la suite completa de pruebas unitarias en menos de 500ms.

### Supportability (Mantenibilidad & Extensibilidad)
- **RNF-SUPP-001**: Arquitectura modular Screaming Architecture en Vanilla JS sin dependencias de frameworks pesados de frontend (React, Vue, Angular) en tiempo de ejecución.
- **RNF-SUPP-002**: Agnóstico al lenguaje: el arnés debe poder auditar e interactuar con proyectos en Node.js, .NET, Python, Go y Rust.
