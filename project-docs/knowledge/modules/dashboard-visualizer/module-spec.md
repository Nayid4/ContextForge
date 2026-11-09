---
id: "MOD-DASH-SPEC"
title: "Módulo: dashboard-visualizer — Especificación & Tarjetas CRC"
collection: "engineering"
parent: null
owner: "leader"
module: "dashboard-visualizer"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-03"
tags: ["dashboard","vanilla-js","tailwind-v4","three-js","dual-editor","crc-cards"]
labels: ["dashboard","vanilla-js","tailwind-v4","three-js","dual-editor","crc-cards","engineering"]
---

# Módulo: dashboard-visualizer — Especificación & Tarjetas CRC

> [!NOTE]
> Bounded Context encargado de la visualización web interactiva del arnés, métricas KPI, editor dual ContextForge, grafos de dependencias SVG y constelación 3D en Three.js con soporte offline nativo (`file:///`).

---

## 1. Alcance y Estado de Cobertura
- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`
- **Responsabilidad Primaria**: Renderizar el estado vivo del proyecto, permitir la edición Docs-as-Code en tiempo real, visualizar la arquitectura en diagramas interactivos y proveer navegación fluida sin emojis ni dependencias de frameworks pesados.

---

## 2. Lenguaje Ubicuo Local
- **Reactive Store**: Almacén central inmutable que gestiona el estado y notifica cambios a la vista.
- **Dual Editor**: Editor con paneles simultáneos de Markdown crudo y Bloques Visuales con sincronización proporcional de scroll.
- **Offline Fallback**: Respaldo en memoria inyectado por `data-fallback.js` para silenciar bloqueos CORS en `file:///`.
- **ThreeJS Constellation**: Representación astronómica 3D de las dependencias jerárquicas del proyecto.

---

## 3. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)

| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |
|---|---|---|---|
| `DashboardStore` | `<<StateStore>>` | 1. Mantener estado unificado (features, specs, conocimiento).<br/>2. Notificar a observadores registrados ante mutaciones.<br/>3. Filtrar y paginar datos reactivamente. | `SubscriberCallbacks`, `LocalStorageCache` |
| `MarkdownViewer` | `<<Renderer>>` | 1. Parsear sintaxis Markdown a HTML seguro.<br/>2. Renderizar alertas GitHub y tablas sticky.<br/>3. Convertir Markdown bidireccionalmente a bloques visuales. | `DOMPurify`, `MermaidViewer` |
| `SpaceView3D` | `<<Visualizer>>` | 1. Inicializar escena Three.js, cámara y luces.<br/>2. Renderizar constelación piramidal de nodos.<br/>3. Destruir listeners y liberar memoria en `unmount`. | `ThreeJS`, `DashboardStore` |
| `MermaidViewer` | `<<DiagramViewer>>` | 1. Renderizar código Mermaid como SVG interactivo.<br/>2. Ofrecer conmutador entre vista visual y código fuente.<br/>3. Habilitar zoom a pantalla completa y enlace a Draw.io. | `WindowMermaid`, `ClipboardAPI` |

---

## 4. Contratos de Entrada y Salida (DTOs / Interfaces)
- **Input**: `window.__FALLBACK_DATA__` o respuestas JSON de `fetchProjectData()`.
- **Output**: Renderizado DOM reactivo en `#app`, eventos de navegación por hash y persistencia local de documentos modificados.


