---
id: "DOC-EXTERNAL-SERVICES_MD"
title: "external services"
collection: "engineering"
parent: null
owner: "leader"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-09"
tags: []
labels: ["general"]
---

# Catálogo de Integraciones y Servicios Externos

> [!NOTE]
> Matriz de servicios adyacentes, protocolos de comunicación, variables de configuración y políticas de contingencia del arnés de ingeniería.

---

## Matriz de Servicios y Dependencias

| Servicio / Herramienta | Tipo | Protocolo | Variables Requeridas | Política de Contingencia / Failover |
| :--- | :--- | :--- | :--- | :--- |
| **Google Antigravity** | Agentic IDE & CLI | Native Subagent Protocol / IPC | N/A (Entorno IDE) | Operar mediante CLI estándar o shell local |
| **OpenCode** | CLI Engine | CLI Exec / Local JSON | N/A | Lectura directa de `.opencode/rules/` |
| **GitHub Copilot** | AI Assistant | Instructions / Markdown | N/A | Carga desde `.github/instructions/` |
| **Git / GitHub** | Control de Versiones | CLI Git / HTTPS / SSH | `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL` | Modo local desconectado en rama `{type}/INT-*` |
| **Tailwind CSS v4** | CSS Runtime | CDN `@tailwindcss/browser@4` | N/A | Estilos base incrustados en `<style>` |
| **Three.js** | 3D Graphics Engine | CDN `three.min.js r128` | N/A | Vista alternativa en Árbol SVG y Grafo DAG |
| **Mermaid.js** | Diagram Engine | CDN `mermaid.min.js v10` | N/A | Previsualización de código Mermaid con botón de copia |

---

## Servicios Locales y Puertos de Red

| Servicio | Puerto | URL Local | Descripción & Uso |
|---|---|---|---|
| **Plane Local Instance** | `3000` | `http://localhost:3000/` | Instancia local de Plane de referencia para auditoría visual y paridad UI/UX. |
| **Harness Dashboard & API** | `3333` | `http://127.0.0.1:3333/` | Servidor Node.js (`serve.js`) para API REST SQLite (`/api/plane/*`) y cliente web. |


