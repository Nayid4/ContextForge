---
id: MOD-DASH-DEBT
title: "Módulo: dashboard-visualizer — Deuda Técnica & Refactorización"
module: "dashboard-visualizer"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["technical-debt", "refactoring", "ux-redesign", "clean-code"]
---

# Módulo: dashboard-visualizer — Deuda Técnica & Refactorización

---

## 1. Diagnóstico de Estado y Code Smells Resueltos
- **Code Smell 1 (Resuelto)**: Errores CORS en consola al abrir `index.html` vía `file:///` -> Resuelto bifurcando inmediatamente en `api.js` para usar `window.__FALLBACK_DATA__`.
- **Code Smell 2 (Resuelto)**: Los diagramas C4 no tenían código en `knowledge-index.json` -> Resuelto integrando `extractDiagrams` en `sync-data.js`.
- **Code Smell 3 (En Refactorización Actual)**: La Base de Conocimiento mezclaba documentos generales y archivos de módulos en una sola lista sin jerarquía clara -> Se resuelve implementando el nuevo switcher de 3 perspectivas: **Visión Global (01–12)**, **Módulos & Bounded Contexts** y **Dossier Maestro (`MASTER-PROJECT-KNOWLEDGE.md`)**.

---

## 2. Plan Táctico de Modernización
1. **Paso 1**: Implementar el switcher de navegación de 3 niveles en `KnowledgeBase.js`.
2. **Paso 2**: Habilitar previsualización y descarga del Megadocumento Maestro.
