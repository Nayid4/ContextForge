# Arquitectura — Estándares y buenas prácticas para proyectos .NET C#

> Este documento define el marco arquitectónico de referencia. Todo el código
> generado en el repositorio debe alinearse con estos principios. Si no está
> aquí, no es un requisito de arquitectura.

---

## Tabla de contenidos

1. [Principios SOLID](#1-principios-solid)
2. [Clean Architecture (capas)](#2-clean-architecture-capas)
3. [Patrones de diseño](#3-patrones-de-diseño)
4. [Domain-Driven Design (táctico)](#4-domain-driven-design-táctico)
5. [CQRS con MediatR](#5-cqrs-con-mediatr)
6. [Manejo de errores](#6-manejo-de-errores)
7. [Validaciones](#7-validaciones)
8. [Inyección de dependencias](#8-inyección-de-dependencias)
9. [Logging, tracing y métricas](#9-logging-tracing-y-métricas)
10. [Seguridad](#10-seguridad)
11. [Performance](#11-performance)
12. [Estrategia de pruebas](#12-estrategia-de-pruebas)

---

## 1. Principios SOLID

Cada principio tiene una manifestación concreta en este repositorio.

### S — Single Responsibility Principle (SRP)

> Una clase debe tener una única razón para cambiar.

- **Domain**: las entidades solo contienen lógica de negocio y reglas de
  integridad. No saben de persistencia, serialización ni presentación.
- **Application**: cada handler (`IRequestHandler<T, R>`) se ocupa de **un**
  caso de uso. No mezcles lógica de múltiples comandos en un mismo handler.
- **Infrastructure**: cada repositorio se ocupa de **una** raíz de agregado.

```csharp
// Correcto: UserRepository solo sabe de persistir Users
public sealed class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context) => _context = context;

    public Task<User?> GetByIdAsync(UserId id, CancellationToken ct)
        => _context.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
}
```

### O — Open/Closed Principle (OCP)

> Las entidades deben estar abiertas para extensión, cerradas para modificación.

```csharp
// Domain: los errores se extienden por composición, no modificando Error
public abstract record Error(string Code, string Description);

// Nuevos errores se crean como static class, no se modifica Error
public static class UserErrors
{
    public static readonly Error NotFound = new("User.NotFound", "Usuario no encontrado.");
    public static readonly Error InvalidEmail = new("User.InvalidEmail", "Email inválido.");
}
```

- Preferir herencia de interfaces o composición sobre modificar clases existentes.
- Usar `Strategy`, `Decorator`, `Chain of Responsibility» cuando un bloque de
  lógica deba ser extensible sin tocar el código existente.

### L — Liskov Substitution Principle (LSP)

> Los subtipos deben ser sustituibles por sus tipos base sin alterar la corrección
> del programa.

- Las implementaciones de interfaces (`IUserRepository`) deben cumplir el contrato
  definido en Domain. No lances excepciones no documentadas.
- Las clases derivadas no deben debilitar las precondiciones ni fortalecer las
  postcondiciones del tipo base.

```csharp
// Correcto: ambas implementaciones respetan el contrato de IUserRepository
public sealed class UserRepository : IUserRepository { /* ... */ }
public sealed class InMemoryUserRepository : IUserRepository { /* ... */ }
```

### I — Interface Segregation Principle (ISP)

> Los clientes no deben ser forzados a depender de interfaces que no usan.

- Interfaces pequeñas y cohesivas (principio de granularidad).
- Un repositorio expone solo los métodos que su agregado necesita.

```csharp
// Correcto: cada interfaz tiene un propósito claro
public interface IUserRepository
{
    Task<User?> GetByIdAsync(UserId id, CancellationToken ct);
    Task AddAsync(User user, CancellationToken ct);
}

public interface INotificationService
{
    Task SendAsync(Notification notification, CancellationToken ct);
}
```

### D — Dependency Inversion Principle (DIP)

> Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos
> deben depender de abstracciones.

- **Domain** define las interfaces de repositorio (abstracción).
- **Infrastructure** implementa esas interfaces.
- **Application** depende solo de las interfaces, nunca de Infrastructure.

```csharp
// Application depende de abstracción (IUserRepository), no de implementación
public sealed class CreateUserHandler : IRequestHandler<CreateUserCommand, Result<UserId>>
{
    private readonly IUserRepository _repository; // ← abstracción

    public CreateUserHandler(IUserRepository repository) => _repository = repository;
}
```

---

## 2. Clean Architecture (capas)

### Estructura de proyectos

```
src/
├── {ProjectName}.Domain/               ← Capa más interna: entidades, value objects,
│   ├── Entities/                           agregados, interfaces de repositorio,
│   ├── ValueObjects/                       errores de dominio, enums.
│   ├── Aggregates/
│   ├── Interfaces/
│   └── Errors/
│
├── {ProjectName}.Application/          ← Casos de uso (commands/queries con MediatR),
│   ├── Commands/                          DTOs, interfaces de servicios de aplicación,
│   ├── Queries/                           validaciones con FluentValidation,
│   ├── Dtos/                              mapeadores (Mapster/Manual).
│   ├── Mappings/
│   ├── Interfaces/
│   └── Validators/
│
├── {ProjectName}.Infrastructure/       ← Implementaciones concretas: EF Core DbContext,
│   ├── Data/                              repositorios, servicios de terceros,
│   ├── Repositories/                      adaptadores de logging/envío de emails,
│   ├── Services/                          autenticación, caché.
│   ├── Authentication/
│   ├── Cache/
│   └── DependencyInjection/
│
└── {ProjectName}.Api/                  ← Punto de entrada: Controllers / Minimal APIs,
    ├── Controllers/                       middlewares, filtros de excepción,
    ├── Endpoints/                         configuración DI raíz, OpenAPI/Swagger.
    ├── Middleware/
    ├── Filters/
    └── Program.cs

tests/
├── {ProjectName}.Domain.Tests/         ← Unitarios puros (sin IO, sin DB)
├── {ProjectName}.Application.Tests/    ← Unitarios con mocks de repositorios
├── {ProjectName}.Infrastructure.Tests/ ← Integración con DB (InMemory o testcontainers)
└── {ProjectName}.Api.Tests/            ← Integración con WebApplicationFactory<Program>
```

### Reglas de dependencia

```
        ┌──────────────────────────────────┐
        │           Api (UI)               │
        │  Controllers / Minimal APIs      │
        └──────────┬───────────────────────┘
                   │
        ┌──────────▼───────────────────────┐
        │       Application (Use Cases)    │
        │  Commands, Queries, Handlers     │
        └──────────┬───────────────────────┘
                   │
        ┌──────────▼───────────────────────┐
        │       Domain (Enterprise Biz)    │
        │  Entities, VOs, Interfaces       │
        └──────────┬───────────────────────┘
                   │
        ┌──────────▼───────────────────────┐
        │    Infrastructure (Persistence)   │
        │  EF Core, Repos, Ext Services    │
        └──────────────────────────────────┘
```

1. **Domain** — no referencia ninguna capa ni paquete NuGet externo (solo BCL:
   `System.*`). Es el núcleo puro del negocio.
2. **Application** — referencia Domain. No referencia Infrastructure ni Api.
3. **Infrastructure** — referencia Application (para implementar sus interfaces).
   No referencia Api.
4. **Api** — referencia Application e Infrastructure (solo para registro DI).
   Nunca referencia directamente Domain desde los endpoints; siempre a través
   de Application.

### Dependencias NuGet permitidas por capa

| Capa           | Paquetes permitidos                                                                   |
| -------------- | ------------------------------------------------------------------------------------- |
| Domain         | Ninguno externo. Solo `System.*`                                                      |
| Application    | `MediatR`, `FluentValidation`, `Mapster` (o AutoMapper), `Microsoft.Extensions.*`     |
| Infrastructure | EF Core + driver DB, `Microsoft.Extensions.Configuration`, `Microsoft.Extensions.Logging` |
| Api            | `Microsoft.AspNetCore.*`, `Serilog.AspNetCore`, `Swashbuckle` / `NSwag`, `FluentValidation.AspNetCore` |
| Tests          | `xUnit`, `FluentAssertions`, `NSubstitute`, `Microsoft.NET.Test.Sdk`, `Testcontainers` (para integración) |

---

## 3. Patrones de diseño

### Patrones creacionales

#### Factory Method

Usado cuando la creación de una entidad requiere validación o lógica de negocio.

```csharp
public sealed class User
{
    private User(UserId id, Email email, Name name)
    {
        Id = id;
        Email = email;
        Name = name;
    }

    public UserId Id { get; }
    public Email Email { get; }
    public Name Name { get; }

    public static Result<User> Create(Email email, Name name)
    {
        // Validación de negocio
        if (email is null)
            return Result.Failure<User>(UserErrors.InvalidEmail);

        var user = new User(UserId.New(), email, name);
        return Result.Success(user);
    }
}
```

#### Builder

Para construcción de objetos complejos o tests (Test Data Builder).

```csharp
internal sealed class UserBuilder
{
    private Email _email = Email.Create("default@test.com").Value;
    private Name _name = Name.Create("Default").Value;

    public UserBuilder WithEmail(Email email) { _email = email; return this; }
    public UserBuilder WithName(Name name) { _name = name; return this; }

    public Result<User> Build() => User.Create(_email, _name);
}
```

### Patrones estructurales

#### Decorator

Para añadir comportamientos transversales (logging, caché, retry) sin modificar
el handler original.

```csharp
public sealed class LoggingHandler<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger _logger;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        _logger.LogInformation("Handling {Request}", typeof(TRequest).Name);
        var response = await next(ct);
        _logger.LogInformation("Handled {Request}", typeof(TRequest).Name);
        return response;
    }
}
```

#### Adapter

Para aislar dependencias externas (servicios de terceros, SDKs).

```csharp
// Interfaz en Application
public interface IPaymentGateway
{
    Task<PaymentResult> ChargeAsync(PaymentRequest request, CancellationToken ct);
}

// Adaptador en Infrastructure
public sealed class StripePaymentGateway : IPaymentGateway
{
    private readonly StripeClient _client;

    public StripePaymentGateway(StripeClient client) => _client = client;

    public async Task<PaymentResult> ChargeAsync(PaymentRequest request, CancellationToken ct)
    {
        // Traducción de request a SDK de Stripe
        var options = new ChargeCreateOptions { /* ... */ };
        var charge = await _client.Charge.CreateAsync(options, cancellationToken: ct);
        return PaymentResult.FromStripe(charge);
    }
}
```

### Patrones de comportamiento

#### Strategy

Para algoritmos intercambiables (descuentos, impuestos, notificaciones).

```csharp
public interface ITaxStrategy
{
    decimal Calculate(decimal amount);
}

public sealed class VatTaxStrategy : ITaxStrategy
{
    public decimal Calculate(decimal amount) => amount * 0.21m;
}

public sealed class NoTaxStrategy : ITaxStrategy
{
    public decimal Calculate(decimal amount) => 0;
}
```

#### Chain of Responsibility

Para pipelines de procesamiento o validaciones encadenadas.

```csharp
public abstract class OrderValidator
{
    private OrderValidator? _next;

    public OrderValidator SetNext(OrderValidator next)
    {
        _next = next;
        return next;
    }

    public virtual Result Validate(Order order)
        => _next?.Validate(order) ?? Result.Success(Unit.Value);
}

public sealed class StockValidator : OrderValidator
{
    public override Result Validate(Order order)
    {
        if (!HasStock(order))
            return Result.Failure(OrderErrors.OutOfStock);
        return base.Validate(order);
    }
}
```

#### Observer / Eventos de dominio

Para comunicación entre agregados sin acoplamiento.

```csharp
// Evento de dominio
public sealed record UserCreatedEvent(UserId UserId, Email Email) : IDomainEvent;

// Handler en Application
public sealed class SendWelcomeEmailHandler : INotificationHandler<UserCreatedEvent>
{
    private readonly IEmailService _emailService;

    public async Task Handle(UserCreatedEvent notification, CancellationToken ct)
    {
        await _emailService.SendWelcomeAsync(notification.Email, ct);
    }
}
```

---

## 4. Domain-Driven Design (táctico)

### Entidades

Tienen identidad (comúnmente `Guid` o `record` con `Id`). Se comparan por
identidad, no por atributos.

```csharp
public sealed class Order
{
    public OrderId Id { get; private set; }
    public CustomerId CustomerId { get; private set; }
    private readonly List<OrderLine> _lines = [];
    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();
    public OrderStatus Status { get; private set; }

    private Order(OrderId id, CustomerId customerId)
    {
        Id = id;
        CustomerId = customerId;
        Status = OrderStatus.Pending;
    }

    public static Result<Order> Create(CustomerId customerId)
    {
        if (customerId is null)
            return Result.Failure<Order>(OrderErrors.InvalidCustomer);
        return Result.Success(new Order(OrderId.New(), customerId));
    }

    public Result AddLine(ProductId productId, Quantity quantity, Money price)
    {
        if (Status != OrderStatus.Pending)
            return Result.Failure(OrderErrors.CannotModifyConfirmedOrder);
        _lines.Add(new OrderLine(productId, quantity, price));
        return Result.Success(Unit.Value);
    }
}
```

### Value Objects

Inmutables, sin identidad. Se comparan por estructura.

```csharp
public sealed record Email
{
    public string Value { get; }

    private Email(string value) => Value = value;

    public static Result<Email> Create(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Failure<Email>(EmailErrors.Empty);

        if (!Regex.IsMatch(value, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            return Result.Failure<Email>(EmailErrors.InvalidFormat);

        return Result.Success(new Email(value.ToLowerInvariant()));
    }
}
```

### Agregados

Racimo de entidades y value objects que se tratan como una unidad. Transaccional
consistente.

- Elegir la raíz de agregado: una entidad que es el punto de entrada al agregado.
- La raíz garantiza las invariantes del agregado.
- Los repositorios trabajan **solo** con raíces de agregado.

```csharp
// Aggregate root
public sealed class Order
{
    public OrderId Id { get; private set; }
    public CustomerId CustomerId { get; private set; }
    private readonly List<OrderLine> _lines = [];
    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();
    public Money Total => CalculateTotal();

    // Invariante: no se pueden añadir líneas a una orden confirmada
    public Result AddLine(ProductId productId, Quantity quantity, Money price)
    {
        if (Status != OrderStatus.Pending)
            return Result.Failure(OrderErrors.CannotModifyConfirmedOrder);
        // ...
    }
}
```

### Eventos de dominio

Notifican que algo relevante ocurrió en el dominio. Disparan efectos secundarios
en otros agregados o bounded contexts.

```csharp
// Definición (record sellado)
public sealed record UserCreatedEvent(UserId UserId, Email Email) : IDomainEvent;

// Disparo desde la entidad (opcional, también desde Application)
public sealed class User
{
    private readonly List<IDomainEvent> _domainEvents = [];
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public static User Create(Email email, Name name)
    {
        var user = new User(UserId.New(), email, name);
        user._domainEvents.Add(new UserCreatedEvent(user.Id, email));
        return user;
    }

    public void ClearEvents() => _domainEvents.Clear();
}
```

### Repositorios

Interfaz en Domain, implementación en Infrastructure. Solo para raíces de agregado.

```csharp
// Domain
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(OrderId id, CancellationToken ct = default);
    Task AddAsync(Order order, CancellationToken ct = default);
    Task UpdateAsync(Order order, CancellationToken ct = default);
    Task DeleteAsync(OrderId id, CancellationToken ct = default);
}
```

---

## 5. CQRS con MediatR

Separación de comandos (escriben) y queries (leen).

```csharp
// ─── Command (escribe) ───
public sealed record CreateUserCommand(Email Email, Name Name) : IRequest<Result<UserId>>;

public sealed class CreateUserHandler : IRequestHandler<CreateUserCommand, Result<UserId>>
{
    private readonly IUserRepository _repository;
    private readonly IPublisher _publisher;

    public CreateUserHandler(IUserRepository repository, IPublisher publisher)
    {
        _repository = repository;
        _publisher = publisher;
    }

    public async Task<Result<UserId>> Handle(CreateUserCommand command, CancellationToken ct)
    {
        var userResult = User.Create(command.Email, command.Name);
        if (userResult.IsFailure)
            return Result.Failure<UserId>(userResult.Error);

        await _repository.AddAsync(userResult.Value, ct);

        // Publicar eventos de dominio
        foreach (var domainEvent in userResult.Value.DomainEvents)
            await _publisher.Publish(domainEvent, ct);

        return Result.Success(userResult.Value.Id);
    }
}

// ─── Query (solo lectura) ───
public sealed record GetUserQuery(UserId UserId) : IRequest<Result<UserDto>>;

public sealed class GetUserHandler : IRequestHandler<GetUserQuery, Result<UserDto>>
{
    private readonly IUserRepository _repository;

    public GetUserHandler(IUserRepository repository) => _repository = repository;

    public async Task<Result<UserDto>> Handle(GetUserQuery query, CancellationToken ct)
    {
        var user = await _repository.GetByIdAsync(query.UserId, ct);
        if (user is null)
            return Result.Failure<UserDto>(UserErrors.NotFound);

        return Result.Success(UserDto.FromEntity(user));
    }
}
```

### Pipeline behaviors (cross-cutting)

```csharp
// Validación automática
public sealed class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (_validators.Any())
        {
            var context = new ValidationContext<TRequest>(request);
            var failures = _validators
                .Select(v => v.Validate(context))
                .SelectMany(r => r.Errors)
                .Where(f => f is not null)
                .ToList();

            if (failures.Count != 0)
                throw new ValidationException(failures);
        }

        return await next(ct);
    }
}
```

### Separación estricta commands/queries

| Característica       | Command                      | Query                         |
| -------------------  | ---------------------------- | ----------------------------- |
| Intención            | Escribir / mutar             | Leer / consultar              |
| Return type          | `Result<Unit>` o `Result<Id>`| `Result<TDto>`                |
| Side effects         | Sí                           | No                            |
| Caché                | Invalidar                    | Consultar                     |
| Validación           | Reglas de negocio            | Validación de parámetros      |

---

## 6. Manejo de errores

### Patrón Result (preferido sobre excepciones)

El dominio **nunca lanza excepciones** para flujo de control. Usa el patrón `Result`.

```csharp
// Domain/Errors/Error.cs
public abstract record Error(string Code, string Description);

// Domain/Errors/UserErrors.cs
public static class UserErrors
{
    public static readonly Error NotFound = new("User.NotFound", "El usuario no existe.");
    public static readonly Error DuplicateEmail = new("User.DuplicateEmail", "El email ya está registrado.");
    public static readonly Error InvalidEmail = new("User.InvalidEmail", "El formato del email es inválido.");
}

// Result<T> genérico
public sealed record Result<T>
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public T Value { get; }
    public Error Error { get; }

    private Result(T value)
    {
        IsSuccess = true;
        Value = value;
        Error = default!;
    }

    private Result(Error error)
    {
        IsSuccess = false;
        Value = default!;
        Error = error;
    }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(Error error) => new(error);

    public static implicit operator Result<T>(T value) => Success(value);
}
```

### Cuándo usar excepciones

Solo para errores irrecuperables del programador (bugs) o del sistema:

- Argumentos `null` inesperados (`ArgumentNullException`).
- Invariantes violadas que deberían ser imposibles (`InvalidOperationException`).
- Fallos de infraestructura irrecuperables (disco lleno, red caída sin retry).

### Mapeo de errores a HTTP (Api)

```csharp
public sealed class ResultToHttpMapper
{
    public static IResult ToHttpResponse<T>(Result<T> result)
    {
        if (result.IsSuccess)
            return Results.Ok(result.Value);

        return result.Error.Code switch
        {
            "User.NotFound" => Results.NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = result.Error.Description,
                Status = StatusCodes.Status404NotFound
            }),
            "User.DuplicateEmail" => Results.Conflict(new ProblemDetails
            {
                Title = "Conflict",
                Detail = result.Error.Description,
                Status = StatusCodes.Status409Conflict
            }),
            _ => Results.BadRequest(new ProblemDetails
            {
                Title = "Bad Request",
                Detail = result.Error.Description,
                Status = StatusCodes.Status400BadRequest
            })
        };
    }
}
```

---

## 7. Validaciones

### Primera barrera: Value Objects

Los Value Objects se autovalidan en su factory `Create`.

```csharp
public sealed record Email
{
    public string Value { get; }
    private Email(string value) => Value = value;

    public static Result<Email> Create(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Failure<Email>(EmailErrors.Empty);
        return Result.Success(new Email(value));
    }
}
```

### Segunda barrera: FluentValidation en Application

Cada command/query tiene su validador.

```csharp
public sealed class CreateUserValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}
```

Los validadores se registran automáticamente con `ValidationBehavior` en MediatR.

### Principios de validación

- **Fail fast:** valida en la capa más externa posible (API/Application) antes
  de llegar al dominio.
- **El dominio siempre valida sus invariantes** (en factories y métodos) incluso
  si ya se validó antes. No confíes en capas externas.
- Las validaciones de infraestructura (unique constraint, FK) son el último
  recurso, no el primero.

---

## 8. Inyección de dependencias

### Registro por capa

Cada proyecto expone un método de extensión para registrar sus servicios.

```csharp
// Infrastructure/DependencyInjection/DependencyInjection.cs
public static class InfrastructureDependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("Default")));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();

        return services;
    }
}
```

```csharp
// Application/DependencyInjection/DependencyInjection.cs
public static class ApplicationDependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(ApplicationDependencyInjection).Assembly));

        services.AddValidatorsFromAssembly(typeof(ApplicationDependencyInjection).Assembly);

        return services;
    }
}
```

```csharp
// Api/Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapEndpoints(); // Extension method para Minimal APIs

