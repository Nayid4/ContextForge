import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

describe('System Testing: Ciclo de Vida del Servidor HTTP y Contratos de Entrega', () => {
  let server;
  const TEST_PORT = 3334;
  const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

  before(async () => {
    // Importar dinámicamente o levantar el servidor de serve.js
    const rootDir = fs.existsSync('index.html') ? path.resolve('..') : process.cwd();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.svg': 'image/svg+xml'
    };

    server = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      let cleanUrl = req.url.split('?')[0];
      if (cleanUrl === '/' || cleanUrl === '') {
        cleanUrl = '/project-docs/index.html';
      }

      const filePath = path.join(rootDir, cleanUrl);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });

    await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('HTTP Contract: GET / responde 200 con HTML y contenedor raíz #app', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('text/html'));
    
    const body = await res.text();
    assert.ok(body.includes('<div id="app"></div>'));
  });

  test('HTTP Contract: GET /project-docs/data-fallback.js entrega el fallback con JS válido', async () => {
    const res = await fetch(`${BASE_URL}/project-docs/data-fallback.js`);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('application/javascript'));

    const body = await res.text();
    assert.ok(body.includes('window.__FALLBACK_DATA__'));
  });

  test('HTTP Contract: GET /inexistente.xyz responde 404 Not Found limpio', async () => {
    const res = await fetch(`${BASE_URL}/inexistente.xyz`);
    assert.equal(res.status, 404);
  });

  test('HTTP Contract: OPTIONS responde 204 con cabeceras CORS permisivas', async () => {
    const res = await fetch(`${BASE_URL}/`, { method: 'OPTIONS' });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), '*');
  });
});
