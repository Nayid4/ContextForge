# Diagramas UML del Sistema — CloudSaaS Platform

Este documento recopila los diagramas UML formales para modelar entidades, transacciones críticas y casos de uso del sistema.

---

## 1. Diagrama de Clases de Dominio (Domain Class Diagram)

Modela las entidades de negocio, sus relaciones y contratos de dominio aislados de frameworks.

```mermaid
classDiagram
    class User {
        +UUID id
        +string email
        +string passwordHash
        +Role role
        +DateTime createdAt
        +validatePassword(plainText) bool
        +hasPermission(permission) bool
    }

    class Role {
        <<enumeration>>
        ADMIN
        OPERATOR
        CUSTOMER
    }

    class Product {
        +UUID id
        +string sku
        +string name
        +decimal price
        +int stock
        +bool isActive
        +reserveStock(quantity) bool
        +releaseStock(quantity) void
    }

    class ShoppingCart {
        +UUID id
        +UUID userId
        +string sessionId
        +DateTime expiresAt
        +List~CartItem~ items
        +addItem(product, qty) void
        +removeItem(productId) void
        +calculateSubtotal() decimal
    }

    class CartItem {
        +UUID productId
        +string name
        +decimal unitPrice
        +int quantity
        +decimal getTotal()
    }

    class Order {
        +UUID id
        +UUID customerId
        +OrderStatus status
        +decimal subtotal
        +decimal taxAmount
        +decimal total
        +string idempotencyKey
        +DateTime createdAt
        +applyTaxCalculation(taxResult) void
        +markAsPaid() void
    }

    class OrderStatus {
        <<enumeration>>
        PENDING_PAYMENT
        PAID
        FULFILLING
        FULFILLED
        CANCELLED
    }

    class PaymentTransaction {
        +UUID id
        +UUID orderId
        +string gatewayProvider
        +string chargeId
        +decimal amount
        +string currency
        +PaymentStatus status
        +string hmacSignature
        +DateTime processedAt
    }

    class PaymentStatus {
        <<enumeration>>
        INITIATED
        SUCCESS
        FAILED
        REFUNDED
    }

    User "1" --> "1" Role : tiene
    ShoppingCart "1" *-- "many" CartItem : contiene
    CartItem --> "1" Product : referencia
    Order "1" --> "1" ShoppingCart : genera desde
    Order "1" *-- "many" PaymentTransaction : registra
    Order --> "1" OrderStatus : estado
    PaymentTransaction --> "1" PaymentStatus : estado
```

---

## 2. Diagrama de Secuencia: Checkout & Pago Idempotente con Webhook

Ilustra la interacción entre Cliente, API Gateway, CartService, PaymentService, Redis, Stripe y RabbitMQ.

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 👤 Cliente Comprador
    participant Gateway as 🛡️ API Gateway
    participant Cart as 🛒 CartService
    participant Pay as 💳 PaymentService
    participant Redis as 🔴 Redis Cache
    participant Stripe as 💳 Stripe API
    participant DB as 🐘 PostgreSQL
    participant Queue as 🐇 RabbitMQ

    Cliente->>Gateway: POST /cart/checkout (Idempotency-Key: idemp_123)
    Gateway->>Pay: Procesar Intento de Pago
    Pay->>Redis: SETNX idempotency:idemp_123 (TTL: 120s)
    
    alt Llave ya existe (Solicitud duplicada concurrente)
        Redis-->>Pay: Llave bloqueada
        Pay-->>Cliente: 409 Conflict / 200 con respuesta cacheada
    else Llave adquirida con éxito
        Redis-->>Pay: Bloqueo OK
        Pay->>Cart: Obtener y validar carrito
        Cart->>Redis: Verificar stock atómico
        Redis-->>Cart: Stock bloqueado OK
        Pay->>Stripe: POST /v1/payment_intents (amount, currency)
        Stripe-->>Pay: 200 OK (intent_id, client_secret)
        Pay->>DB: INSERT Order (status: PENDING_PAYMENT)
        Pay-->>Cliente: Retorna client_secret para confirmación
    end

    Note over Cliente, Stripe: El cliente confirma el pago en su navegador

    Stripe->>Gateway: POST /webhooks/stripe (Stripe-Signature)
    Gateway->>Pay: Validar webhook
    Pay->>Pay: Validar firma HMAC-SHA256 con webhook_secret
    
    alt Firma Inválida
        Pay-->>Stripe: 401 Unauthorized (Rechazo de evento)
    else Firma Válida
        Pay->>DB: UPDATE Order SET status='PAID' WHERE id=order_id
        Pay->>DB: INSERT PaymentTransaction (charge_id, SUCCESS)
        Pay->>Queue: Publicar evento 'OrderPaid'
        Pay-->>Stripe: 200 OK (Evento confirmado)
    end
```

---

## 3. Diagrama de Secuencia: Autenticación JWT con Desfase UTC

Demuestra la mitigación del bug `INT-003` para servidores con husos horarios dispares mediante tiempo Epoch UTC.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as 👤 Usuario
    participant Auth as ⚡ AuthService
    participant DB as 🐘 PostgreSQL
    participant Clock as ⏱️ UTC System Clock

    Usuario->>Auth: POST /auth/login (email, password)
    Auth->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Auth: Record con passwordHash y roles
    Auth->>Auth: bcrypt.compare(password, passwordHash)
    
    alt Credenciales Incorrectas
        Auth-->>Usuario: 401 Invalid Credentials
    else Credenciales Válidas
        Auth->>Clock: Obtener DateTime.UtcNow.ToUnixTimeSeconds()
        Clock-->>Auth: epoch_now (ej: 1718000000)
        Auth->>Auth: Generar Access Token (exp: epoch_now + 3600)
        Auth->>Auth: Generar Refresh Token (exp: epoch_now + 604800)
        Auth->>DB: Guardar RefreshToken hash
        Auth-->>Usuario: 200 OK { access_token, refresh_token, expires_in: 3600 }
    end
```

---

## 4. Diagrama de Casos de Uso (Use Case Diagram)

```mermaid
flowchart LR
    Customer((👤 Cliente))
    Admin((👤 Administrador))
    Worker((⚙️ Background Worker))

    subgraph CasosDeUso ["Casos de Uso del Sistema"]
        UC1([UC-01: Iniciar Sesión / Registro JWT])
        UC2([UC-02: Consultar Catálogo con Cursor])
        UC3([UC-03: Gestionar Carrito en Memoria])
        UC4([UC-04: Realizar Pago con Idempotencia])
        UC5([UC-05: Gestionar Roles RBAC])
        UC6([UC-06: Procesar Cola de Despacho con DLQ])
        UC7([UC-07: Ingestar Stream de Analítica])
        UC8([UC-08: Enviar Emails Transaccionales])
    end

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4

    Admin --> UC1
    Admin --> UC5

    Worker --> UC6
    Worker --> UC7
    Worker --> UC8
```
