---
id: "DOC-MODULES_DASHBOARD-VISUALIZER_RULES_MD"
title: "modules/dashboard visualizer/rules"
collection: "engineering"
parent: "modules/dashboard-visualizer/module-spec.md"
owner: "leader"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-09"
tags: []
labels: ["engineering"]
---

# Reglas de Negocio Invariantes: dashboard-visualizer

### BR-DASH-001: Compatibilidad 100% Offline (Zero-Server Fallback)
- **Severidad**: Crítica
- **Restricción**: El tablero debe poder abrirse con doble clic directamente en `project-docs/index.html` bajo el protocolo `file:///` sin requerir servidor HTTP ni fallar por CORS.
- **Comportamiento ante Violación**: `sync-data.js` genera obligatoriamente `project-docs/data-fallback.js` antes de cualquier compilación.

### BR-DASH-002: Scroll Sincronizado Proporcional Anti-Bloqueo
- **Severidad**: Alta
- **Fórmula**: $\text{Ratio} = \frac{\text{scrollTop}}{\text{scrollHeight} - \text{clientHeight}}$ con flags de exclusión mutua `isScrollingFromEditor` e `isScrollingFromPreview`.
- **Comportamiento ante Violación**: Bloqueo de scroll o bucles de eventos infinitos entre paneles.


