# Estándares de Programación & Directrices Anti-Sesgo — CloudSaaS Platform

Este documento define las convenciones de código observadas y obligatorias en el proyecto. Su objetivo es asegurar que los agentes de IA no introduzcan librerías no deseadas, mantengan el estilo de codificación existente y respeten los patrones arquitecturales establecidos.

---

## 1. Directrices Anti-Sesgo para Agentes de IA (AI Guardrails)

Para evitar que los modelos de lenguaje (LLMs) apliquen patrones genéricos o bibliotecas obsoletas aprendidas en su pre-entrenamiento:

> [!IMPORTANT]
> 1. **No inventar librerías**: Si una funcionalidad ya está resuelta con dependencias del proyecto (ej. `node:crypto`, `Zod`, `pg`), está prohibido instalar bibliotecas redundantes (como `crypto-js`, `joi`, etc.).
> 2. **Respetar la arquitectura en capas**: Ningún controlador HTTP puede acceder directamente a consultas SQL o al cliente de Redis; debe pasar por la capa de Casos de Uso (`Application Service`) e interfaces de repositorio.
> 3. **Manejo de Errores con Result Pattern o Excepciones de Dominio**: No retornar objetos vacíos ni `null` ante errores. Usar tipos explícitos de error o lanzar excepciones tipadas capturadas por el middleware de errores global.
> 4. **Tests Primero o Acompañados**: Toda lógica nueva debe contar con su correspondiente suite de pruebas unitarias cubriendo casos de éxito y caminos de fallo.

---

## 2. Convenciones de Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos de código | `kebab-case` o `PascalCase` según lenguaje | `cart-service.ts`, `OrderWorker.cs` |
| Clases e Interfaces | `PascalCase` | `PaymentService`, `IOrderRepository` |
| Funciones y Métodos | `camelCase` | `calculateTaxAmount()`, `reserveStock()` |
| Variables y Parámetros | `camelCase` | `orderId`, `idempotencyKey` |
| Constantes | `UPPER_SNAKE_CASE` | `DEFAULT_CACHE_TTL`, `MAX_RETRIES` |
| Ramas Git | `{type}/INT-{numero}/{nombre_rama}` (≤80c) | `feature/INT-004/product_catalog_api` |
| Commits | Convencionales (`feat`, `fix`, `docs`, `refactor`) | `feat(billing): implement idempotency check` |

---

## 3. Patrones de Diseño Implementados

### A. Repository & Unit of Work Pattern
* La interfaz `IRepository<T>` se define en la capa de Dominio o Aplicación.
* La implementación concreta (`PostgresOrderRepository`) reside en `Infrastructure`.
* Permite reemplazar o simular (mock) la base de datos en pruebas unitarias con facilidad.

### B. Clean Use Cases (Single Responsibility)
* Cada caso de uso complejo se implementa en su propia clase u orquestador con un método `execute(command)` o `handle(query)`.
* Esto evita controladores "gordos" (*Fat Controllers*) y facilita la prueba aislada.

### C. DTOs Inmutables y Validación con Zod
* Toda entrada a un endpoint debe ser validada contra un schema de validación estricto antes de llegar a la lógica de negocio:
  ```typescript
  export const CheckoutRequestSchema = z.object({
    idempotencyKey: z.string().uuid(),
    currency: z.enum(['USD', 'COP', 'EUR']),
    paymentMethodId: z.string().min(1)
  });
  ```

---

## 4. Estructura Estándar de Carpetas (Clean Architecture)

```
src/
├── core/                  # Entidades de dominio, tipos base y constantes globales
├── modules/
│   ├── {modulo}/
│   │   ├── controllers/   # Handlers HTTP, rutas OpenAPI y validadores
│   │   ├── services/      # Lógica de aplicación y casos de uso
│   │   ├── domain/        # Entidades puras y reglas de negocio
│   │   ├── dtos/          # Esquemas de entrada/salida y contratos
│   │   └── repositories/  # Acceso a datos e integraciones externas
└── shared/                # Middlewares comunes, logging y utilidades
```
