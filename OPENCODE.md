# OPENCODE — Configuración de agentes para opencode

Este proyecto está diseñado para funcionar con **opencode** como sistema de
orquestación multi-agente. Los agentes implementan el flujo **SDD (Spec Driven Development)**.

## Agentes disponibles

| Agente | Rol | Comando |
|--------|-----|---------|
| **leader** | Orquestador — detecta features, crea ramas, coordina | `leader` (default) |
| **spec-author** | Escribe requirements.md, design.md, tasks.md | `/spec` |
| **implementer** | Implementa código y tests | `/implement` |
| **reviewer** | Verifica calidad y trazabilidad | `/review` |

## Comandos rápidos

| Comando | Descripción |
|---------|-------------|
| `/start-feature` | Inicia el flujo SDD completo desde la feature pending |
| `/spec` | Lanza spec-author para escribir los specs |
| `/implement` | Lanza implementer para codificar |
| `/review` | Lanza reviewer para verificar |

## Flujo típico

```
1. Abre opencode en la raíz del proyecto.
2. Leader detecta la feature pending y crea la rama.
3. spec-author escribe los 3 specs → spec_ready.
4. ⏸ Humano aprueba el spec.
5. implementer codifica y testea.
6. reviewer verifica.
7. Cierre: commit, ENGINES.md, preguntar integración.
```

## Configuración

Ver `opencode.json` para la configuración de agentes y permisos.

## Skills

- `sdd-workflow` — Skill con el flujo SDD completo. Se carga automáticamente
  cuando se detectan palabras clave como "implement", "start feature", etc.
