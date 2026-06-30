# .NET Harness Engineering — Spec Driven Development con Agentes de IA

> **Esto no es un proyecto de software, es un arnés de control para desarrollo .NET.**
>
> Un repositorio plantilla que cualquier equipo puede descargar y usar para
> desarrollar features .NET con agentes de IA de forma **autónoma, verificable
> y trazable**. Todo el código generado sigue Clean Architecture, SOLID, DDD,
> CQRS y las convenciones del equipo.

---

## ¿Para qué sirve este repositorio?

Descargas este repositorio cuando quieras que un agente de IA (opencode, Claude
Code, GitHub Copilot) desarrolle features .NET en tu proyecto siguiendo:

- **Spec Driven Development** — primero se escribe el qué (requirements), el
  cómo (design) y los pasos (tasks). Luego se codifica. Todo aprobado por un humano.
- **Clean Architecture** — Domain, Application, Infrastructure, Api separados
  por capas con reglas de dependencia estrictas.
- **Calidad verificable** — 10 niveles de verificación: build, unit tests,
  integración, cobertura, seguridad, performance, arquitectura, trazabilidad.
- **Multi-agente** — leader orquesta, spec_author escribe, implementer codifica,
  reviewer verifica. Ningún agente hace el trabajo de otro.

---

## Cómo usar este arnés

### 1. Trae los archivos a tu proyecto

El harness **no debe clonarse como repositorio independiente** dentro de tu
proyecto. Los archivos deben copiarse **sin el historial git** del harness
para no interferir con el control de versiones de tu proyecto.

Elige uno de estos métodos:

<details>
<summary>📦 Opción A — Descargar ZIP (recomendada, sin git)</summary>

```bash
# Desde la raíz de tu proyecto (el que ya tiene su propio .git):
# 1. Descarga el ZIP y extráelo en una carpeta temporal
curl -L https://github.com/AndresOsorio0710/harness_anginnering/archive/master.tar.gz \
  | tar xz --strip=1 -C /tmp/harness-temp

# 2. Copia los archivos del harness a tu proyecto (sin .git)
cp -r /tmp/harness-temp/* /tmp/harness-temp/.* .

# 3. Limpia
rm -rf /tmp/harness-temp
```
</details>

<details>
<summary>🔀 Opción B — Clone shallow + copia (si tienes git)</summary>

```bash
# En cualquier directorio:
git clone --depth 1 https://github.com/AndresOsorio0710/harness_anginnering.git /tmp/harness-temp

# Copia a tu proyecto (sin .git — no se cruza con tu historial)
cp -r /tmp/harness-temp/* /tmp/harness-temp/.* /ruta/de/tu/proyecto/

# Limpia
rm -rf /tmp/harness-temp
```
</details>

<details>
<summary>🔄 Opción C — Nuevo proyecto desde cero</summary>

```bash
git clone --depth 1 https://github.com/AndresOsorio0710/harness_anginnering.git mi-proyecto-net
cd mi-proyecto-net
rm -rf .git   # ← importante: elimina el git del harness
git init      # ← inicia tu propio repositorio
git add -A && git commit -m "feat: initialize .NET project with harness"
```
</details>

### 2. Configura el proyecto

```bash
cp kickstart.json.example kickstart.json   # crea tu archivo local (no trackeado)
```

Edita `kickstart.json` con los parámetros de tu proyecto:

```json
{
  "project": {
    "name": "MiSistemaFacturacion",
    "type": "WebApi",
    "namespace": "MiEmpresa.SistemaFacturacion",
    "targetFramework": "net10.0",
    "version": "1.0.0"
  },
  "team": {
    "executorName": "Tu Nombre",
    "executorEmail": "tu@email.com"
  }
}
```

> `kickstart.json` está en `.gitignore` — no se trackea.
> `kickstart.json.example` es la plantilla trackeada con valores de ejemplo.

### 3. Inicializa

