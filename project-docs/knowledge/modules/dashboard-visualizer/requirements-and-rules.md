---
id: MOD-DASH-RULES
title: "Módulo: dashboard-visualizer — Requerimientos & Reglas de Negocio"
module: "dashboard-visualizer"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["requirements", "rules", "anti-emoji", "offline-first"]
---

# Módulo: dashboard-visualizer — Requerimientos & Reglas de Negocio

---

## 1. Requerimientos Funcionales Formales (IEEE 830)

### `RF-DASH-001`: Compatibilidad Offline Nativa (`file:///`)
- **Enunciado Formal**: Cuando el usuario abra `project-docs/index.html` bajo el protocolo `file:///`, el sistema **debe** cargar los datos desde `window.__FALLBACK_DATA__` sin ejecutar llamadas `fetch()` que disparen políticas de bloqueo CORS en el navegador.

### `RF-DASH-002`: Editor Dual con Scroll Sincronizado
- **Enunciado Formal**: Cuando el usuario active el modo editor en cualquier documento de la base de conocimiento, el sistema **debe** renderizar en paralelo el área de texto Markdown y la previsualización en vivo, manteniendo el scroll sincronizado proporcionalmente en ambas columnas sin bucles infinitos de eventos.

### `RF-DASH-003`: Erradicación Total de Emojis
- **Enunciado Formal**: La interfaz de usuario **no debe** contener caracteres emoji unicode en botones, badges, modales o encabezados, empleando exclusivamente funciones de iconografía SVG vectorial de `Icons.js`.

---

## 2. Reglas de Negocio Locales (BR-*)

| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |
|---|---|---|---|---|
| `BR-DASH-001` | Crítica | `protocol == 'file:' ==> useFallbackData && bypassFetch` | `project-docs/src/core/api.js` | Silencia errores CORS |
| `BR-DASH-002` | Alta | `count(emojiChars) == 0` en código fuente y HTML | `tests/unit/ui-anti-emoji.test.js` | Falla test unitario |
| `BR-DASH-003` | Alta | `tabSwitch ==> destroyThreeScene && resetListeners` | `project-docs/src/features/space-view-3d/` | Previene fugas de memoria OOM |
