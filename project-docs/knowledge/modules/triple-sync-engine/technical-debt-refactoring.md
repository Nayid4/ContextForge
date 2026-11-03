---
id: MOD-SYNC-DEBT
title: "Módulo: triple-sync-engine — Deuda Técnica & Refactorización"
module: "triple-sync-engine"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["technical-debt", "sync-automation", "parity"]
---

# Módulo: triple-sync-engine — Deuda Técnica & Refactorización

---

## 1. Diagnóstico de Estado y Code Smells
- **Puntos Fuertes**: La regla `BR-SYNC-001` evita discrepancias entre herramientas de IA al forzar `.opencode/skills/` como único origen.
- **Riesgos Mitigados**:
  - Todo cambio en `SKILL.md` se replica de forma triple inmediata en `.opencode/`, `.github/` y `.agents/`.
