# Reglas de Commits Semánticos

## Formato

```
<tipo>(<alcance>): <descripción>

[opcional: cuerpo]

[opcional: pie de firma]
```

## Tipos Permitidos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(backend): agregar CRUD de documentos` |
| `fix` | Corrección de bug | `fix(api): corregir validación de fecha` |
| `docs` | Documentación | `docs: actualizar checklist de requisitos` |
| `style` | Formato (no afecta lógica) | `style: corregir indentación en index.js` |
| `refactor` | Reestructuración sin cambio funcional | `refactor: extraer servicio de eventos` |
| `test` | Agregar/modificar tests | `test: agregar tests para projectController` |
| `chore` | Tareas de mantenimiento | `chore: actualizar dependencias` |
| `ci` | Integración continua | `ci: agregar GitHub Actions` |
| `perf` | Mejora de rendimiento | `perf: optimizar consultas MongoDB` |
| `build` | Sistema de build | `build: configurar Docker` |
| `revert` | Revertir cambio | `revert: feat(backend): agregar cache` |

## Alcance (Opcional)

El alcance indica el módulo o componente afectado:

- `backend` - Cambios en el backend
- `frontend` - Cambios en el frontend
- `infra` - Cambios en infraestructura Docker
- `api` - Cambios en endpoints
- `models` - Cambios en modelos de datos
- `docs` - Cambios en documentación
- `skills` - Cambios en skills

## Reglas

1. **Siempre en inglés** - Los commits deben ser en inglés
2. **Descripción imperativa** - "agregar" no "agregado"
3. **Sin punto al final** - La descripción no lleva punto
4. **Máximo 72 caracteres** en la primera línea
5. **Separar cuerpo** con línea en blanco
6. **Referenciar issue** si aplica: `Fixes #123`

## Ejemplos

### Buen commit
```
feat(backend): add document CRUD endpoints

- Add Document model
- Add documentController with CRUD operations
- Add routes for /api/documents
- Update projectController to include documents
```

### Mal commit
```
agregué documentos
```

## Verificación

Antes de cada commit, verificar:
1. `git status` - Ver qué archivos cambian
2. `git diff` - Revisar los cambios
3. `git commit` - Usar formato correcto

## Flujo

```
1. git add <archivos>
2. git commit -m "feat(scope): descripción"
3. git push (solo después de confirmación del usuario)
```
