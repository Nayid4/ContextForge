# Regla de Estado del Proyecto

## Cuando se pida "estado del proyecto" o "project status"

**SIEMPRE** leer estos archivos en orden para obtener el contexto completo:

1. `AGENTS.md` - Reglas del sistema, convenciones, commits
2. `project-docs/README.md` - Documentación general del proyecto
3. `project-docs/feature_list.json` - Features con status (done/pending/in_progress/blocked)
4. `project-docs/progres/current.json` - Spec activo (si hay uno en proceso)
5. `project-spec.yaml` - Stack y servicios (si existe; generado por `technical-audit`)

## Formato de respuesta

### 1. Infraestructura
```bash
# Servicios Docker del proyecto (ajustar el filtro al prefijo del proyecto)
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```
Si `project-spec.yaml` define servicios, usarlos como referencia de puertos esperados.

### 2. Módulos (backend/frontend)
```bash
cd <module> && npm test 2>&1 | tail -5
cd <module> && git log --oneline -5
```
(Ajustar el comando de tests al lenguaje definido en `project-spec.yaml` → `checks.test`.)

### 3. Features (de feature_list.json)
Agrupar por status:
- ✅ **Done**: Features completados
- 🔄 **In Progress**: En desarrollo
- ⏳ **Pending**: No iniciados
- ⛔ **Blocked**: Bloqueados

### 4. Próximos pasos
Basado en las features pendientes/bloqueadas (por prioridad) y en `project-docs/progres/current.json` si hay un spec activo.

## Template de respuesta

```
## Estado del Proyecto - [Nombre]

### Infraestructura
| Servicio | Estado | Puerto |
|----------|--------|--------|
| ... | ... | ... |

### Módulos
| Módulo | Tests | Coverage | Último Commit |
|--------|-------|----------|---------------|
| ... | ... | ... | ... |

### Features
| Estado | Cantidad | Detalle |
|--------|----------|---------|
| ✅ Done | N | ... |
| 🔄 In Progress | N | ... |
| ⏳ Pending | N | ... |
| ⛔ Blocked | N | ... |

### Próximos Pasos
1. ...
2. ...
```
