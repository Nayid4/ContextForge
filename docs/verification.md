# Verificación — Cómo demostrar que el trabajo funciona

> Regla de oro: **el agente no dice "funciona", lo demuestra**.
> Toda feature termina con evidencia ejecutable, no con afirmaciones.
> La verificación es un proceso automatizado, no una opinión.

---

## Tabla de contenidos

1. [Pirámide de verificación](#1-pirámide-de-verificación)
2. [Nivel 0 — Build y análisis estático](#2-nivel-0--build-y-análisis-estático)
3. [Nivel 1 — Tests unitarios](#3-nivel-1--tests-unitarios)
4. [Nivel 2 — Tests de integración](#4-nivel-2--tests-de-integración)
5. [Nivel 3 — Tests de API (contrato)](#5-nivel-3--tests-de-api-contrato)
6. [Nivel 4 — Tests end-to-end](#6-nivel-4--tests-end-to-end)
7. [Nivel 5 — Calidad y cobertura](#7-nivel-5--calidad-y-cobertura)
8. [Nivel 6 — Seguridad](#8-nivel-6--seguridad)
9. [Nivel 7 — Performance](#9-nivel-7--performance)
10. [Nivel 8 — Trazabilidad de requirements](#10-nivel-8--trazabilidad-de-requirements)
11. [Nivel 9 — Verificación arquitectónica](#11-nivel-9--verificación-arquitectónica)
12. [Nivel 10 — Validación de paquete NuGet](#12-nivel-10--validación-de-paquete-nuget)
13. [Pipeline CI/CD completo](#13-pipeline-cicd-completo)
14. [Checklist de cierre de feature](#14-checklist-de-cierre-de-feature)
15. [Anti-patrones](#15-anti-patrones)

---

## 1. Pirámide de verificación

```
                    ╱╲
                   ╱  ╲              Nivel 10: Validación NuGet
                  ╱    ╲
                 ╱──────╲
                ╱        ╲          Nivel 7-9: Performance, Seguridad, Arquitectura
               ╱          ╲
              ╱────────────╲
             ╱              ╲       Nivel 4-6: E2E, Calidad, Trazabilidad
            ╱                ╲
           ╱──────────────────╲
          ╱                    ╲    Nivel 2-3: Integración + API
         ╱                      ╲
        ╱────────────────────────╲
       ╱                          ╲ Nivel 1: Tests unitarios (más cantidad)
      ╱                            ╲
     ╱──────────────────────────────╲
    ╱                                ╲ Nivel 0: Build + Static Analysis (siempre, primero)
   ╱                                  ╲
```

Cada nivel **valida** al inferior. Si un nivel falla, los superiores no se ejecutan.

---

## 2. Nivel 0 — Build y análisis estático

> **Puerta de entrada.** Si esto falla, no se avanza. Es la verificación más
> barata y la que atrapa más errores temprano.

### Build con warnings como errores

```bash
dotnet build /warnaserror
```

- `TreatWarningsAsErrors=true` en `Directory.Build.props`.
- **No** se permite `#pragma warning disable` en producción.
- **No** se permite `SuppressMessageAttribute` sin justificación documentada.
- Cero warnings de compilación.

### Formateo y estilo

```bash
dotnet format --verify-no-changes
dotnet format --verify-no-changes --severity info
```

Verifica que el código cumple `.editorconfig`. Si `dotnet format` propone cambios,
el build falla.

### Análisis estático con Roslyn

```bash
dotnet build /p:RunAnalyzersDuringBuild=true /p:RunAnalyzers=true
```

Analizadores obligatorios (definidos en `Directory.Build.props`):

| Analyzer                       | Propósito                                        |
| ------------------------------ | ------------------------------------------------ |
| `Microsoft.CodeAnalysis.NetAnalyzers` | Análisis oficial Microsoft (CA rules)       |
| `SonarAnalyzer.CSharp`         | Calidad de código, vulnerabilidades, code smells |
| `Roslynator.Analyzers`         | Refactorings, mejores prácticas                  |

### Análisis de dependencias

```bash
dotnet list package --vulnerable --deprecated
```

- **Zero** dependencias con vulnerabilidades conocidas.
- **Zero** dependencias deprecated.

### Comando completo del Nivel 0

```bash
dotnet build /warnaserror && \
dotnet format --verify-no-changes && \
dotnet list package --vulnerable --deprecated
```

---

## 3. Nivel 1 — Tests unitarios

> **Obligatorio para toda clase pública.** Sin tests unitarios, el código no
> existe a efectos de verificación.

### Requisitos mínimos

| Regla                                                        | Verificación                                      |
| ------------------------------------------------------------ | ------------------------------------------------- |
| Toda clase pública en `src/` tiene al menos un test.         | `dotnet test --filter "FullyQualifiedName~<Clase>Tests"` |
| Cubre happy path.                                            | Cada test nombrado con `_ReturnsSuccess` / `_Returns<Resultado>` |
| Cubre al menos un camino de error si la operación puede fallar. | Test con `_ReturnsError` / `_ReturnsFailure` / `_Throws*` |
| Sin dependencias IO (no DB, no HTTP, no filesystem).         | Los tests corren sin configuración externa.       |

### Comandos

```bash
# Unit tests del dominio (cero dependencias)
dotnet test tests/<Project>.Domain.Tests/ --no-build -v minimal

# Unit tests de application (mocks de repositorios)
dotnet test tests/<Project>.Application.Tests/ --no-build -v minimal
```

### Ejemplo

```csharp
[Fact]
public void Create_WithValidEmail_ReturnsSuccess()
{
    // Arrange
    var email = "user@example.com";

    // Act
    var result = Email.Create(email);

    // Assert
    result.IsSuccess.Should().BeTrue();
    result.Value.Value.Should().Be(email.ToLowerInvariant());
}

[Fact]
public void Create_WithNullEmail_ReturnsFailure()
{
    // Arrange
    string? email = null;

    // Act
    var result = Email.Create(email);

    // Assert
    result.IsFailure.Should().BeTrue();
    result.Error.Code.Should().Be("Email.Empty");
}
```

### Cobertura mínima por capa

| Capa           | Cobertura mínima de líneas | Cobertura mínima de ramas |
| -------------- | -------------------------- | ------------------------- |
| Domain         | 95%                        | 90%                       |
| Application    | 90%                        | 85%                       |
| Infrastructure | 70%                        | 65%                       |
| Api            | 60%                        | 55%                       |

```bash
dotnet test --collect:"XPlat Code Coverage" \
  --settings coverlet.runsettings \
  --results-directory ./TestResults
```

Archivo `coverlet.runsettings`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<RunSettings>
  <DataCollectionRunSettings>
    <DataCollectors>
      <DataCollector friendlyName="XPlat code coverage">
        <Configuration>
          <Format>cobertura,json</Format>
          <Exclude>[*.Tests]*</Exclude>
          <ExcludeByAttribute>GeneratedCodeAttribute,CompilerGeneratedAttribute</ExcludeByAttribute>
          <Threshold>85</Threshold>
          <ThresholdType>line</ThresholdType>
        </Configuration>
      </DataCollector>
    </DataCollectors>
  </DataCollectionRunSettings>
</RunSettings>
```

---

## 4. Nivel 2 — Tests de integración

> Validan que las capas colaboran correctamente con infraestructura real
> (DB, file system, APIs externas mockeadas pero con protocolo real).

### Tecnologías

| Herramienta         | Propósito                                          |
| ------------------- | -------------------------------------------------- |
| `WebApplicationFactory<T>` | Test de integración de API con pipeline completo |
| `Testcontainers`    | Contenedores Docker para DB real (Postgres, SqlServer, etc.) |
| `Respawn`           | Reset de base de datos entre tests                 |
| `WireMock.Net`      | Mock de APIs HTTP externas                         |

### DB de integración

```csharp
public class UserRepositoryTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .Build();

    private AppDbContext _context = null!;
    private UserRepository _repository = null!;

    public async Task InitializeAsync()
    {
        await _container.StartAsync();
        _context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_container.GetConnectionString())
            .Options);
        await _context.Database.MigrateAsync();
        _repository = new UserRepository(_context);
    }

    public async Task DisposeAsync() => await _container.DisposeAsync();

    [Fact]
    public async Task GetById_WhenUserExists_ReturnsUser()
    {
        // Arrange
        var user = User.Create(Email.Create("test@test.com").Value, Name.Create("Test").Value).Value;
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(user.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be(user.Email);
    }
}
```

### Comandos

```bash
dotnet test tests/<Project>.Infrastructure.Tests/ --no-build -v minimal
```

---

## 5. Nivel 3 — Tests de API (contrato)

> Validan que los endpoints HTTP cumplen el contrato esperado (códigos, headers,
> body, errores). Se ejecutan contra `WebApplicationFactory<T>`.

### Ejemplo completo

```csharp
public class UsersEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public UsersEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ConnectionStrings:Default", "DataSource=file::memory:?cache=shared");
        }).CreateClient();
    }

    [Fact]
    public async Task PostUser_WithValidPayload_Returns201()
    {
        // Arrange
        var payload = new { email = "test@example.com", name = "Test User" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/users", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
    }

    [Fact]
    public async Task PostUser_WithInvalidEmail_Returns400()
    {
        // Arrange
        var payload = new { email = "not-an-email", name = "Test" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/users", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        problem!.Title.Should().Be("Bad Request");
    }

    [Fact]
    public async Task PostUser_WithoutAuth_Returns401()
    {
        // Arrange
        var payload = new { email = "test@example.com", name = "Test" };
        _client.DefaultRequestHeaders.Authorization = null;

        // Act
        var response = await _client.PostAsJsonAsync("/api/users", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
```

### Validación de esquema OpenAPI

```bash
# Validar que los endpoints reales cumplen el contrato OpenAPI
dotnet tool install -g Microsoft.OpenApi.Readers
dotnet swagger tofile --output [swagger.json] bin/Debug/net10.0/<Project>.Api.dll v1
# Comparar swagger.json contra el spec
```

### Comandos

```bash
dotnet test tests/<Project>.Api.Tests/ --no-build -v minimal
```

---

## 6. Nivel 4 — Tests end-to-end

> Validan el sistema completo (API + DB real + servicios externos reales o
> containerizados). Son pocos, lentos y costosos. Solo para flujos críticos.

### Cuándo usarlos

- Flujo de registro y login completo.
- Ciclo de vida de una orden (crear → pagar → enviar → cancelar).
- Migraciones de base de datos (que no rompen datos existentes).
- Escenarios que involucran múltiples bounded contexts.

### Ejemplo

```csharp
[Collection("E2E")]
public class OrderLifecycleE2ETests : IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly PostgreSqlContainer _db = new PostgreSqlBuilder().Build();

    public async Task InitializeAsync()
    {
        await _db.StartAsync();
        var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
                builder.UseSetting("ConnectionStrings:Default", _db.GetConnectionString()));

        await factory.Services.GetRequiredService<AppDbContext>().Database.MigrateAsync();
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CompleteOrderFlow_CreatesAndPaysOrder()
    {
        // Crear usuario
        var userResponse = await _client.PostAsJsonAsync("/api/users", new { email = "e2e@test.com", name = "E2E" });
        userResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var userId = await userResponse.Content.ReadFromJsonAsync<Guid>();

        // Crear orden
        var orderResponse = await _client.PostAsJsonAsync("/api/orders", new { customerId = userId });
        orderResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        // ... más pasos del flujo
    }

    public async Task DisposeAsync() => await _db.DisposeAsync();
}
```

### Comandos

```bash
dotnet test tests/E2E/ --no-build -v normal
```

---

## 7. Nivel 5 — Calidad y cobertura

### Reporte de cobertura unificado

```bash
dotnet test --collect:"XPlat Code Coverage" \
  --settings coverlet.runsettings \
  --results-directory ./TestResults

# Generar reporte HTML
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator \
  -reports:./TestResults/**/coverage.cobertura.xml \
  -targetdir:./TestResults/CoverageReport \
  -reporttypes:Html
```

### Umbrales de calidad

| Métrica              | Mínimo   | Objetivo  | Exigencia          |
| -------------------- | -------- | --------- | ------------------ |
| Cobertura de línea   | 80%      | 90%+      | Obligatorio        |
| Cobertura de rama    | 75%      | 85%+      | Obligatorio        |
| Complejidad ciclomática | < 10 por método | < 7 | Obligatorio (SonarAnalyzer) |
| Duplicación de código | < 3%     | < 1%      | Obligatorio        |
| Mantenibilidad       | A o B    | A         | Recomendado        |

### Mutation testing (Stryker)

```bash
dotnet tool install -g dotnet-stryker
dotnet stryker --project "src/<Project>.Domain.csproj"
```

- Objetivo: > 70% de mutation score.
- Detecta tests que pasan pero no prueban nada realmente.

### Comandos

```bash
dotnet test --collect:"XPlat Code Coverage" --settings coverlet.runsettings /p:CollectCoverage=true
```

---

## 8. Nivel 6 — Seguridad

### Escaneo de dependencias vulnerables

```bash
# .NET Built-in (SDK 8+)
dotnet list package --vulnerable

# Trivy (recomendado para CI)
trivy fs --scanners vuln .

# Dependabot / Renovate (automatizado en GitHub)
```

### Security code analysis

```bash
# Roslyn Security Analyzers
dotnet build /p:RunAnalyzersDuringBuild=true /p:RunAnalyzers=true

# Escaneo OWASP (ZAP)
docker run -v $(pwd):/zap/wrk/ -t ghcr.io/zaproxy/zaproxy:stable \
  zap-api-scan.py -t http://localhost:5000/swagger/v1/swagger.json -f openapi -r report.html
```

### Reglas de seguridad verificadas automáticamente

| Regla                                           | Herramienta                       |
| ----------------------------------------------- | --------------------------------- |
| No hay secretos hardcodeados                    | `trufflehog`, `git-secrets`       |
| No hay SQL injection (EF Core LINQ lo previene) | Análisis estático de Roslyn       |
| No hay XSS en respuestas                        | Headers de seguridad (`X-Content-Type-Options`, `CSP`) |
| Autenticación y autorización en todos los endpoints | Test de integración con `WebApplicationFactory` |
| Rate limiting activo en endpoints públicos       | Verificación de middleware         |

### Comandos

```bash
dotnet list package --vulnerable --deprecated
```

---

## 9. Nivel 7 — Performance

### Benchmarks (BenchmarkDotNet)

Para operaciones críticas o de alto throughput:

```csharp
[SimpleJob(RunStrategy.ColdStart, iterationCount: 5)]
public class OrderCreationBenchmark
{
    private AppDbContext _context = null!;
    private OrderRepository _repository = null!;

    [GlobalSetup]
    public void Setup()
    {
        // Configurar DB InMemory
    }

    [Benchmark]
    public async Task<Order> CreateOrder()
    {
        var order = Order.Create(CustomerId.New()).Value;
        await _repository.AddAsync(order, CancellationToken.None);
        return order;
    }
}
```

### Comandos

```bash
dotnet run -c Release --project benchmarks/
```

### Umbrales de performance

| Operación                 | Límite máximo (p95) | Notas                     |
| ------------------------- | ------------------- | ------------------------- |
| Query por ID              | 100ms               | Con índice en DB          |
| Lista paginada (100 items)| 500ms               | Sin N+1, con proyección   |
| Comando de escritura      | 500ms               | Incluye validación + persistencia |
| Endpoint HTTP completo    | 1s                  | Desde request a response  |

### Load testing (k6)

```javascript
// k6 script
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
};

export default function () {
  const res = http.post('http://localhost:5000/api/users', {
    email: `user${__VU}@test.com`,
    name: 'Load Test',
  });
  check(res, { 'status 201': (r) => r.status === 201 });
  sleep(1);
}
```

```bash
k6 run load-test.js
```

---

## 10. Nivel 8 — Trazabilidad de requirements

> Cada `R<n>` del spec debe tener al menos un test que lo verifique.
> El Reviewer rechaza si falta cobertura.

### Formato del mapa de trazabilidad

El implementer documenta en `progress/impl_<feature>.md`:

```markdown
## Trazabilidad R<n> ↔ Tests

| Requirement | Test(s)                                                    |
| ----------- | ---------------------------------------------------------- |
| R1          | `CreateUserHandlerTests.Handle_WithValidCommand_ReturnsUserId` |
|             | `UsersEndpointTests.PostUser_WithValidPayload_Returns201`  |
| R2          | `EmailTests.Create_WithInvalidEmail_ReturnsFailure`         |
|             | `UsersEndpointTests.PostUser_WithInvalidEmail_Returns400`  |
| R3          | `UsersEndpointTests.PostUser_WithoutAuth_Returns401`       |
```

### Verificación automática

```bash
# Script de validación (idea: extraer R<n> de specs y mapear a tests)
dotnet test --filter "FullyQualifiedName~R1|FullyQualifiedName~R2|..."
```

### Checklist del Reviewer

- [ ] Cada `R<n>` en `specs/*/requirements.md` tiene un test.
- [ ] Cada test mapeado existe y pasa.
- [ ] Los tests cubren tanto happy path como caminos de error.
- [ ] La implementación no excede el alcance del spec.

---

## 11. Nivel 9 — Verificación arquitectónica

### Reglas de dependencia entre capas (NetArchTest)

```csharp
public class ArchitectureTests
{
    private static readonly Assembly DomainAssembly = typeof(Entity).Assembly;
    private static readonly Assembly ApplicationAssembly = typeof(CreateUserHandler).Assembly;
    private static readonly Assembly InfrastructureAssembly = typeof(UserRepository).Assembly;
    private static readonly Assembly ApiAssembly = typeof(Program).Assembly;

    [Fact]
    public void Domain_ShouldNotDependOnAnyOtherLayer()
    {
        var result = Types.InAssembly(DomainAssembly)
            .ShouldNot()
            .HaveDependencyOnAny("Application", "Infrastructure", "Api")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Application_ShouldNotDependOnInfrastructureOrApi()
    {
        var result = Types.InAssembly(ApplicationAssembly)
            .ShouldNot()
            .HaveDependencyOnAny("Infrastructure", "Api")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Infrastructure_ShouldNotDependOnApi()
    {
        var result = Types.InAssembly(InfrastructureAssembly)
            .ShouldNot()
            .HaveDependencyOnAny("Api")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Handlers_ShouldBeSealed()
    {
        var result = Types.InAssembly(ApplicationAssembly)
            .That()
            .ImplementInterface(typeof(IRequestHandler<,>))
            .Should()
            .BeSealed()
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Repositories_ShouldOnlyBeAccessedThroughInterfaces()
    {
        var result = Types.InAssembly(InfrastructureAssembly)
            .That()
            .HaveNameEndingWith("Repository")
            .Should()
            .BeInternal()
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }
}
```

### Reglas de arquitectura verificadas

| Regla                                                        | Herramienta       |
| ------------------------------------------------------------ | ----------------- |
| Domain no referencia Application, Infrastructure ni Api      | NetArchTest       |
| Application no referencia Infrastructure ni Api              | NetArchTest       |
| Infrastructure no referencia Api                             | NetArchTest       |
| Handlers de MediatR son `sealed`                             | NetArchTest       |
| Repositorios son `internal` (solo accesibles por interfaz)   | NetArchTest       |
| Value Objects son `record`                                   | NetArchTest       |
| Entidades tienen constructor privado + factory estática       | NetArchTest       |
| No hay `async void` en el código de producción               | Roslyn analyzer   |
| No hay `.Result` o `.Wait()` en el código de producción      | Roslyn analyzer   |

### Comandos

```bash
dotnet test tests/<Project>.Architecture.Tests/ --no-build -v minimal
```

---

## 12. Nivel 10 — Validación de paquete NuGet

> Cuando el proyecto genera un paquete NuGet, la verificación incluye
> validación del artifact empaquetado.

### Pack y validación

```bash
# Generar el paquete
dotnet pack src/<Project>.Api/ -c Release -o ./artifacts

# Validar que el .nupkg se generó
ls ./artifacts/*.nupkg

# Verificar metadatos
dotnet nuget verify ./artifacts/*.nupkg

# Validar contenidos (con dotnet-validate)
dotnet tool install -g dotnet-validate
dotnet validate package ./artifacts/*.nupkg
```

### Validaciones del paquete

| Verificación                        | Comando                                       |
| ----------------------------------- | --------------------------------------------- |
| El paquete se genera sin errores    | `dotnet pack --no-build`                      |
| Versionado semántico correcto       | `dotnet nuget verify`                         |
| No contiene dependencias privadas   | `dotnet list package --include-transitive`    |
| Contiene XML doc                    | `dotnet pack /p:DocumentationFile=...`        |
| Contiene símbolos (snupkg)          | `dotnet pack --include-symbols`                |

### Comandos

```bash
dotnet pack --no-build -c Release -o ./artifacts
```

---

## 13. Pipeline CI/CD completo

### Script de verificación (`./verify.sh`)

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "=== Nivel 0: Build + Static Analysis ==="
dotnet build /warnaserror
dotnet format --verify-no-changes
dotnet list package --vulnerable --deprecated

echo "=== Nivel 1: Unit Tests ==="
dotnet test tests/*.Domain.Tests/ --no-build -v minimal
dotnet test tests/*.Application.Tests/ --no-build -v minimal

echo "=== Nivel 2: Integration Tests ==="
dotnet test tests/*.Infrastructure.Tests/ --no-build -v minimal

echo "=== Nivel 3: API Tests ==="
dotnet test tests/*.Api.Tests/ --no-build -v minimal

echo "=== Nivel 5: Coverage ==="
dotnet test --collect:"XPlat Code Coverage" --settings coverlet.runsettings --results-directory ./TestResults

echo "=== Nivel 9: Architecture Tests ==="
dotnet test tests/*.Architecture.Tests/ --no-build -v minimal

echo "=== Nivel 10: Pack Validation ==="
dotnet pack --no-build -c Release -o ./artifacts
dotnet nuget verify ./artifacts/*.nupkg 2>/dev/null || true

echo ""
echo "========================================"
echo "  Todos los niveles de verificación OK"
echo "========================================"
```

### Comandos

```bash
./verify.sh
```

---

## 14. Checklist de cierre de feature

### Antes de declarar `done`

- [ ] **Nivel 0:** Build sin warnings, formato correcto, sin dependencias vulnerables.
- [ ] **Nivel 1:** Todos los tests unitarios pasan y cumplen umbral de cobertura.
- [ ] **Nivel 2:** Tests de integración pasan (si aplica).
- [ ] **Nivel 3:** Tests de API pasan (si aplica).
- [ ] **Nivel 4:** Tests E2E pasan (si aplica).
- [ ] **Nivel 5:** Cobertura de línea ≥ 80%, cobertura de rama ≥ 75%.
- [ ] **Nivel 6:** Sin vulnerabilidades conocidas en dependencias.
- [ ] **Nivel 7:** Benchmarks dentro de umbrales (si aplica).
- [ ] **Nivel 8:** Trazabilidad R<n> ↔ Tests documentada y completa.
- [ ] **Nivel 9:** Tests arquitectónicos pasan.
- [ ] **Nivel 10:** Paquete NuGet se genera correctamente (si aplica).
- [ ] **Review:** El reviewer aprobó la feature.
- [ ] **Documentación:** `progress/current.md` actualizado.
- [ ] **Commit:** Commit semántico generado.
- [ ] **Status:** `feature_list.json` marcado como `done`.

### Si algo falla

```markdown
## Bloqueo registrado en progress/current.md

Estado: blocked
Razón: <descripción del bloqueo>
Nivel que falla: <Nivel X>
Evidencia: <log, screenshot, stack trace>
Próximo paso: <qué se necesita para desbloquear>
```

---

## 15. Anti-patrones

### ❌ En tests

| Anti-patrón                                                 | Alternativa                                            |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| "He añadido el endpoint, debería funcionar."                | Test ejecutable que lo demuestre.                     |
| Test que solo verifica que no lanza excepción              | Verificar el resultado concreto.                       |
| Mockear `DbContext` directamente                            | Usar repositorios abstractos o DB InMemory.            |
| Marcar feature `done` sin pasar `./verify.sh`              | Ejecutar verify.sh y tener todo verde.                 |
| Tests que dependen del orden de ejecución                   | Cada test es independiente. Usar `[Collection]` si es necesario. |
| Tests que acceden a recursos externos                       | Usar Testcontainers o WireMock.                        |
| Test con múltiples aserciones no relacionadas               | Separar en varios tests.                               |
| Usar `Thread.Sleep` en tests                                | Usar `Task.Delay` con `CancellationToken` o esperar señales. |
| Compartir estado mutable estático entre tests               | Crear instancias frescas en el constructor.            |

### ❌ En verificación

| Anti-patrón                                                 | Alternativa                                            |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| Confiar ciegamente en el reporte de cobertura               | Revisar qué líneas están cubiertas y cuáles no.        |
| Solo probar happy path                                      | Probar errores, edge cases, límites.                   |
| Ignorar tests flaky                                         | Investigar y eliminar la flakiness.                    |
| No verificar dependencias vulnerables                       | `dotnet list package --vulnerable` en cada build.      |
| Asumir que el build en local = build en CI                  | CI usa `dotnet build /warnaserror` limpio.             |

### ❌ En trazabilidad

| Anti-patrón                                                 | Alternativa                                            |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| No documentar el mapa R<n> ↔ Tests                          | El Reviewer lo exige en el PR.                         |
| Requirement sin test                                        | El Reviewer rechaza el spec.                           |
| Tests que cubren más de lo que pide el spec (scope creep)   | El Reviewer lo detecta en code review.                 |
| Tests que duplican la lógica de producción                  | Usar datos de prueba, no replicar algoritmos.          |

---

## Anexo: Stack tecnológico de verificación

| Herramienta                      | Propósito                         | Nivel |
| -------------------------------- | --------------------------------- | ----- |
| `dotnet build /warnaserror`      | Compilación + warnings            | 0     |
| `dotnet format --verify-no-changes` | Estilo de código                | 0     |
| `xUnit`                          | Test framework                    | 1-4   |
| `FluentAssertions`               | Assertions legibles               | 1-4   |
| `NSubstitute`                    | Mocking                           | 1     |
| `Testcontainers`                 | DB real en contenedores           | 2     |
| `WebApplicationFactory`          | Integration tests de API          | 3     |
| `Coverlet`                       | Code coverage                     | 5     |
| `ReportGenerator`                | Reporte HTML de cobertura         | 5     |
| `Stryker`                        | Mutation testing                  | 5     |
| `SonarAnalyzer.CSharp`           | Análisis estático                 | 0     |
| `NetArchTest`                    | Verificación arquitectónica       | 9     |
| `BenchmarkDotNet`                | Benchmarks de performance         | 7     |
| `k6`                             | Load testing                      | 7     |
| `Trivy` / `dotnet list package --vulnerable` | Seguridad de dependencias | 6 |
