# CHECKPOINTS — Evaluación del estado final (.NET)

> En sistemas multi-agente no se evalúa el camino, se evalúa el destino.
> Estos son los checkpoints objetivos que un juez (humano o IA) puede usar
> para decidir si el proyecto está sano.

---

## C1 — El arnés está completo

- [ ] Existen los archivos base: `AGENTS.md`, `init.sh`, `kickstart.json` (local, no trackeado), `feature_list.json`, `ENGINES.md`, `progress/current.md`.
- [ ] Existen los docs: `docs/architecture.md`, `docs/conventions.md`, `docs/specs.md`, `docs/verification.md`.
- [ ] `./init.sh` termina con exit code 0.

---

## C2 — El estado es coherente

- [ ] Como mucho una feature en `in_progress` en `feature_list.json`.
- [ ] Toda feature `done` tiene tests asociados que pasan en verde.
- [ ] `progress/current.md` está vacío o describe la sesión activa (con ejecutor registrado).
- [ ] `progress/history.md` y `ENGINES.md` están en perfecto estado antes de iniciar una nueva feature.
- [ ] La rama activa es `feature/{NNN}_{name}` (o main/master/dev aprobada por humano).

---

## C3 — El código respeta la arquitectura

- [ ] La estructura de `src/` coincide con lo definido en `docs/architecture.md`.
- [ ] No hay referencias circulares entre capas.
- [ ] No hay lógica de negocio en capas de infraestructura o presentación.
- [ ] No hay `Console.WriteLine` ni código de debug sin propósito.

---

## C4 — La verificación es real

- [ ] `dotnet build /warnaserror` termina sin errores ni warnings.
- [ ] `dotnet test` muestra al menos 1 test por feature `done` y todos verdes.
- [ ] Los tests unitarios no tienen dependencias de IO, DB ni HTTP externo.
- [ ] Las features de API usan `WebApplicationFactory<Program>` para integración.

---

## C5 — La sesión se cerró bien

- [ ] No hay archivos sin trackear sospechosos (`*.tmp`, `bin/`, `obj/` fuera del `.gitignore`).
- [ ] `progress/history.md` tiene una entrada por cada sesión con ejecutor registrado.
- [ ] La feature trabajada está reflejada en su estado correcto en `feature_list.json`.
- [ ] `ENGINES.md` en la rama `feature/{NNN}_{name}` tiene una fila por cada feature `done`.
- [ ] Se preguntó al humano si requiere integración a la rama original.

---

## C6 — Spec Driven Development

- [ ] Toda feature con `"sdd": true` en estado `spec_ready`, `in_progress` o `done`
      tiene su carpeta `specs/{NNN}_{name}/` con los 3 archivos: `requirements.md`, `design.md`, `tasks.md`.
- [ ] `requirements.md` usa EARS estricto (ver `docs/specs.md`).
- [ ] Toda feature `done` con `"sdd": true` tiene todas sus tasks marcadas `[x]` en `tasks.md`.
- [ ] Cada `R<n>` de `requirements.md` está cubierto por al menos un test concreto en `tests/`.

---

## C7 — Trazabilidad y ejecutor

- [ ] Toda sesión en `progress/history.md` incluye `Ejecutado por: {nombre} ({email})`.
- [ ] `progress/current.md` registra el ejecutor de la sesión activa.
- [ ] Las ramas de feature siguen el patrón `feature/{NNN}_{name}`.
- [ ] Los specs viven en `specs/{NNN}_{name}/` dentro de la rama de la feature.
