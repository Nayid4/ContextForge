import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { initDatabase } from './src/core/db.js';
import {
  syncFilesToSQLite,
  getPlaneData,
  syncIssueToFiles,
  syncPageToFile
} from './src/core/sqlite-sync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3333;
const HOST = process.env.HOST || '127.0.0.1';
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.yaml': 'text/yaml; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

// Inicializar SQLite relacional y sincronizar datos
let db = null;
try {
  db = initDatabase();
  syncFilesToSQLite(db);
} catch (e) {
  console.warn('[SERVE] Error inicializando SQLite:', e.message);
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (_) {
        resolve({});
      }
    });
  });
}

async function handlePlaneApi(req, res, database) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!database) {
    res.writeHead(503);
    res.end(JSON.stringify({ error: 'Base de datos SQLite no disponible' }));
    return;
  }

  try {
    // 1. GET /api/plane/data - Payload consolidado
    if (pathname === '/api/plane/data' && method === 'GET') {
      const data = getPlaneData(database);
      res.writeHead(200);
      res.end(JSON.stringify(data));
      return;
    }

    // 2. GET /api/plane/issues
    if (pathname === '/api/plane/issues' && method === 'GET') {
      const data = getPlaneData(database);
      res.writeHead(200);
      res.end(JSON.stringify(data.issues));
      return;
    }

    // 3. GET /api/plane/cycles
    if (pathname === '/api/plane/cycles' && method === 'GET') {
      const data = getPlaneData(database);
      res.writeHead(200);
      res.end(JSON.stringify(data.cycles));
      return;
    }

    // 4. GET /api/plane/modules
    if (pathname === '/api/plane/modules' && method === 'GET') {
      const data = getPlaneData(database);
      res.writeHead(200);
      res.end(JSON.stringify(data.modules));
      return;
    }

    // 5. GET /api/plane/pages
    if (pathname === '/api/plane/pages' && method === 'GET') {
      const data = getPlaneData(database);
      res.writeHead(200);
      res.end(JSON.stringify(data.pages));
      return;
    }

    // 6. GET /api/plane/pages/:id (con contenido completo markdown)
    const pageMatch = pathname.match(/^\/api\/plane\/pages\/([^/]+)$/);
    if (pageMatch && method === 'GET') {
      const pageId = decodeURIComponent(pageMatch[1]);
      const page = database.prepare('SELECT * FROM pages WHERE id = ?').get(pageId);
      if (!page) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Pagina no encontrada' }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify(page));
      return;
    }

    // 7. PATCH /api/plane/issues/:id - Modificar estado/prioridad/ciclo/modulo
    const issueMatch = pathname.match(/^\/api\/plane\/issues\/([^/]+)$/);
    if (issueMatch && (method === 'PATCH' || method === 'PUT')) {
      const issueId = decodeURIComponent(issueMatch[1]);
      const body = await parseJsonBody(req);

      const existing = database.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
      if (!existing) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Issue no encontrado' }));
        return;
      }

      const stateId = body.state_id || existing.state_id;
      const priority = body.priority !== undefined ? body.priority : existing.priority;
      const assigneeRole = body.assignee_role !== undefined ? body.assignee_role : existing.assignee_role;
      const cycleId = body.cycle_id !== undefined ? body.cycle_id : existing.cycle_id;
      const moduleId = body.module_id !== undefined ? body.module_id : existing.module_id;
      const title = body.title || existing.title;
      const description = body.description !== undefined ? body.description : existing.description;

      database.prepare(`
        UPDATE issues SET
          state_id = ?,
          priority = ?,
          assignee_role = ?,
          cycle_id = ?,
          module_id = ?,
          title = ?,
          description = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?;
      `).run(stateId, priority, assigneeRole, cycleId, moduleId, title, description, issueId);

      // Sincronizar automaticamente hacia feature_list.json
      syncIssueToFiles(database, issueId);

      const updated = database.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, issue: updated }));
      return;
    }

    // 8. PUT /api/plane/pages/:id - Actualizar markdown
    if (pageMatch && method === 'PUT') {
      const pageId = decodeURIComponent(pageMatch[1]);
      const body = await parseJsonBody(req);
      if (body.content_markdown !== undefined) {
        const words = body.content_markdown.trim().split(/\s+/).filter(Boolean).length;
        const readingTime = Math.max(1, Math.ceil(words / 200));

        database.prepare(`
          UPDATE pages SET
            content_markdown = ?,
            word_count = ?,
            reading_time_min = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?;
        `).run(body.content_markdown, words, readingTime, pageId);

        // Sincronizar automaticamente hacia el archivo .md en disco
        syncPageToFile(database, pageId);
      }
      const updatedPage = database.prepare('SELECT * FROM pages WHERE id = ?').get(pageId);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, page: updatedPage }));
      return;
    }

    // 9. POST /api/plane/sync - Forzar re-sincronizacion
    if (pathname === '/api/plane/sync' && method === 'POST') {
      syncFilesToSQLite(database);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, message: 'Datos sincronizados exitosamente desde disco a SQLite' }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: `Ruta API desconocida: ${pathname}` }));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, PATCH, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Interceptar API de Plane
  if (req.url.startsWith('/api/plane/')) {
    handlePlaneApi(req, res, db);
    return;
  }

  // Sanitizar URL y resolver archivo estático
  let cleanUrl = req.url.split('?')[0];
  if (cleanUrl === '/' || cleanUrl === '') {
    cleanUrl = '/project-docs/index.html';
  } else if (cleanUrl === '/project-docs' || cleanUrl === '/project-docs/') {
    cleanUrl = '/project-docs/index.html';
  }

  const safePath = path.normalize(decodeURIComponent(cleanUrl)).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(ROOT_DIR, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`404 No encontrado: ${cleanUrl}`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`500 Error de lectura: ${err.message}`);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  const url = `http://localhost:${PORT}/project-docs/`;
  console.log(`========================================================`);
  console.log(`  Tablero de Seguimiento SDD Activo en Vivo (Plane + SQLite)`);
  console.log(`  URL: ${url}`);
  console.log(`  API SQLite: http://localhost:${PORT}/api/plane/data`);
  console.log(`  Auto-Sync Bidireccional: Activado (Markdown <-> SQLite)`);
  console.log(`========================================================`);
  console.log(`Presiona Ctrl+C para detener el servidor.\n`);

  const openCmd = process.platform === 'win32' ? `start ${url}`
                : process.platform === 'darwin' ? `open ${url}`
                : `xdg-open ${url}`;
  if (!process.env.NO_OPEN) { exec(openCmd, () => {}); }
});