app.Run();
```

### Reglas DI

- **Scoped** para DbContext y repositorios (por request HTTP).
- **Singleton** para servicios sin estado (caché, logging, configuración).
- **Transient** para handlers de MediatR y validadores.
- No usar Service Locator (`IServiceProvider.GetRequiredService`). Solo
  inyección por constructor.

---

## 9. Logging, tracing y métricas

### Logging estructurado (Serilog)

```csharp
// Api/Program.cs
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.Seq("http://localhost:5341")
    .Enrich.WithCorrelationId()
    .Enrich.WithEnvironmentName()
    .CreateLogger();

builder.Host.UseSerilog();
```

- **Nivel DEBUG:** solo en desarrollo, para diagnóstico detallado.
- **Nivel INFORMATION:** eventos de negocio (usuario creado, orden pagada).
- **Nivel WARNING:** condiciones inesperadas pero manejables (retry exitoso).
- **Nivel ERROR:** fallos que requieren atención humana.

Siempre usar logging estructurado con placeholders, nunca interpolación.

```csharp
// Correcto
_logger.LogInformation("User {UserId} created at {Timestamp}", user.Id, DateTime.UtcNow);

// Incorrecto
_logger.LogInformation($"User {user.Id} created at {DateTime.UtcNow}");
```

### OpenTelemetry

Para tracing distribuido y métricas.

```csharp
builder.Services.AddOpenTelemetry()
    .WithAspNetCoreInstrumentation()
    .WithHttpClientInstrumentation()
    .WithTracing(tracing => tracing
        .AddSource("MediatR")
        .AddOtlpExporter())
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddPrometheusExporter());
```

---

## 10. Seguridad

### Autenticación (JWT Bearer)

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://your-identity-server";
        options.Audience = "your-api";
        options.TokenValidationParameters.ValidateLifetime = true;
    });
```

