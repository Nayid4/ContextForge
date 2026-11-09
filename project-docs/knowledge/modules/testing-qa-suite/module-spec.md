---
id: "MOD-TEST-SPEC"
title: "Módulo: testing-qa-suite — Especificación & Tarjetas CRC"
collection: "engineering"
parent: null
owner: "leader"
module: "testing-qa-suite"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-03"
tags: ["testing","qa","verification","crc-cards","playwright"]
labels: ["testing","qa","verification","crc-cards","playwright","engineering"]
---

# Módulo: testing-qa-suite — Especificación & Tarjetas CRC

> [!NOTE]
> Bounded Context encargado de la suite de pruebas automatizadas en 8 niveles, runner de `project-docs/verify.sh` y automatización end-to-end con Playwright.

---

## 1. Alcance y Estado de Cobertura
- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`
- **Responsabilidad Primaria**: Garantizar que el arnés y el tablero pasen el 100% de los niveles de verificación antes de cualquier entrega o cierre de spec.

---

## 2. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)

| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |
|---|---|---|---|
| `VerifyRunner` | `<<TestRunner>>` | 1. Ejecutar las 8 fases de `project-docs/verify.sh`.<br/>2. Detener el pipeline ante cualquier fallo (código != 0).<br/>3. Recompilar y sincronizar datos automáticamente. | `ChildProcess`, `TestSuites` |
| `PlaywrightHarness` | `<<E2EFramework>>` | 1. Levantar servidor local en puerto dinámico.<br/>2. Ejecutar escenarios de aceptación en navegador real.<br/>3. Capturar capturas y trazas ante fallos. | `PlaywrightBrowser`, `DashboardApp` |

---

## 3. Contratos de Entrada y Salida
- **Comando Canónico**: `bash project-docs/verify.sh` o `npm run test:all`
- **Output**: 56 pruebas pasando (16 Unit, 5 ATDD Smoke, 12 Whitebox, 8 Blackbox, 7 System, 1 Load, 7 Acceptance E2E).


