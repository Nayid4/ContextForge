# Módulo: agent-orchestrator (Orquestador Multi-Agente & Reglas de Plataforma)

> [!NOTE]
> Bounded Context encargado de coordinar los agentes de IA, hacer cumplir las políticas de branching y commits semánticos, y gestionar las puertas obligatorias de decisión humana.

## 1. Responsabilidades del Módulo
- Definición de roles especializados: `leader`, `spec-author`, `implementer` y `reviewer`.
- Homologación de reglas en 3 plataformas: Google Antigravity (`.agents/`), OpenCode (`.opencode/`) y GitHub Copilot (`.github/`).
- Verificación de límites de rama: formato `{type}/INT-{id}/{name}` con longitud estricta $\le 80$ caracteres.
- Gobernanza de puertas de decisión humana mediante `ask_question`.

## 2. Contratos e Interfaces
- **Herramientas Clave**: `invoke_subagent`, `define_subagent`, `manage_subagents`, `ask_question`, `run_command`.
- **Estructura de Workspace**: `Workspace: "inherit"` para operar directamente sobre la rama de trabajo activa.
- **Formato de Commits**: `feat(scope): desc` o `fix(scope): desc`.

## 3. Componentes Nucleares
- `.agents/agents/leader.md`: Orquestador principal del ciclo SDD.
- `.agents/agents/spec-author.md`: Redactor de requerimientos EARS, ADRs y tareas.
- `.agents/agents/implementer.md`: Implementador agnóstico de código de producción y tests.
- `.agents/agents/reviewer.md`: Revisor independiente de calidad, build y trazabilidad R↔Tests.
