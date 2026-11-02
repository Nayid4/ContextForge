---
name: acceptance-testing
description: Use when creating or executing end-to-end acceptance tests with Playwright, white-box and black-box tests, system integration tests, or load/performance tests.
---

# Skill: Pruebas Integrales de Aceptación, Caja Blanca/Negra, Sistema y Carga

## Descripción
Esta skill guía la concepción, diseño, automatización y ejecución del espectro completo de pruebas de calidad de software requeridas en proyectos de nivel de producción:

1. **Pruebas de Aceptación End-to-End (E2E) con Playwright**: Validación de historias de usuario y criterios de aceptación desde la perspectiva del usuario final en múltiples navegadores y dispositivos.
2. **Pruebas de Caja Blanca**: Cobertura de caminos de ejecución internos, ramificaciones lógicas (`branch coverage`), análisis de complejidad ciclomática y robustez contra mutaciones.
3. **Pruebas de Caja Negra**: Pruebas funcionales y de límites (partición de equivalencia, análisis de valores límite - BVA, inyección de datos adversos y esquemas de payload).
4. **Pruebas de Sistema e Integración**: Verificación de interoperabilidad entre subsistemas, persistencia transaccional, eventos asíncronos y colas de mensajería (RabbitMQ, Kafka, Redis).
5. **Pruebas de Carga y Rendimiento (Load & Stress Testing)**: Simulación de concurrencia y estrés (k6, autocannon o artillery) evaluando latencias p95/p99, rendimiento (RPS) y tasas de error contra SLAs definidos.

---

## 1. Pruebas de Aceptación E2E con Playwright

### Objetivos
- Validar los criterios de aceptación (`acceptance`) definidos en `feature_list.json` y `spec.md`.
- Formular los escenarios bajo la sintaxis **Gherkin (Given-When-Then)**.
- Garantizar que los flujos críticos de negocio funcionen de punta a punta.

