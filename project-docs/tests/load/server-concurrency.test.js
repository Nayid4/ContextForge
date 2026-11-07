import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

describe('Load & Performance Testing: Simulación de Concurrencia y Medición de Latencias', () => {
  let server;
  const LOAD_PORT = 3335;
  const BASE_URL = `http://127.0.0.1:${LOAD_PORT}`;
  const rootDir = fs.existsSync('index.html') ? path.resolve('..') : process.cwd();

  before(async () => {
    server = http.createServer((req, res) => {
      let cleanUrl = req.url.split('?')[0];
      if (cleanUrl === '/' || cleanUrl === '') cleanUrl = '/project-docs/index.html';
      const filePath = path.join(rootDir, cleanUrl);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      fs.createReadStream(filePath).pipe(res);
    });

    await new Promise((resolve) => server.listen(LOAD_PORT, '127.0.0.1', resolve));
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('Carga Concurrente: 100 peticiones en ráfagas con p95 < 200ms y 0% de errores', async () => {
    const TOTAL_REQUESTS = 100;
    const CONCURRENCY = 10;
    const latencies = [];
    let successCount = 0;
    let failCount = 0;

    const urls = [
      `${BASE_URL}/`,
      `${BASE_URL}/project-docs/data-fallback.js`,
      `${BASE_URL}/project-docs/feature_list.json`,
      `${BASE_URL}/project-docs/knowledge/knowledge-index.json`
    ];

    const startTime = performance.now();

    // Ejecutar en lotes concurrentes
    for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENCY) {
      const batch = Array.from({ length: CONCURRENCY }).map(async (_, idx) => {
        const targetUrl = urls[(i + idx) % urls.length];
        const reqStart = performance.now();
        try {
          const res = await fetch(targetUrl);
          const duration = performance.now() - reqStart;
          latencies.push(duration);
          if (res.status === 200) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }
      });
      await Promise.all(batch);
    }

    const totalDuration = performance.now() - startTime;
    const rps = (TOTAL_REQUESTS / (totalDuration / 1000)).toFixed(1);

    // Calcular percentiles
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.50)].toFixed(2);
    const p90 = latencies[Math.floor(latencies.length * 0.90)].toFixed(2);
    const p95 = latencies[Math.floor(latencies.length * 0.95)].toFixed(2);
    const p99 = latencies[Math.floor(latencies.length * 0.99)].toFixed(2);

    console.log(`\n  ================ LOAD TEST METRICS ================`);
    console.log(`  Peticiones Totales : ${TOTAL_REQUESTS}`);
    console.log(`  Éxito / Fallo      : ${successCount} / ${failCount}`);
    console.log(`  Rendimiento (RPS)  : ${rps} req/sec`);
    console.log(`  Latencia p50       : ${p50} ms`);
    console.log(`  Latencia p90       : ${p90} ms`);
    console.log(`  Latencia p95       : ${p95} ms`);
    console.log(`  Latencia p99       : ${p99} ms`);
    console.log(`  ===================================================\n`);

    // Aserciones de SLA
    assert.equal(failCount, 0, 'La tasa de error debe ser exactamente 0%');
    assert.equal(successCount, TOTAL_REQUESTS, 'Todas las peticiones deben ser 200 OK');
    assert.ok(Number(p95) < 200, `El percentil p95 (${p95}ms) debe estar bajo el umbral de 200ms`);
  });
});