### Autorización (claims/policies)

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy =>
        policy.RequireRole("Admin"));
    options.AddPolicy("CanManageOrders", policy =>
        policy.RequireClaim("permission", "orders:write"));
});
```

### Principios de seguridad

- **Input validation** en todas las capas (API → Application → Domain).
- **Output encoding** — nunca devolver datos internos (stack traces, IDs de BD)
  en respuestas de error.
- **OWASP Top 10** — prevenir SQL Injection (EF Core lo maneja con LINQ),
  XSS (no devolver HTML desde la API), CSRF (antiforgery tokens en endpoints
  con cookies).
- **Secrets management** — usar User Secrets en desarrollo, Azure Key Vault /
  AWS Secrets Manager / variables de entorno en producción. Nunca secretos
  hardcodeados.

### Rate limiting (.NET 10)

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("Api", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
    });
});
```

---

## 11. Performance

### Principios

- **Async all the way** — I/O-bound operations siempre con async/await.
  Nunca `.Result` o `.Wait()`.
- **Paginación** en todas las listas. Nunca devolver `IEnumerable<T>` sin paginar.
- **No N+1 queries** — usar `Include` / `ThenInclude` en EF Core o `ProjectTo`.
- **Caché** en queries de alta frecuencia con `IMemoryCache` o `IDistributedCache`.
- **Connection pooling** — EF Core maneja pool por defecto. No abrir/cerrar
  conexiones manualmente.