### Estructura de Pruebas Playwright
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature INT-XXX: [Nombre de la Feature]', () => {
  test.beforeEach(async ({ page }) => {
    // Configuración de estado inicial o autenticación previa
  });

  test('Escenario 1: Flujo exitoso de aceptación (Happy Path)', async ({ page }) => {
    // GIVEN: El usuario se encuentra en el punto de entrada
    await page.goto('/modulo');

    // WHEN: Ejecuta las acciones del criterio de aceptación
    await page.getByRole('button', { name: /confirmar/i }).click();

    // THEN: Se valida el estado visual y la confirmación
    await expect(page.getByTestId('success-alert')).toBeVisible();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Escenario 2: Manejo de error de validación o fallo esperado', async ({ page }) => {
    // Validación de retroalimentación ante datos inválidos
  });
});
```

### Configuración y Mejores Prácticas de Playwright
- **Localizadores Resilientes**: Usar `getByRole`, `getByLabel`, `getByTestId` en lugar de selectores CSS frágiles o rutas XPath.
- **Evidencias Automáticas**: Configurar en `playwright.config`:
  - `screenshot: 'only-on-failure'`
  - `video: 'retain-on-failure'`
  - `trace: 'on-first-retry'` (trazas completas para depuración interactiva con `playwright show-trace`).
- **Pruebas Multi-Dispositivo**: Ejecutar en Chromium, Firefox, WebKit y emuladores móviles (Mobile Safari / Pixel).
- **Aserciones Web-First**: Usar aserciones asíncronas con reintentos automáticos (`await expect(...).toBeVisible()`).

---

## 2. Pruebas de Caja Blanca (White-Box Testing)

### Objetivos
- Verificar la corrección estructural de los algoritmos y la lógica interna de los componentes.
- Garantizar cobertura de ramas (`Branch Coverage`) de al menos el 85% en módulos críticos.

### Procedimiento
1. **Identificar Grafos de Control de Flujo**:
   - Analizar las bifurcaciones (`if/else`, `switch`, operadores ternarios y manejo de excepciones `try/catch`).
2. **Cobertura de Condición / Decisión Múltiple**:
   - Para cada expresión booleana compuesta `(A && B || C)`, diseñar casos que prueben cada variable de forma independiente.
3. **Aislamiento de Dependencias de Infraestructura**:
   - Inyectar dobles de prueba (Mocks / Stubs) para bases de datos, APIs de terceros o brokers de mensajería.
   - Validar que las transacciones fallen limpiamente cuando las dependencias fallen (ej. timeout de red simulado).
4. **Análisis de Bucles**:
   - Caso cero iteraciones, exactamente una iteración, iteración promedio y caso límite máximo.

---

## 3. Pruebas de Caja Negra (Black-Box Testing)

### Objetivos
- Evaluar el comportamiento del sistema exclusivamente a través de sus entradas y salidas públicas sin conocer la implementación interna.

### Metodologías Requeridas
1. **Partición de Clases de Equivalencia (EP)**:
   - Dividir el dominio de entrada en clases válidas e inválidas. Probar al menos un representante de cada clase.
2. **Análisis de Valores Límite (BVA)**:
   - Probar valores en los extremos del dominio: `[Min - 1, Min, Min + 1, Max - 1, Max, Max + 1]`.
   - Ejemplo: Para una edad permitida entre 18 y 65 años: probar 17, 18, 19, 64, 65, 66.
3. **Tablas de Decisión**:
   - Mapear combinaciones complejas de condiciones de entrada con sus acciones resultantes esperadas.
4. **Pruebas de Transición de Estados**:
   - Validar que las entidades transicionen únicamente a través de los estados permitidos por el modelo (ej. `Draft -> Submitted -> Approved -> Dispatched`).

---

## 4. Pruebas de Sistema e Integración de Subsistemas

### Objetivos
- Verificar que los componentes de backend, bases de datos, cachés y colas colaboren armónicamente en un entorno similar a producción.

### Puntos de Verificación
1. **Consistencia Transaccional (ACID)**:
   - Validar que ante una falla en un paso intermedio de un checkout, la base de datos revierta (`rollback`) o emita transacciones compensatorias (Saga).
2. **Eventos Asíncronos y Dead Letter Queues (DLQ)**:
   - Publicar mensajes corruptos en el broker y comprobar que tras 3 reintentos con backoff exponencial, el mensaje sea redirigido a la DLQ correspondiente (`orders.dlq`).
3. **Idempotencia y Caché**:
   - Enviar dos peticiones simultáneas con la misma cabecera `Idempotency-Key` y verificar que solo se efectúe una transacción y ambas reciban la misma respuesta.

---

## 5. Pruebas de Carga y Rendimiento (Load & Performance)

### Herramienta Recomendada: `k6`
Para proyectos en Node/Python/Go/C#, crear scripts reproducibles de `k6` en `tests/load/`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up a 20 usuarios virtuales
    { duration: '1m', target: 20 },   // Carga constante
    { duration: '30s', target: 50 },  // Pico de estrés a 50 usuarios
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<250', 'p(99)<500'], // 95% de peticiones bajo 250ms
    http_req_failed: ['rate<0.01'],                 // Tasa de error menor al 1%
  },
};

export default function () {
  const res = http.get('http://localhost:8080/api/v1/catalogo');
  check(res, {
    'status es 200': (r) => r.status === 200,
    'tiempo < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

### Métricas a Reportar
- **VUs (Virtual Users)**: Concurrencia máxima sostenida.
- **RPS (Requests Per Second)**: Rendimiento total del servidor.
- **Latencias**: p50, p90, p95, p99.
- **Tasa de Error**: Porcentaje de respuestas 5xx o timeouts.

---

## 6. Salida y Reporte de Pruebas

Toda ejecución de esta skill debe producir un informe consolidado en:
`project-docs/testing/report-{fecha}.md` (o en la carpeta de la feature `specs/{task_id}/test-report.md`) con la siguiente estructura:

1. **Resumen Ejecutivo**: Aprobado / Rechazado.
2. **Resultados de Aceptación Playwright**: Total pruebas, tiempo, capturas de pantalla de fallos.
3. **Matriz de Cobertura de Caja Blanca**: Porcentaje de statement, branch y functions.
4. **Hallazgos de Caja Negra y Casos Límite**: Comportamiento ante valores extremos y payloads maliciosos.
5. **Métricas de Rendimiento y Carga**: p95, p99 y degradación bajo estrés.
6. **Sincronización**: Ejecutar `node project-docs/sync-data.js` para reflejar el estado de las pruebas en el tablero visual.
