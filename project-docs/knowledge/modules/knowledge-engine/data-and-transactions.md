---
id: MOD-KNOW-DATA
title: "Módulo: knowledge-engine — Datos & Transacciones"
module: "knowledge-engine"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["data", "transactions", "knowledge-graph", "json-index"]
---

# Módulo: knowledge-engine — Datos & Transacciones

---

## 1. Esquema del Grafo de Conocimiento (`knowledgeGraph`)
El archivo `knowledge-index.json` persiste:
- **`nodes`**: Entidades, Módulos, Tablas, Endpoints, Servicios Externos y Reglas `BR-*`.
- **`edges`**: Relaciones dirigidas:
  - `ENFORCES_RULE` (Módulo -> Regla)
  - `PERSISTS_IN` (Entidad -> Tabla)
  - `INTEGRATES_WITH` (Módulo -> Servicio Externo)
  - `TESTED_BY` (Requerimiento -> Test)

---

## 2. Consistencia en Disco
- La sincronización mediante `sync-data.js` genera escrituras atómicas en `knowledge-index.json` y `data-fallback.js`.
