# Módulo: backend (Servicios Core & Catálogo)

## Propósito
Exponer las APIs REST principales del sistema: autenticación JWT, roles RBAC, catálogo de productos con paginación cursor y carrito de compras en memoria.

## Tareas Asignadas
- `INT-002`: `user_auth_service` (Login, roles, rotación JWT).
- `INT-003`: `fix_jwt_token_expiration` (Cálculo Epoch UTC estricto).
- `INT-004`: `product_catalog_api` (Cursor pagination y filtros full-text).
- `INT-005`: `shopping_cart_service` (Carrito en memoria con Redis).

## Componentes Clave
- `AuthController`: Emisión y validación de tokens.
- `CatalogService`: Gestión de productos y caché.
- `CartService`: Operaciones atómicas de stock.