### Buenas prácticas con EF Core

```csharp
// Correcto: proyección a DTO solo con los campos necesarios
var users = await _context.Users
    .Where(u => u.IsActive)
    .Select(u => new UserListItemDto(u.Id, u.Name, u.Email))
    .ToListAsync(ct);

// Correcto: paginación
var page = await _context.Orders
    .OrderByDescending(o => o.CreatedAt)
    .Skip((request.Page - 1) * request.PageSize)
    .Take(request.PageSize)
    .ToListAsync(ct);

// Evitar: traer entidades completas si solo necesitas 2 campos
var users = await _context.Users.Where(u => u.IsActive).ToListAsync(ct);
return users.Select(u => new UserListItemDto(u.Id, u.Name, u.Email));
```

### Async en toda la pila

```csharp
// Domain interface
public interface IUserRepository
{
    Task<User?> GetByIdAsync(UserId id, CancellationToken ct);
    Task AddAsync(User user, CancellationToken ct);
}

// Application handler
public async Task<Result<UserId>> Handle(CreateUserCommand command, CancellationToken ct)
{
    var user = User.Create(command.Email, command.Name);
    if (user.IsFailure)
        return Result.Failure<UserId>(user.Error);
    await _repository.AddAsync(user.Value, ct);
    return Result.Success(user.Value.Id);
}
```

