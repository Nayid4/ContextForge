# Catálogo Canónico de Historias de Usuario & Marco Ágil (INVEST / SCRUM / XP)

> [!NOTE]
> Este catálogo centraliza las Historias de Usuario (US) del proyecto diseñadas con rigor de ingeniería bajo los principios **INVEST**, el marco ágil **SCRUM** (DoR/DoD) y las prácticas técnicas de **Extreme Programming (XP)**.
> Cuando solicites a un agente o desarrollador "generar historias para [funcionalidad]", este catálogo debe consultarse en primer lugar para detectar si la capacidad ya existe o qué módulos deben extenderse.

---

## 1. Principios INVEST en la Redacción de Historias

Toda historia en este arnés cumple con las 6 propiedades INVEST:

| Letra | Principio | Aplicación en el Arnés |
| :---: | :--- | :--- |
| **I** | **Independent** (Independiente) | La historia puede planificarse, implementarse y desplegarse sin bloqueos circulares con otras historias. |
| **N** | **Negotiable** (Negociable) | Los detalles técnicos específicos se afinan en el spec (`tasks.md` / `decisions.md`) sin fijar prematuramente la implementación. |
| **V** | **Valuable** (Valiosa) | Aporta valor tangible medible al usuario final o a la estabilidad arquitectural del sistema. |
| **E** | **Estimable** (Estimable) | El alcance y los bounded contexts afectados están acotados para poder estimar el esfuerzo con exactitud. |
| **S** | **Small** (Pequeña / Acotada) | Dimensionada para implementarse dentro de una sola rama `{type}/INT-{id}/{name}` (≤80 caracteres). |
| **T** | **Testable** (Comprobable) | Incluye criterios de aceptación en formato Gherkin ejecutables con pruebas unitarias y de integración. |

---

## 2. Acuerdos de Calidad: DoR y DoD (SCRUM)

### Definición de Preparado (Definition of Ready - DoR)
Antes de que una tarea pase de `pending` a `in_progress`, DEBE cumplir:
1. **Historia redactada bajo formato canónico**: *Como [rol], quiero [acción] para [beneficio]*.
2. **Criterios de Aceptación definidos**: Al menos 2 escenarios Given/When/Then verificables.
3. **Requerimiento Funcional (`RF-*`) y Reglas de Negocio (`BR-*`) identificadas**: Sin ambigüedad sobre invariantes que aplican.
4. **Rama Git creada**: Siguiendo la convención estricta `{type}/INT-{numero}/{nombre_rama}` (máximo 80 caracteres).
5. **Aprobación Humana**: Puerta obligatoria `ask_question` aprobada por el líder técnico.

### Definición de Hecho (Definition of Done - DoD)
Una tarea solo puede marcarse como `completed` si cumple:
1. **Código implementado**: Siguiendo la técnica recomendada (TDD, SDD o FTD).
2. **Build Limpio**: Compilación sin advertencias (`dotnet build /warnaserror` o linter equivalente en cero errores).
3. **Tests Aprobados al 100%**: Suite de pruebas unitarias y de integración pasando en verde.
4. **Trazabilidad Verificada**: Registro R $\leftrightarrow$ Tests documentado en `progress/impl_{name}.md`.
5. **Verificación de dependencias**: Ejecución exitosa de `verify.sh`.
6. **Commit Semántico**: Mensaje bajo estándar Conventional Commits (`feat(scope): ...` o `fix(scope): ...`).

---

## 3. Prácticas Técnicas de Extreme Programming (XP) Integradas

1. **Test-Driven Development (TDD)**:
   - Para lógica de negocio, cálculos monetarios o autenticación: escribir primero el test fallando (Rojo), escribir el código mínimo para pasar (Verde), y refactorizar con seguridad.
2. **Refactorización Continua**:
   - Mejora del diseño del código sin alterar su comportamiento externo, respaldada por la suite de pruebas automatizadas.
3. **Pair Programming Agéntico (Human-in-the-Loop)**:
   - El agente de IA actúa como copiloto de ingeniería y el humano como auditor en las puertas de decisión clave (`ask_question`).
4. **Metáfora del Sistema**:
   - Todo el equipo y los agentes comparten el mismo Modelo C4 y Lenguaje Ubicuo (DDD) documentado en `project-docs/knowledge/`.
5. **Entregas Pequeñas e Incrementales**:
   - Cada tarea `INT-*` produce un cambio autónomo, atómico y verificable.