```bash
chmod +x init.sh
./init.sh
```

Debe terminar con `[OK] Entorno listo`.

### 4. Define las features del negocio

Edita `feature_list.json` y reemplaza las features de ejemplo por las tuyas:

```json
{
  "id": 1,
  "name": "crear_factura",
  "title": "Creación de facturas",
  "description": "Endpoint para crear facturas con líneas, impuestos y descuentos.",
  "sdd": true,
  "status": "pending",
  "priority": "high"
}
```

### 5. Abre con tu agente de IA

| Herramienta | Comando |
|-------------|---------|
| **opencode** | `opencode` (usa `opencode.json`) |
| **Claude Code** | `claude` (usa `AGENTS.md`) |
| **GitHub Copilot** | `code .` (usa `.github/copilot/instructions/`) |

### 6. Pide implementar

```
implementa la siguiente feature pendiente
```

El agente leader ejecutará el flujo completo automáticamente.

---

## Arquitectura del arnés

### Directorios

```
.
├── AGENTS.md                    # Punto de entrada para cualquier agente
├── opencode.json                # Configuración para opencode (4 agentes)
├── ENGINES.md                   # Registro de features completadas
├── feature_list.json            # Features del proyecto (estado + prioridad)
├── init.sh                      # Verificación de entorno
├── kickstart.json               # ⚠️ Parámetros locales (NO trackeado en git)
├── kickstart.json.example       # ✅ Plantilla trackeada con valores de ejemplo
├── CHECKPOINTS.md               # Criterios de "estado final correcto"
├── .gitignore                   # kickstart.json, bin/, obj/ excluidos
│
├── docs/
│   ├── architecture.md          # SOLID, Clean Architecture, patrones, DDD, CQRS
│   ├── conventions.md           # Estilo C#, nombres, async, nullables, tests
│   ├── specs.md                 # Proceso SDD completo (EARS, ADRs, tasks)
│   └── verification.md          # 10 niveles de verificación
│
├── progress/
│   ├── current.md               # Sesión activa (estado vivo)
│   └── history.md               # Bitácora append-only de sesiones
│
├── specs/{NNN}_{name}/          # Specs de cada feature
│   ├── requirements.md          # QUÉ en EARS notation
│   ├── design.md                # CÓMO con ADRs
│   └── tasks.md                 # PASOS atómicos
│
├── src/                         # Código fuente (lo genera el implementer)
│   ├── {Project}.Domain/
│   ├── {Project}.Application/
│   ├── {Project}.Infrastructure/
│   └── {Project}.Api/
│
├── tests/                       # Tests (los genera el implementer)
│   ├── {Project}.Domain.Tests/
│   ├── {Project}.Application.Tests/
│   ├── {Project}.Infrastructure.Tests/
│   └── {Project}.Api.Tests/
│
└── .opencode/                   # Configuración de agentes opencode
    ├── agents/
    │   ├── leader.md            # Orquestador
    │   ├── spec-author.md       # Redactor de specs
    │   ├── implementer.md       # Implementador
    │   └── reviewer.md          # Revisor
    └── skills/
        └── sdd-workflow/        # Skill del flujo SDD
```

### Stack .NET

| Elemento | Estándar |
|----------|----------|
| Target framework | `net10.0` (configurable) |
| Lenguaje | C# 13+ |
| Arquitectura | Clean Architecture (4 capas) |
| CQRS | MediatR |
| Validación | FluentValidation |
| Testing | xUnit + FluentAssertions + NSubstitute |
| DB | EF Core (provider según proyecto) |
| Logging | Serilog + OpenTelemetry |
| API | Minimal APIs / Controllers |

---

## Flujo de trabajo (SDD)

Una feature completa el siguiente ciclo, siempre en su propia rama:

