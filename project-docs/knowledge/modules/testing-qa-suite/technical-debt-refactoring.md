---
id: "MOD-TEST-DEBT"
title: "Módulo: testing-qa-suite — Deuda Técnica & Refactorización"
collection: "engineering"
parent: "modules/testing-qa-suite/module-spec.md"
owner: "leader"
module: "testing-qa-suite"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-03"
tags: ["technical-debt","qa","continuous-integration"]
labels: ["technical-debt","qa","continuous-integration","engineering"]
---

# Módulo: testing-qa-suite — Deuda Técnica & Refactorización

---

## 1. Diagnóstico de Estado y Code Smells
- **Puntos Fuertes**: Cobertura amplia en 8 niveles, runner nativo sin dependencias pesadas de Jest/Mocha.
- **Riesgos Mitigados**:
  - Se configuró el puerto dinámico de `serve.js` a `127.0.0.1:3333` con flag `NO_OPEN` para evitar ventanas emergentes automáticas durante las pruebas.
  - Se añadieron selectores ID estrictos en Playwright para evitar violaciones de strict mode.


