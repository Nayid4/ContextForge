# Módulo: dashboard-visualizer (Tablero de Seguimiento Visual & Editor Dual)

> [!NOTE]
> Bounded Context responsable de la experiencia de usuario y visualización interactiva del arnés en `project-docs/`, implementado bajo Screaming Architecture con Tailwind CSS v4 y Three.js.

## 1. Responsabilidades del Módulo
- Métricas KPI de avance en tiempo real (features, bugs, avance ponderado).
- Biblioteca Editorial organizada en 6 estantes temáticos con tarjeta Hero destacada.
- Lector de artículos con columna de 780px centrada e interlineado de 1.75em.
- Tabla de Contenidos flotante (On-This-Page / TOC) con navegación por anclajes.
- Editor Dual ContextForge (Modo Markdown split-pane vs Modo Bloques Visuales) con scroll sincronizado proporcional anti-bloqueo.
- Constelación 3D espacial estructurada en 4 niveles piramidales en Three.js.
- Búsqueda Global Omnibox modal (`Ctrl+K` / `Cmd+K`).
- Soporte 100% offline mediante `data-fallback.js` (protocolo `file:///`) y servidor HTTP `serve.js`.

## 2. Tecnologías
- Vanilla JS (ES Modules)
- Tailwind CSS v4 (`@tailwindcss/browser@4`)
- Three.js r128
- Mermaid.js 10.9+