```
┌──────────┐    ┌──────────┐     ⏸     ┌──────────────┐    ┌──────────┐    ┌────────┐
│  leader  │───→│spec_author│───→│HUMANO│───→│implementer│───→│ reviewer │───→│ CIERRE │
│(prepara) │    │(3 archivos)    │aprueba│   │(código + tests)│(verifica)│    │commit + │
│          │    │               │rechaza│   │               │          │    │ENGINES  │
└──────────┘    └──────────┘     └──────┘   └──────────────┘    └──────────┘    └────────┘
```

| Fase | Quién | Qué produce |
|------|-------|-------------|
| **Preparación** | Leader | Rama `feature/{NNN}_{name}`, verificación de estado |
| **Spec** | spec_author | `requirements.md` (EARS), `design.md` (ADRs), `tasks.md` |
| **⏸ Aprobación** | Humano | Aprueba 100% o pide cambios |
| **Implementación** | implementer | Código en `src/`, tests en `tests/`, trazabilidad |
| **Revisión** | reviewer | Verificación de calidad, arquitectura, tests |
| **Cierre** | Leader | Commit, `ENGINES.md`, preguntar integración |

### Agentes para opencode

| Agente | Rol | Permisos |
|--------|-----|----------|
| `leader` | Orquestador (agente por defecto) | Full acceso |
| `spec-author` | Escribe solo en `specs/` | Lectura + specs/ |
| `implementer` | Escribe en `src/` y `tests/` | Lectura + src/ + tests/ + progress/ |
| `reviewer` | Verifica sin editar | Solo lectura + dotnet comandos |

Comandos rápidos en opencode: `/start-feature`, `/spec`, `/implement`, `/review`

---

## Verificación

Cada feature se verifica contra 10 niveles antes de cerrar:

| Nivel | Área | Comando |
|-------|------|---------|
| 0 | Build + análisis estático | `dotnet build /warnaserror` |
| 1 | Tests unitarios | `dotnet test tests/*.Domain.Tests/` |
| 2 | Tests de integración | `dotnet test tests/*.Infrastructure.Tests/` |
| 3 | Tests de API | `dotnet test tests/*.Api.Tests/` |
| 4 | Tests E2E | `dotnet test tests/E2E/` |
| 5 | Cobertura + calidad | Coverlet + Stryker mutation testing |
| 6 | Seguridad | `dotnet list package --vulnerable` |
| 7 | Performance | BenchmarkDotNet + k6 |
| 8 | Trazabilidad | Mapa R↔Tests documentado |
| 9 | Arquitectura | NetArchTest |
| 10 | Pack NuGet | `dotnet pack` + validación |

---

## Preguntas frecuentes

### ¿Puedo reutilizar este arnés para cualquier proyecto .NET?

Sí. Solo cambia `kickstart.json`, `feature_list.json` y los docs/ si necesitas
ajustar convenciones. El resto del harness es agnóstico al dominio.

### ¿Qué pasa si mi proyecto ya existe?

Copia los archivos del harness en la raíz de tu proyecto existente (ver paso 1
— Opción A o B). El `init.sh` detectará tu `.sln` y tus proyectos.
Luego define features en `feature_list.json` para las nuevas funcionalidades.

> **Importante:** Usa ZIP o clone shallow + copia de archivos (sin `.git`).
> No hagas `git clone` directo dentro de tu proyecto o mezclarás historiales.

### ¿Necesito opencode?

No. El harness funciona con cualquier agente de IA (Claude Code, GitHub Copilot,
Cursor, etc.). `AGENTS.md` es el punto de entrada universal. La configuración
de `opencode.json` es adicional para integración más profunda con opencode.

### ¿Las features implementadas se fusionan a main?

No automáticamente. El agente siempre pregunta al humano si requiere integración.
- Proyecto local → merge directo
- Proyecto en nube → se sugiere Pull Request

### ¿Dónde vive el registro de features completadas?

En `ENGINES.md` dentro de la rama `feature/*`. Esto permite saber qué features
están completadas incluso antes de integrar a main.