---

## 12. Estrategia de pruebas

### La pirámide de tests

```
        ╱╲
       ╱  ╲           E2E (pocos, críticos)
      ╱    ╲
     ╱──────╲
    ╱        ╲        Integration (algunos)
   ╱          ╲
  ╱────────────╲
 ╱              ╲     Unit tests (muchos, rápidos)
╱                ╲
```

### Unit tests (80%+ del esfuerzo)

- Prueban **una clase** en aislamiento.
- Sin IO, sin DB. Mocks de interfaces con NSubstitute.
- Cubren: happy path + edge cases + errores.

```csharp
public class CreateUserHandlerTests
{
    private readonly IUserRepository _repository = Substitute.For<IUserRepository>();
    private readonly IPublisher _publisher = Substitute.For<IPublisher>();
    private readonly CreateUserHandler _handler;

    public CreateUserHandlerTests()
    {
        _handler = new CreateUserHandler(_repository, _publisher);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ReturnsUserId()
    {
        // Arrange
        var email = Email.Create("test@example.com").Value;
        var name = Name.Create("Test").Value;
        var command = new CreateUserCommand(email, name);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        _repository.Received(1).AddAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }
}
```

### Integration tests (15%)

- Prueban la interacción real entre capas (con DB real o InMemory).
- Usar `WebApplicationFactory<Program>` para la API.

