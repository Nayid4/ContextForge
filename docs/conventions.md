# Convenciones de código — C# / .NET

> Homogeneidad extrema. La IA predice mejor cuando el repositorio se parece
> a sí mismo en todas partes. Cada línea debe ser indistinguible de quién
> (o qué) la escribió.

---

## Tabla de contenidos

1. [SDK y runtime](#1-sdk-y-runtime)
2. [Estilo general](#2-estilo-general)
3. [Nombres](#3-nombres)
4. [Estructura de archivos](#4-estructura-de-archivos)
5. [Tipos: class, record, struct](#5-tipos-class-record-struct)
6. [Nullables y nulabilidad](#6-nullables-y-nulabilidad)
7. [Inmutabilidad](#7-inmutabilidad)
8. [Async / Await](#8-async--await)
9. [LINQ](#9-linq)
10. [Manejo de errores](#10-manejo-de-errores)
11. [Excepciones](#11-excepciones)
12. [Inyección de dependencias](#12-inyección-de-dependencias)
13. [Serialización](#13-serialización)
14. [Tests](#14-tests)
15. [Comentarios y documentación XML](#15-comentarios-y-documentación-xml)
16. [Configuración de proyectos](#16-configuración-de-proyectos)
17. [Roslyn analyzers](#17-roslyn-analyzers)
18. [Git](#18-git)

---

## 1. SDK y runtime

| Propiedad                         | Valor                                          |
| --------------------------------- | ----------------------------------------------- |
| SDK                               | .NET 10 / .NET 9 / .NET 8 según hoja de ruta   |
| Target framework                  | `net10.0` (o el vigente en el proyecto)         |
| C# Language version               | `latest` (C# 13+ en .NET 10)                   |
| Nullable reference types          | `enable`                                        |
| ImplicitUsings                    | `enable`                                        |
| TreatWarningsAsErrors             | `true`                                          |
| Deterministic builds              | `true`                                          |
| ContinuousIntegrationBuild        | `true` en CI/CD                                 |

Estas propiedades se definen en `Directory.Build.props` en la raíz. **No** se
sobrescriben en proyectos individuales salvo excepción justificada.

---

## 2. Estilo general

### Formateo

| Regla                         | Estándar                                         |
| ----------------------------- | ------------------------------------------------ |
| Indentación                   | 4 espacios. No tabs.                             |
| Ancho máximo de línea         | 120 caracteres.                                  |
| Fin de línea                  | LF (`\n`). No CRLF.                              |
| UTF-8 BOM                     | No.                                              |
| Llaves (classes, methods)     | Allman style (línea siguiente).                  |
| Llaves (propiedades, if, for) | Allman style. Excepción: `else` en misma línea.  |
| Espacios                       | Un espacio después de `if`, `for`, `while`, `catch`. |
| `using`                       | Fuera del namespace (file-scoped namespaces).    |
| Orden de `using`              | 1. `System.*` → 2. NuGet → 3. Proyecto propio.  Dentro de cada grupo: alfabético. |
| Modificadores                 | Un modificador por línea en el orden correcto (ver abajo). |
| `new`                         | Usar `Target-typed new()` donde el tipo sea obvio: `Order order = new();` |

### Orden de modificadores

```
public / internal / private / protected
static
sealed / abstract / virtual / override
readonly
partial
unsafe
extern
```

### Strings

| Regla                                         | Ejemplo                                       |
| --------------------------------------------- | --------------------------------------------- |
| Interpolación con `$` siempre                 | `$"Hello, {name}!"`                          |
| Prohibido concatenar con `+`                  | ❌ `"Hello, " + name`                         |
| Prohibido `string.Format`                     | ❌ `string.Format("Hello, {0}", name)`         |
| StringBuilder solo para loops grandes (>100 iteraciones) | `new StringBuilder(256)`          |
| Raw string literals para multi-línea o JSON   | `"""{"key": "value"}"""`                     |

### `var`

- **Permitido** solo cuando el tipo es obvio en la misma línea:

```csharp
var user = new User();              // ✓ obvio
var users = new List<User>();       // ✓ obvio
var result = _repository.GetAsync(); // ✗ NO obvio — usar el tipo explícito
User? existing = _repository.GetById(id); // ✓ explícito
```

- **Prohibido** con tipos primitivos:

```csharp
var id = 42;          // ✗ int? long? short?
int id = 42;          // ✓
var name = GetName(); // ✗ ¿string? ¿Name? ¿Result<Name>?
string name = GetName(); // ✓
```

### Expresiones `=>`

Permitidas para miembros de una sola expresión:

```csharp
public string FullName => $"{FirstName} {LastName}";   // ✓
public override string ToString() => $"User {Id}";     // ✓
public bool IsAdult => Age >= 18;                       // ✓
```

Prohibido para miembros con más de una expresión (usar bloque).

### Patrones de comparación

Preferir pattern matching sobre operadores tradicionales:

```csharp
// ✓ pattern matching
if (result is { IsSuccess: true, Value: not null }) { }

// ✗ tradicional
if (result.IsSuccess && result.Value != null) { }

// ✓ switch expression
var statusText = order.Status switch
{
    OrderStatus.Pending => "Pendiente",
    OrderStatus.Confirmed => "Confirmado",
    _ => "Desconocido"
};
```

---

## 3. Nombres

### Tabla completa

| Elemento                     | Convención                       | Ejemplo                                   |
| ---------------------------- | -------------------------------- | ----------------------------------------- |
| Namespace                    | `Project.Capa.Directorio`        | `SalesSystem.Domain.Entities`             |
| Clase, record, struct        | PascalCase                       | `User`, `Money`, `OrderLine`              |
| Interfaz                     | `I` + PascalCase                 | `IUserRepository`                         |
| Método                       | PascalCase + verbo               | `CreateUserAsync`, `CalculateTotal`       |
| Propiedad                    | PascalCase + sustantivo          | `FirstName`, `TotalAmount`                |
| Campo privado                | `_camelCase`                     | `_userRepository`, `_context`             |
| Campo privado readonly       | `_camelCase`                     | `_logger`, `_configuration`               |
| Constante                    | PascalCase                       | `MaxRetryCount`, `DefaultPageSize`        |
| Variable local               | camelCase                        | `userId`, `currentUser`                   |
| Parámetro                    | camelCase                        | `userId`, `cancellationToken`             |
| Tipo genérico (1 param)      | `T`                              | `T`, `TEntity`                            |
| Tipo genérico (multi param)  | `T` + significado                | `TRequest`, `TResponse`, `TId`            |
| Enum                         | PascalCase singular              | `OrderStatus`, `ErrorCode`                |
| Valor de Enum                | PascalCase                       | `OrderStatus.Confirmed`                   |
| static field readonly        | PascalCase                       | `Empty`, `Default`                        |
| Método de extensión          | PascalCase + class target        | `ToDto(this User user)`                   |
| Atributo                     | PascalCase + sufijo `Attribute`  | `[Authorize]`, `[ValidatorAttribute]`      |
| Test class                   | `<Clase>Tests`                   | `UserServiceTests`                        |
| Test method                  | `<Método>_<Escenario>_<Resultado>` | `Create_WithInvalidEmail_ReturnsError`  |
| Test double (mock/stub/fake) | `<Nombre>` + Stub/Mock/Fake      | `UserRepositoryMock`, `EmailServiceFake`  |

### Reglas adicionales

- **No** abreviaturas (salvo `Id`, `Db`, `Dto`, `Http`, `Config`).
- **No** guiones bajos en nombres públicos (`user_name` → `UserName`).
- **No** prefijos de tipo húngaro (`strName`, `intCount`).
- Métodos booleanos: prefijo `Is`, `Has`, `Can`, `Should`.
- Métodos async: sufijo `Async` obligatorio.
- Eventos: sufijo `Event`, handlers con sufijo `Handler`.
- Classes de herencia: prefijo `Base` para clases base abstractas.

---

## 4. Estructura de archivos

### Orden interno de cada archivo `.cs`

```csharp
// 1. File-scoped namespace (obligatorio, una sola línea)
namespace MyProject.Domain.Entities;

// 2. Using externos (los que no cubren ImplicitUsings)
//    Orden: System.* → NuGet → Proyecto propio, alfabético cada grupo
using System.Text.RegularExpressions;
using MyProject.Domain.Errors;
using MyProject.Domain.ValueObjects;

// 3. Declaración del tipo
public sealed class User
{
    // 3a. Constantes
    private const int MaxNameLength = 200;

    // 3b. Campos privados (readonly primero, luego mutables)
    private readonly List<Order> _orders = [];
    private Email _email;

    // 3c. Constructores (primero el privado sin parámetros si existe)
    private User() { } // EF Core
    internal User(UserId id, Email email, Name name)
    {
        Id = id;
        _email = email;
        Name = name;
    }

    // 3d. Propiedades (auto-implemented → computed → con lógica)
    public UserId Id { get; }
    public Email Email => _email;
    public Name Name { get; private set; }
    public bool IsActive { get; private set; } = true;

    // 3e. Métodos públicos (comportamiento del dominio)
    public static Result<User> Create(Email email, Name name) { /* ... */ }
    public Result UpdateEmail(Email newEmail) { /* ... */ }

    // 3f. Eventos de dominio (si aplica)
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    // 3g. Métodos privados
    private void ValidateState() { /* ... */ }
}
```

### Reglas de archivos

| Regla                                    | Razón                                       |
| ---------------------------------------- | ------------------------------------------- |
| 1 archivo = 1 tipo público               | Cada clase/record/struct en su propio archivo |
| Nombre de archivo = nombre del tipo      | `User.cs` contiene `public class User`       |
| Máximo 400 líneas por archivo            | Si excede, refactorizar                     |
| Máximo 30 métodos públicos por clase     | Señal de SRP violado                        |
| Partial classes solo para generadores    | EF Core migrations, source generators        |

---

## 5. Tipos: class, record, struct

### Cuándo usar cada uno

| Tipo       | Cuándo usar                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| `class`    | Entidades, servicios, repositorios, handlers. Comportamiento + estado mutable. |
| `record`   | DTOs, Value Objects inmutables, comandos, queries, eventos. Datos + igualdad estructural. |
| `record struct` | Value Objects pequeños (menos de 40 bytes) que necesitan alta performance.    |
| `readonly struct` | Data transfer crítico en rendimiento (game dev, high-frequency trading). |
| `struct`   | Solo para interop con código no administrado o cuando el perfilado lo exige. Por defecto: `record` o `class`. |

### Reglas

```csharp
// ✓ record posicional para Value Objects inmutables
public sealed record Email
{
    public string Value { get; }
    private Email(string value) => Value = value;
    public static Result<Email> Create(string? value) { /* ... */ }
}

// ✓ record para DTOs / Commands / Queries
public sealed record CreateUserCommand(Email Email, Name Name) : IRequest<Result<UserId>>;

// ✓ record para eventos de dominio
public sealed record UserCreatedEvent(UserId UserId, DateTime OccurredAt) : IDomainEvent;

// ✓ class sellada por defecto
public sealed class UserRepository : IUserRepository { /* ... */ }
```

- Preferir `sealed` por defecto. Solo abrir para herencia cuando el diseño lo exija.
- Preferir `record` sobre `class` para Value Objects.
- No usar herencia de clases de negocio — usar composición e interfaces.

---

## 6. Nullables y nulabilidad

### Reglas

- Nullable habilitado globalmente (`<Nullable>enable</Nullable>` en `Directory.Build.props`).
- **No** suprimir warnings con `!` (null-forgiving operator) salvo en tests o
  interop donde el contrato externo garantiza no-null.
- Parámetros opcionales: usar `T?`, no `[Optional]` ni default values mágicos.

```csharp
// ✓ nullable explícito en parámetros opcionales
public Task<User?> GetByIdAsync(UserId id, CancellationToken ct = default);

// ✓ nullable en value objects
public static Result<Email> Create(string? value)
{
    if (string.IsNullOrWhiteSpace(value))
        return Result.Failure<Email>(EmailErrors.Empty);
    return Result.Success(new Email(value));
}

// ✗ null-forgiving operator — prohibido en producción
var user = _repository.GetByIdAsync(id).Result!; // ✗
```

### Anotaciones de nulabilidad

| Anotación | Significado                                               |
| --------- | --------------------------------------------------------- |
| `string`  | Nunca será null.                                          |
| `string?` | Puede ser null. El receptor debe checkear.                |
| `T?`      | Nullable para tipos referencia (clases) o tipos valor.    |
| `[NotNull]` | El método garantiza que el parámetro de salida no es null. |
| `[MaybeNull]` | El valor de retorno puede ser null aunque el tipo no lo indique. |

---

## 7. Inmutabilidad

### Principios

- Preferir inmutabilidad por defecto. Solo mutar estado cuando el diseño lo requiera.
- `record` posicional proporciona inmutabilidad por defecto.
- `init` setters en propiedades para DTOs y configuraciones.

```csharp
// ✓ init-only properties
public sealed class CreateUserRequest
{
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
}

// ✓ readonly collections
private readonly List<OrderLine> _lines = [];
public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();
```

### Reglas

- Colecciones expuestas públicamente: siempre `IReadOnlyList<T>` o `IEnumerable<T>`.
- Campos: `private readonly` por defecto. Solo mutable si el diseño lo exige.
- Métodos de dominio que mutan: retornar `Result` en lugar de lanzar excepción.

---

## 8. Async / Await

### Reglas obligatorias

| Regla                                                      | Explicación                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| Todos los métodos I/O-bound → `async Task<T>`              | DB, HTTP, file system, network.                               |
| `CancellationToken` como **último parámetro**              | `Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)` |
| Sufijo `Async` obligatorio                                 | `CreateUserAsync`, `GetByIdAsync`                             |
| Nunca `.Result`, `.Wait()`, `.GetAwaiter().GetResult()`    | Causa deadlocks. Siempre `await`.                             |
| Nunca `Task.WaitAll` / `Task.WaitAny`                      | Usar `await Task.WhenAll` / `await Task.WhenAny`              |
| `ConfigureAwait(false)` en librerías                       | Solo en Infrastructure, no en Application/Domain.             |
| `async void` solo para event handlers                      | En UI (WinForms, WPF). En ASP.NET Core: prohibido.            |
| `ValueTask<T>` para hot paths con alta probabilidad síncrona | Pool de conexiones, caché en memoria.                      |

### Async en toda la pila

```csharp
// Domain — interfaces async
public interface IUserRepository
{
    Task<User?> GetByIdAsync(UserId id, CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
}

// Application — handler async
public sealed class CreateUserHandler : IRequestHandler<CreateUserCommand, Result<UserId>>
{
    public async Task<Result<UserId>> Handle(CreateUserCommand command, CancellationToken ct)
    {
        var user = User.Create(command.Email, command.Name);
        if (user.IsFailure)
            return Result.Failure<UserId>(user.Error);
        await _repository.AddAsync(user.Value, ct);
        return Result.Success(user.Value.Id);
    }
}
```

### Async en tests

```csharp
[Fact]
public async Task Handle_WithValidCommand_ReturnsUserId()
{
    // Arrange
    var command = new CreateUserCommand(validEmail, validName);

    // Act
    var result = await _handler.Handle(command, CancellationToken.None);

    // Assert
    result.IsSuccess.Should().BeTrue();
}
```

---

## 9. LINQ

### Reglas

- Preferir sintaxis de métodos (`query.Select(...)`) sobre sintaxis de queries (`from x in y`).
- No abusar de LINQ en Domain (el rendimiento debe ser predecible).
- En Infrastructure: permitido LINQ to Entities (traducido a SQL por EF Core).
- Evitar `Count() > 0` → usar `.Any()`.
- Evitar `.ToList()` temprano — diferir la ejecución hasta donde se necesite.

```csharp
// ✓ comprensible
var activeOrders = orders.Where(o => o.Status == OrderStatus.Active);

// ✗ innecesariamente complejo
var result = orders.Where(o => o.Status == OrderStatus.Active)
    .Select(o => new { o.Id, Total = o.Lines.Sum(l => l.Price.Value * l.Quantity.Value) })
    .OrderByDescending(x => x.Total)
    .Take(10)
    .ToList();
```

### LINQ en Domain (restringido)

En Domain solo LINQ to Objects sobre colecciones en memoria. No LINQ a DB.

```csharp
// ✓ permitido en Domain
_lines.Any(l => l.ProductId == productId);
_lines.Where(l => l.IsPromotional).Sum(l => l.Total.Value);
```

---

## 10. Manejo de errores

### Patrón Result (obligatorio para flujo de control)

El dominio **nunca** lanza excepciones para flujo de control. Usar `Result<T>`.

```csharp
// Definición de errores tipados
public static class UserErrors
{
    public static readonly Error NotFound = new("User.NotFound", "El usuario no existe.");
    public static readonly Error InvalidEmail = new("User.InvalidEmail", "El formato del email es inválido.");
    public static readonly Error DuplicateEmail = new("User.DuplicateEmail", "El email ya está registrado.");
}

// Factory que retorna Result<T>
public static Result<User> Create(Email email, Name name)
{
    if (email is null)
        return Result.Failure<User>(UserErrors.InvalidEmail);
    var user = new User(UserId.New(), email, name);
    return Result.Success(user);
}

// Handler que propaga el Result
public async Task<Result<UserId>> Handle(CreateUserCommand command, CancellationToken ct)
{
    var emailResult = Email.Create(command.Email);
    if (emailResult.IsFailure)
        return Result.Failure<UserId>(emailResult.Error);

    var nameResult = Name.Create(command.Name);
    if (nameResult.IsFailure)
        return Result.Failure<UserId>(nameResult.Error);

    var user = User.Create(emailResult.Value, nameResult.Value);
    if (user.IsFailure)
        return Result.Failure<UserId>(user.Error);

    await _repository.AddAsync(user.Value, ct);
    return Result.Success(user.Value.Id);
}
```

### Patrón Try-Get (para queries que pueden no encontrar resultados)

```csharp
public sealed record UserDto(Guid Id, string Email, string Name);

public async Task<Result<UserDto>> Handle(GetUserQuery query, CancellationToken ct)
{
    var user = await _repository.GetByIdAsync(query.UserId, ct);
    if (user is null)
        return Result.Failure<UserDto>(UserErrors.NotFound);
    return Result.Success(UserDto.FromEntity(user));
}
```

### Mapeo de errores a HTTP

Siempre en Api, nunca en Application o Domain. Usar un mapper centralizado:

```csharp
public static class ResultExtensions
{
    public static IResult ToHttpResponse<T>(this Result<T> result)
    {
        if (result.IsSuccess)
            return Results.Ok(result.Value);

        return result.Error.Code switch
        {
            var c when c.EndsWith(".NotFound") => Results.NotFound(result.Error.ToProblemDetails(404)),
            var c when c.EndsWith(".Duplicate") => Results.Conflict(result.Error.ToProblemDetails(409)),
            _ => Results.BadRequest(result.Error.ToProblemDetails(400))
        };
    }
}
```

---

## 11. Excepciones

### Cuándo usar excepciones (solo errores irrecuperables)

- Violaciones de invariantes de programa que deberían ser imposibles (`InvalidOperationException`).
- Argumentos `null` inesperados (`ArgumentNullException`).
- Fallos de infraestructura irrecuperables sin retry posible.
- Errores de configuración en startup.

```csharp
// ✓ excepción legítima — invariante violada
public void ApplyDiscount(decimal percentage)
{
    if (percentage is < 0 or > 1)
        throw new ArgumentOutOfRangeException(nameof(percentage), "El descuento debe estar entre 0 y 1.");
}
```

### Anti-patrones de excepciones

| Anti-patrón                               | Alternativa                          |
| ----------------------------------------- | ------------------------------------ |
| `catch (Exception)` genérico              | Capturar tipos específicos.          |
| Usar excepciones para flujo de control    | Patrón `Result<T>`.                  |
| Relanzar con `throw ex` (pierde stack)    | Solo `throw`.                        |
| Capturar y no hacer nada (swallow)        | Logging o rethrow.                   |
| Excepciones de negocio en Domain          | Errores tipados en `Result`.         |

---

## 12. Inyección de dependencias

### Reglas

- Solo inyección por constructor. **Prohibido** Service Locator (`IServiceProvider.GetRequiredService`).
- **Prohibido** inyectar `IServiceProvider` directamente.
- Cada capa expone un método de extensión `Add{NombreCapa}()`.

```csharp
// ✓ Infrastructure/DependencyInjection.cs
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
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());

        return services;
    }
}

// ✓ Application/DependencyInjection.cs
public static class ApplicationDependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        return services;
    }
}
```

### Ciclo de vida

| Lifecycle  | Cuándo usar                                              |
| ---------- | -------------------------------------------------------- |
| **Singleton** | Servicios sin estado: logging, configuración, caché.  |
| **Scoped**    | DbContext, repositorios, unit of work (por request).   |
| **Transient** | Handlers de MediatR, validadores, servicios ligeros.   |

---

## 13. Serialización

### JSON (System.Text.Json)

```csharp
// Propiedades en camelCase (estándar API REST)
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
```

### Reglas

- Usar `System.Text.Json` (no Newtonsoft.Json) en proyectos nuevos.
- DTOs de request/response con `{ get; init; }` (inmutables).
- Value Objects con `[JsonConverter]` personalizado si es necesario.
- Enums serializar como string (`JsonStringEnumConverter`).

---

## 14. Tests

### Framework y herramientas

| Herramienta           | Propósito                        |
| --------------------- | -------------------------------- |
| `xUnit`               | Test framework (v2+)             |
| `FluentAssertions`    | Assertions legibles              |
| `NSubstitute`         | Mocking                          |
| `Testcontainers`      | Contenedores Docker para integración |
| `WebApplicationFactory` | Integration tests de API       |

### Estructura de tests

```
tests/
├── {Project}.Domain.Tests/
│   ├── Entities/
│   │   └── UserTests.cs
│   └── ValueObjects/
│       └── EmailTests.cs
├── {Project}.Application.Tests/
│   └── Commands/
│       └── CreateUserHandlerTests.cs
├── {Project}.Infrastructure.Tests/
│   └── Repositories/
│       └── UserRepositoryTests.cs
└── {Project}.Api.Tests/
    └── Endpoints/
        └── UsersEndpointTests.cs
```

### Reglas de tests

| Regla                                                     |
| --------------------------------------------------------- |
| Un archivo de test por clase de producción.               |
| Nombre: `<Método>_<Escenario>_<Resultado>`                |
| AAA explícito (Arrange / Act / Assert).                   |
| `[Fact]` para tests simples, `[Theory]` + `[InlineData]` para parametrizados. |
| Una aserción conceptual por test.                         |
| Sin estado compartido mutable entre tests.                |
| Sin dependencia de orden de ejecución.                    |
| Sin acceso a recursos externos (APIs reales, DBs de producción). |

### Ejemplo completo

```csharp
public sealed class CreateUserHandlerTests
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
        var name = Name.Create("Test User").Value;
        var command = new CreateUserCommand(email, name);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        _repository.Received(1).AddAsync(Arg.Is<User>(u => u.Email == email), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenRepositoryThrows_ReturnsFailure()
    {
        // Arrange
        _repository
            .When(x => x.AddAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()))
            .Do(x => throw new Exception("DB error"));

        var command = new CreateUserCommand(validEmail, validName);

        // Act & Assert
        await FluentActions
            .Awaiting(() => _handler.Handle(command, CancellationToken.None))
            .Should()
            .ThrowAsync<Exception>();
    }
}
```

---

## 15. Comentarios y documentación XML

### Reglas generales

- **No** escribir comentarios que el código ya expresa.
- Solo cuando explican un _por qué_ no obvio.
- Los nombres de métodos, clases y variables deben auto-documentarse.

```csharp
// ✗ comentario redundante
// Sets the user's email
public void SetEmail(string email) { /* ... */ }

// ✓ comentario útil: explica por qué, no qué
// Se usa ToLowerInvariant para evitar colisiones por
// mayúsculas en el sistema legacy de cuentas
public void SetEmail(string email) => _email = email.ToLowerInvariant();
```

### Documentación XML

- **Obligatoria** en: APIs públicas, interfaces, métodos de repositorio, endpoints.
- **Opcional** en: métodos privados, handlers internos.
- Solo `<summary>`, `<param>`, `<returns>` — no usar `<remarks>` salvo excepción.

```csharp
/// <summary>
/// Crea un nuevo usuario con el email y nombre especificados.
/// </summary>
/// <param name="email">Email válido del usuario (pasa validación de formato).</param>
/// <param name="name">Nombre completo del usuario (máx. 200 caracteres).</param>
/// <returns>Result con el User creado o un error de dominio.</returns>
public static Result<User> Create(Email email, Name name) { /* ... */ }
```

---

## 16. Configuración de proyectos

### Directory.Build.props

```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <LangVersion>latest</LangVersion>
    <Deterministic>true</Deterministic>
    <ContinuousIntegrationBuild>true</ContinuousIntegrationBuild>
    <AnalysisLevel>latest-Recommended</AnalysisLevel>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
  </PropertyGroup>

  <ItemGroup>
    <Using Include="System" />
    <Using Include="System.Collections.Generic" />
    <Using Include="System.Linq" />
    <Using Include="System.Threading" />
    <Using Include="System.Threading.Tasks" />
  </ItemGroup>
</Project>
```

### .editorconfig

```ini
root = true

[*]
indent_style = space
indent_size = 4
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
end_of_line = lf
max_line_length = 120

[*.cs]
indent_size = 4
dotnet_style_qualification_for_event = false:warning
dotnet_style_qualification_for_field = false:warning
dotnet_style_qualification_for_method = false:warning
dotnet_style_qualification_for_property = false:warning
dotnet_style_predefined_type_for_locals_parameters_members = true:warning
dotnet_style_predefined_type_for_member_access = true:warning
dotnet_style_require_accessible_member_override = false:silent
dotnet_style_object_initializer = true:suggestion
dotnet_style_collection_initializer = true:suggestion
dotnet_style_coalesce_expression = true:suggestion
dotnet_style_null_propagation = true:suggestion
dotnet_style_explicit_tuple_names = true:suggestion
dotnet_style_prefer_auto_properties = true:warning
dotnet_style_prefer_compound_assignment = true:suggestion
dotnet_style_prefer_conditional_expression_delegate_call = true:suggestion
dotnet_style_prefer_conditional_expression_over_assignment = true:suggestion
dotnet_style_prefer_inferred_anonymous_type_member_names = true:suggestion
dotnet_style_prefer_inferred_tuple_names = true:suggestion
dotnet_style_prefer_is_null_check_over_reference_equality_method = true:suggestion
dotnet_style_prefer_simplified_interpolation = true:suggestion
dotnet_style_readonly_field = true:warning
dotnet_style_namespace_match_folder = true:warning
csharp_style_expression_bodied_methods = true:silent
csharp_style_expression_bodied_properties = true:suggestion
csharp_style_expression_bodied_indexers = true:suggestion
csharp_style_expression_bodied_accessors = true:suggestion
csharp_style_expression_bodied_lambdas = true:suggestion
csharp_style_expression_bodied_local_functions = true:suggestion
csharp_style_var_for_built_in_types = false:warning
csharp_style_var_when_type_is_apparent = true:warning
csharp_style_var_elsewhere = false:warning
csharp_style_pattern_matching_over_is_with_cast_check = true:suggestion
csharp_style_pattern_matching_over_as_with_null_check = true:suggestion
csharp_style_inlined_variable_declaration = true:suggestion
csharp_style_throw_expression = true:suggestion
csharp_style_prefer_null_check_over_type_check = true:suggestion
csharp_style_prefer_local_over_anonymous_function = true:suggestion
csharp_style_prefer_tuple_swap = true:suggestion
csharp_style_prefer_utf8_string_literals = true:suggestion
csharp_style_deconstruct_variable_declaration = true:suggestion
csharp_style_prefer_index_operator = true:suggestion
csharp_style_prefer_range_operator = true:suggestion
csharp_style_implicit_object_creation_when_type_is_apparent = true:suggestion
csharp_style_unused_value_assignment_preference = discard_variable:suggestion
csharp_style_unused_value_expression_statement_preference = discard_variable:silent
```

---

## 17. Roslyn analyzers

### Paquetes NuGet recomendados

```xml
<ItemGroup>
  <PackageReference Include="SonarAnalyzer.CSharp" Version="*" PrivateAssets="all" />
  <PackageReference Include="Microsoft.CodeAnalysis.NetAnalyzers" Version="*" PrivateAssets="all" />
  <PackageReference Include="Roslynator.Analyzers" Version="*" PrivateAssets="all" />
</ItemGroup>
```

### Reglas de análisis

- `CA1031` — No capturar excepciones generales (configurado como error).
- `CA2007` — Llamar a ConfigureAwait (configurado como sugerencia en Api, error en librerías).
- `CA1848` — Usar el overload estructurado de logging (error).
- `CA1062` — Validar parámetros públicos (error).
- `CA1822` — Marcar métodos como static (sugerencia).

---

## 18. Git

### Convenciones

| Elemento        | Convención                                                      |
| --------------- | --------------------------------------------------------------- |
| Rama principal  | `main`                                                          |
| Ramas feature   | `feature/<nombre-en-inglés-con-guiones>`                        |
| Ramas fix       | `fix/<descripción-corta>`                                       |
| Commits         | Inglés, imperative mood, 50 chars título, 72 chars cuerpo      |
| Formato commit  | `tipo(alcance): descripción`                                    |

### Tipos de commit (Conventional Commits)

| Tipo       | Uso                                        |
| ---------- | ------------------------------------------ |
| `feat`     | Nueva feature                              |
| `fix`      | Corrección de bug                          |
| `refactor` | Cambio que no agrega feature ni corrige bug |
| `test`     | Añadir o modificar tests                   |
| `docs`     | Documentación                              |
| `chore`    | Mantenimiento, CI, dependencias            |
| `style`    | Formateo, whitespace, lint                 |
| `perf`     | Mejora de rendimiento                      |

```bash
feat(users): add email uniqueness validation
fix(auth): handle token expiration gracefully
refactor(orders): extract discount calculation to strategy
```

---

## 19. Anti-patrones (no hacer)

| Anti-patrón                          | Alternativa                              |
| ------------------------------------ | ---------------------------------------- |
| Métodos con más de 7 parámetros      | Crear un record/class parameter object. |
| Clases con más de 400 líneas         | Refactorizar en varias clases.          |
| Métodos con más de 50 líneas         | Extraer métodos privados.               |
| `static` methods con estado mutable  | Inyección de dependencias.              |
| Herencia profunda (> 3 niveles)      | Composición.                            |
| New() dentro de handlers             | Inyectar factory o repository.          |
| Métodos que hacen I/O + lógica       | Separar en Application + Infrastructure.|
| `[ApiController]` con lógica de negocio | Delegar a handlers de Application.   |
| Código muerto comentado              | Eliminar. Git history existe para eso.   |
