# .NET Harness — Agentes de IA con Spec Driven Development

Harness de control para desarrollo .NET con agentes de IA (GitHub Copilot).
Permite generar código de calidad de forma **autónoma, verificable y trazable**,
siguiendo buenas prácticas, convenciones de equipo y Spec Driven Development.

## Qué es esto

Un arnés de control que organiza el trabajo de los agentes en features
atómicas, verificadas y documentadas. Cada feature pasa por un ciclo completo:

```
spec → aprobación humana → implementación → tests verdes → cierre
```

**Una rama por feature. Specs y código juntos. Master nunca se toca durante el trabajo.**

---

## Archivos clave

| Elemento            | Qué controla                                             |
| ------------------- | -------------------------------------------------------- |
| `AGENTS.md`         | Punto de entrada para agentes (divulgación progresiva)   |
| `COPILOT.md`        | Auto-cargado por GitHub Copilot — fuerza el rol `leader` |
| `kickstart.json`    | Parámetros del proyecto (rellena antes de arrancar)      |
| `feature_list.json` | Alcance y estado de features (una a la vez)              |
| `ENGINES.md`        | Índice de features completadas con rama y commit SHA     |
| `init.sh`           | Verificación del entorno: SDK, harness, build, tests     |
| `docs/`             | Arquitectura, convenciones, proceso SDD, verificación    |
| `progress/`         | Estado vivo de la sesión activa e historial de sesiones  |

---

## Para empezar

1. Rellena `kickstart.json` con los parámetros del proyecto.
2. Define las features en `feature_list.json`.
3. Ejecuta `./init.sh` — debe terminar en verde.
4. Abre `AGENTS.md` y sigue el flujo desde ahí.

```bash
chmod +x init.sh
./init.sh
```

---

## Convenciones clave

- **Feature naming:** `001_feature_name`, `002_next_feature` (id 3 dígitos cero-rellenos)
- **Branch naming:** `feature/001_feature_name`
- **Executor tracking:** todo `progress/current.md` y `progress/history.md` debe registrar `Ejecutado por: {nombre} ({email})`
- **Tests obligatorios:** ninguna feature cierra sin `dotnet build /warnaserror` y `dotnet test` en verde
- **SDD:** spec aprobado por humano antes de escribir una sola línea de código
