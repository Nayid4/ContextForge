---
name: sdd-workflow
description: "Use ONLY when the user says 'implement', 'start feature', 'new feature', 'complete feature', 'start sdd', or when you need to execute the full Spec Driven Development workflow (spec → implement → review → close). This skill guides the complete feature lifecycle."
---

# SDD Workflow — Spec Driven Development

Este skill implementa el flujo completo SDD: desde la detección de una feature
pendiente hasta el cierre, incluyendo la puerta de aprobación humana.

## Cuándo usarlo

Cuando el líder detecta una feature `pending` en `feature_list.json` o cuando
el humano solicita explícitamente iniciar/completar una feature.

## Archivos de referencia

- `AGENTS.md` — flujo completo orquestado
- `feature_list.json` — estado y lista de features
- `docs/specs.md` — especificaciones del proceso SDD
- `docs/architecture.md` — marco arquitectónico
- `docs/conventions.md` — convenciones de código
- `docs/verification.md` — niveles de verificación
- `CHECKPOINTS.md` — criterios de estado final correcto

## Estados de feature

| Estado | Significado |
|--------|-------------|
| `pending` | Sin spec. spec_author debe actuar. |
| `spec_ready` | Spec listo. Esperando aprobación humana. |
| `in_progress` | Spec aprobado. Implementando. |
| `done` | Completado y verificado. |
| `blocked` | Atascado. Razón en progress/current.md. |

## Flujo

```
pending → [spec_author] → spec_ready → ⏸ HUMANO → in_progress → [implementer → reviewer] → done
```

1. **spec_author**: Crea `specs/{NNN}_{name}/{requirements,design,tasks}.md`
2. **⏸ Humano**: Aprueba 100% o pide correcciones
3. **implementer**: Ejecuta tasks.md, escribe código y tests
4. **reviewer**: Verifica trazabilidad R↔Tests, build, tests
5. **Cierre**: feature_list.json → done, ENGINES.md actualizado, preguntar integración

## Reglas duras

- Una feature a la vez
- No saltar la puerta humana
- `dotnet build /warnaserror` y `dotnet test` siempre verdes
- Trazabilidad R↔Tests obligatoria
- Todo en la rama `feature/*`, nunca en main/master/dev