---

## 4. Catálogo de Historias de Usuario Existentes

### US-001: Autenticación de Usuarios y Roles Seguros
- **Ticket**: `INT-002` | **Módulo**: `auth` | **Técnica**: TDD
- **Historia**:
  > **Como** usuario registrado de la plataforma CloudSaaS,  
  > **quiero** iniciar sesión con mis credenciales y recibir un token de acceso seguro,  
  > **para** acceder a los recursos protegidos según mi rol asignado.
- **Criterios de Aceptación (INVEST Testable)**:
  - **Escenario 1**: Credenciales correctas generan JWT con timestamps en Epoch UTC y duración de 15 minutos (`BR-AUTH-001`).
  - **Escenario 2**: Intento con contraseña errónea bloquea temporalmente tras 5 intentos fallidos y retorna HTTP 401 Problem Details.
- **Trazabilidad**: Satisface `RF-AUTH-001` y regla `BR-AUTH-001`.

---

### US-002: Consulta de Catálogo Paginado de Alto Desempeño
- **Ticket**: `INT-004` | **Módulo**: `catalog` | **Técnica**: SDD
- **Historia**:
  > **Como** comprador en la tienda virtual,  
  > **quiero** navegar por el catálogo de productos con paginación fluida y filtros por categoría,  
  > **para** encontrar rápidamente los productos que deseo sin demoras de carga.
- **Criterios de Aceptación**:
  - **Escenario 1**: Consulta inicial retorna los primeros 20 productos y un cursor opaco para la siguiente página.
  - **Escenario 2**: Respuestas cacheadas en Redis se entregan con latencia menor a 50 ms (`RNF-PERF-001`).
- **Trazabilidad**: Satisface `RF-CAT-001`.

---

### US-003: Gestión Concurrente del Carrito de Compras
- **Ticket**: `INT-005` | **Módulo**: `cart` | **Técnica**: TDD
- **Historia**:
  > **Como** cliente explorando productos,  
  > **quiero** agregar, modificar y eliminar artículos de mi carrito en cualquier momento,  
  > **para** preparar mi compra sin temor a que el inventario se desincronice por concurrencia.
- **Criterios de Aceptación**:
  - **Escenario 1**: Múltiples adiciones simultáneas se procesan de forma atómica en Redis sin condiciones de carrera (`BR-CART-002`).
  - **Escenario 2**: El carrito expira automáticamente a las 72 horas de inactividad liberando la memoria.
- **Trazabilidad**: Satisface `RF-CART-001` y regla `BR-CART-002`.

---

### US-004: Checkout Idempotente y Procesamiento con Stripe
- **Ticket**: `INT-006` | **Módulo**: `billing` | **Técnica**: SDD
- **Historia**:
  > **Como** cliente listo para pagar,  
  > **quiero** confirmar mi pedido mediante un checkout seguro con tarjeta,  
  > **para** adquirir mis productos con la certeza de que nunca se me cobrará dos veces si hay un fallo de red.
- **Criterios de Aceptación**:
  - **Escenario 1**: Toda petición debe enviar la cabecera `Idempotency-Key`; si se repite la petición dentro de 24 horas, se devuelve el mismo resultado sin duplicar cargos (`BR-BILL-001`).
  - **Escenario 2**: Los impuestos y descuentos aplican Banker's Rounding exacto a dos decimales (`BR-BILL-003`).
- **Trazabilidad**: Satisface `RF-BILL-001`, `BR-BILL-001`, `BR-BILL-002`, `BR-BILL-003`.

---

### US-005: Resiliencia de Órdenes y Cola de Mensajes Muertos (DLQ)
- **Ticket**: `INT-008` | **Módulo**: `orders` | **Técnica**: SDD
- **Historia**:
  > **Como** operador de operaciones y soporte,  
  > **quiero** que las órdenes fallidas se reintenten automáticamente con backoff y se deriven a una Dead Letter Queue si persisten los errores,  
  > **para** garantizar que ningún pedido se pierda y poder investigar incidentes rápidamente.
- **Criterios de Aceptación**:
  - **Escenario 1**: Hasta 3 reintentos automáticos ante excepciones transitorias.
  - **Escenario 2**: Desvío a `orders.dlq` tras el 3er fallo con cabecera de auditoría (`BR-ORDR-001`).
- **Trazabilidad**: Satisface `RF-ORDR-001` y regla `BR-ORDR-001`.
