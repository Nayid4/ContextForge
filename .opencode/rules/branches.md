# Reglas de Ramas Git (Branching)

## Estructura Obligatoria

Toda tarea (feature o corrección de error) debe realizarse en su propia rama de trabajo, siguiendo estrictamente esta estructura:

```
{feature o bugfix}/INT-{numero}/{nombre_rama_de_lo_realizado}
```

## Tipos Permitidos

Se manejan exclusivamente **2 tipos**:
- `feature`: Nuevas funcionalidades, mejoras o capacidades.
- `bugfix`: Corrección de errores, parches y bugs.

## Reglas de Longitud y Caracteres

1. **Límite estricto de longitud:** El nombre completo de la rama debe tener **máximo 80 caracteres**.
2. **Formato del ticket:** `INT-` seguido del número de tarea (ej: `INT-001`, `INT-042`).
3. **Nombre descriptivo:** Usar `snake_case` o `kebab-case` en minúsculas para `{nombre_rama_de_lo_realizado}`.

## Ejemplos Válidos

| Rama | Tipo | Longitud | ¿Válida? |
|------|------|----------|----------|
| `feature/INT-001/document_crud_api` | feature | 33 chars | ✅ Sí |
| `bugfix/INT-002/fix_jwt_token_expiration` | bugfix | 40 chars | ✅ Sí |
| `feature/INT-015/add_oauth2_sso_authentication` | feature | 46 chars | ✅ Sí |
| `feature/INT-099/user_service_endpoint_with_excessively_long_branch_name_that_exceeds_eighty_chars` | feature | 99 chars | ❌ No (>80c) |

## Creación y Checkout

1. Crear la rama de trabajo desde la rama base (`main`, `master` o `dev`):
   ```bash
   git checkout -b {feature|bugfix}/INT-{numero}/{nombre_rama_de_lo_realizado}
   ```
2. Verificar la longitud antes de comenzar el desarrollo:
   ```bash
   BRANCH=$(git branch --show-current)
   if [[ ${#BRANCH} -gt 80 ]]; then echo "Error: rama excede 80 caracteres"; fi
   ```
3. Todo el desarrollo de spec, código, tests y registro de progreso ocurre **dentro de la rama de la tarea**, nunca directamente en las ramas base.
