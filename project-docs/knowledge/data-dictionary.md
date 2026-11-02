# Diccionario de Datos & Modelo de Persistencia (ERD)

> [!NOTE]
> Este documento define el modelo relacional, las restricciones de integridad y las políticas de persistencia en PostgreSQL 16 y Redis 7.2. Proporciona a los desarrolladores y agentes de IA un conocimiento exacto de las tablas, columnas, tipos nativos y llaves foráneas para evitar alucinaciones en consultas SQL o migraciones.

---

## 1. Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : "emits"
    USERS }o--o{ USER_ROLES : "assigned"
    ROLES ||--o{ USER_ROLES : "defines"
    
    USERS ||--o{ ORDERS : "places"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "referenced_in"
    
    ORDERS ||--|| INVOICES : "billed_by"
    INVOICES ||--|{ PAYMENTS : "settled_by"
    
    CARTS ||--o{ CART_ITEMS : "holds"
    PRODUCTS ||--o{ CART_ITEMS : "selected_in"

    USERS {
        uuid id PK "Identificador único UUIDv4"
        string email UK "Correo normalizado en minúsculas"
        string password_hash "Hash Argon2id o BCrypt"
        string first_name "Nombre del usuario"
        string last_name "Apellido del usuario"
        boolean is_active "Estado de la cuenta"
        timestamp created_at "Fecha creación UTC"
        timestamp updated_at "Fecha actualización UTC"
        integer version "Optimistic locking rowversion"
    }

    REFRESH_TOKENS {
        uuid id PK "Identificador del token"
        uuid user_id FK "Referencia a USERS"
        string token_hash "Hash SHA256 del token opaco"
        timestamp expires_at "Fecha expiración UTC"
        boolean is_revoked "Indicador de revocación"
        timestamp created_at "Fecha creación UTC"
    }

    ROLES {
        string id PK "Identificador del rol (ADMIN, CUSTOMER)"
        string description "Descripción de privilegios"
    }

    USER_ROLES {
        uuid user_id PK,FK "Referencia a USERS"
        string role_id PK,FK "Referencia a ROLES"
    }

    PRODUCTS {
        uuid id PK "Identificador del producto"
        string sku UK "Código de inventario único"
        string name "Nombre comercial"
        text description "Descripción técnica"
        decimal price "Precio unitario (Precision 12, Scale 2)"
        integer stock_quantity "Cantidad disponible"
        boolean is_active "Visible en catálogo"
        timestamp created_at "Fecha creación UTC"
        timestamp updated_at "Fecha actualización UTC"
    }

    CARTS {
        uuid id PK "ID del carrito o sesión Redis"
        uuid user_id FK "Usuario (opcional si es anónimo)"
        timestamp expires_at "TTL de 72 horas"
        timestamp updated_at "Fecha última modificación"
    }

    CART_ITEMS {
        uuid id PK "Identificador del ítem"
        uuid cart_id FK "Referencia al carrito"
        uuid product_id FK "Referencia al producto"
        integer quantity "Cantidad solicitada (CHECK > 0)"
        decimal unit_price "Precio retenido al agregar"
    }

    ORDERS {
        uuid id PK "Identificador de la orden"
        uuid user_id FK "Cliente que emitió la orden"
        string status "Estado: PENDING, PAID, PROCESSING, FULFILLED, CANCELLED"
        decimal total_amount "Total liquidado con Banker's Rounding"
        string currency "Moneda ISO 4217 (ej. USD, EUR)"
        timestamp created_at "Fecha emisión UTC"
        timestamp updated_at "Fecha actualización UTC"
    }

    ORDER_ITEMS {
        uuid id PK "Identificador del ítem"
        uuid order_id FK "Referencia a ORDERS"
        uuid product_id FK "Referencia a PRODUCTS"
        integer quantity "Cantidad comprada"
        decimal unit_price "Precio de compra histórico"
        decimal subtotal "Subtotal (quantity * unit_price)"
    }

    INVOICES {
        uuid id PK "Identificador de factura"
        uuid order_id FK "Referencia 1:1 a ORDERS"
        string invoice_number UK "Número fiscal correlativo"
        decimal tax_amount "Impuestos calculados a 2 decimales"
        decimal total_amount "Total final"
        string status "DRAFT, ISSUED, PAID, VOID"
        timestamp issued_at "Fecha emisión fiscal UTC"
    }

    PAYMENTS {
        uuid id PK "Identificador del pago"
        uuid invoice_id FK "Referencia a INVOICES"
        string idempotency_key UK "Clave única de idempotencia"
        string provider_transaction_id "ID de Stripe PaymentIntent"
        decimal amount "Monto cobrado"
        string status "PENDING, SUCCEEDED, FAILED"
        timestamp processed_at "Fecha confirmación UTC"
    }
```

---

## 2. Catálogo Detallado de Tablas & Restricciones

### 2.1 Tabla: `users`
- **Propósito**: Gestión de identidades, credenciales seguras y estado de acceso.
- **Llave Primaria**: `id` (`UUID`, generado por defecto con `gen_random_uuid()`).
- **Restricciones de Integridad**:
  - `UNIQUE (email)`: Índice único normalizado.
  - `CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')`: Validación de sintaxis RFC 5322.
- **Concurrencia**: Columna `version INTEGER NOT NULL DEFAULT 1` utilizada para **Optimistic Concurrency Control (OCC)**.
- **Borrado**: **Soft Delete** mediante `deleted_at TIMESTAMP WITH TIME ZONE NULL`. Los índices únicos de email incluyen cláusula parcial `WHERE deleted_at IS NULL`.

---

### 2.2 Tabla: `products`
- **Propósito**: Catálogo maestro de productos y existencias disponibles para venta.
- **Llave Primaria**: `id` (`UUID`).
- **Restricciones de Integridad**:
  - `UNIQUE (sku)`: SKU comercial único.
  - `CHECK (price >= 0.00)`: Prohibidos precios negativos.
  - `CHECK (stock_quantity >= 0)`: Prohibidas existencias negativas a nivel de base de datos.
- **Índices de Búsqueda**:
  - Índice B-Tree compuesto: `(created_at DESC, id DESC)` para paginación estable por cursor.
  - Índice GIN en `to_tsvector('spanish', name || ' ' || description)` para búsqueda full-text.

---

### 2.3 Tablas de Checkout & Facturación: `invoices`, `payments`
- **Propósito**: Liquidación financiera, emisión de comprobantes y registro de cobros con pasarelas externas (Stripe).
- **Restricciones Críticas de Negocio**:
  - `payments.idempotency_key` con restricción `UNIQUE` para evitar cobros dobles en caso de reintentos concurrentes de red.
  - Precios e impuestos almacenados como `NUMERIC(12, 2)` exacto, prohibiendo el uso de tipos de coma flotante (`FLOAT` o `REAL`) que provoquen errores de redondeo.

---

### 2.4 Almacén en Memoria: Redis 7.2
- **Esquema de Claves**:
  - `cart:{cart_id}`: Hash de Redis que contiene los ítems del carrito con TTL de 72 horas.
  - `idempotency:{key}`: String JSON con TTL de 120s en estado `IN_PROGRESS` y 24h tras éxito (`COMPLETED`).
  - `catalog:page:{hash}`: String JSON con la página cacheada del catálogo con TTL de 300 segundos.
  - `stock:lock:{product_id}`: Cerrojo distribuido Redlock para operaciones concurrentes de inventario con TTL de 5 segundos.

---

## 3. Campos de Auditoría Estándar (Invariantes Globales)

Toda tabla transaccional del sistema incluye obligatoriamente los siguientes campos:

| Campo | Tipo SQL | Descripción |
| :--- | :--- | :--- |
| `created_at` | `TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()` | Marca temporal inmutable de creación en UTC. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()` | Marca temporal de última modificación actualizada por trigger. |
| `tenant_id` | `UUID NULL` | Identificador de partición multi-inquilino (*multi-tenancy*). |