```csharp
public class UsersEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public UsersEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ConnectionStrings:Default", "DataSource=:memory:");
        }).CreateClient();
    }

    [Fact]
    public async Task PostUser_WithValidData_Returns201()
    {
        var payload = new { email = "user@test.com", name = "Test User" };
        var response = await _client.PostAsJsonAsync("/api/users", payload);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
```

### E2E tests (5%)

- Pruebas de hum humo sobre el sistema completo desplegado.
- Herramientas: Playwright, Selenium, o HTTP requests contra entorno de staging.

### Reglas de tests

| Regla                                       | Explicación                                                    |
| ------------------------------------------- | -------------------------------------------------------------- |
| Un archivo de test por clase de producción  | `Tests/<Capa>/<Clase>Tests.cs`                                 |
| Nombre de test: `<Método>_<Escenario>_<Resultado>` | `Create_WithInvalidEmail_ReturnsError`                   |
| AAA explícito                               | Separar Arrange / Act / Assert con comentarios o regiones      |
| Sin dependencia de orden                    | Cada test debe poder ejecutarse solo                           |
| Sin estado compartido mutable               | No `static` mutable entre tests                                |
| Sin acceso a recursos externos              | No llamar a APIs reales, DBs de prod, etc.                    |
| Una aserción conceptual por test            | Preferir un `Should().Be()` por test, o agrupar aserciones relacionadas |

---

## Referencias

- [Microsoft Architecture Guides](https://learn.microsoft.com/en-us/dotnet/architecture/)
- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design — Eric Evans](https://domainlanguage.com/ddd/)
- [CQRS + MediatR — Jimmy Bogard](https://github.com/jbogard/ContosoUniversity)
- [FluentValidation Docs](https://docs.fluentvalidation.net/)
- [Serilog Best Practices](https://benfoster.io/blog/serilog-best-practices/)
