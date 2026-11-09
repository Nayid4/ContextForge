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
  syncPageToFile,
  recordSkillExecution,
  recordIssueEvidence,
  recordIssueComment,
  recordIssueRelation,
  createIssueInSQLite,
  upsertPageInSQLite,
  updatePagePropertiesInSQLite,
  createCollectionInSQLite,
  updateCollectionInSQLite,
  archiveCollectionInSQLite,
  movePageInSQLite,
  archivePageCascadeInSQLite,
  unarchivePageInSQLite,
  restorePageVersionInSQLite,
  unlockPageInSQLite,
  lockPageInSQLite
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
    // 1. GET /api/plane/data - Payload consolidado (incluye IA, usuarios, labels, views, evidencias)
    if (pathname === '/api/plane/data' && method === 'GET') {
      const data = getPlaneData(database);
      res.writeHead(200);
      res.end(JSON.stringify(data));
      return;
    }

    // 2. GET / POST /api/plane/issues
    if (pathname === '/api/plane/issues' && method === 'GET') {
      const data = getPlaneData(database);
      res.writeHead(200);
      res.end(JSON.stringify(data.issues));
      return;
    }

    if (pathname === '/api/plane/issues' && method === 'POST') {
      const body = await parseJsonBody(req);
      const created = createIssueInSQLite(database, body);
      res.writeHead(201);
      res.end(JSON.stringify({ ok: true, issue: created }));
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

    // 5. GET / POST /api/plane/pages
    if (pathname === '/api/plane/pages' && method === 'GET') {
      const data = getPlaneData(database);
      res.writeHead(200);
      res.end(JSON.stringify(data.pages));
      return;
    }

    if (pathname === '/api/plane/pages' && method === 'POST') {
      const body = await parseJsonBody(req);
      const page = upsertPageInSQLite(database, body);
      res.writeHead(201);
      res.end(JSON.stringify({ ok: true, page }));
      return;
    }

    // 6. GET / POST /api/plane/ai-runs
    if (pathname === '/api/plane/ai-runs' && method === 'GET') {
      const data = getPlaneData(database);
      res.writeHead(200);
      res.end(JSON.stringify(data.aiRuns || []));
      return;
    }

    if (pathname === '/api/plane/ai-runs' && method === 'POST') {
      const body = await parseJsonBody(req);
      const run = recordSkillExecution(database, body);
      res.writeHead(201);
      res.end(JSON.stringify({ ok: true, aiRun: run }));
      return;
    }

    // 7. GET /api/plane/users, /api/plane/labels, /api/plane/views
    if (pathname === '/api/plane/users' && method === 'GET') {
      const data = getPlaneData(database);
      res.writeHead(200);
      res.end(JSON.stringify(data.users || []));
      return;
    }

    if (pathname === '/api/plane/labels' && method === 'GET') {
      const data = getPlaneData(database);
      res.writeHead(200);
      res.end(JSON.stringify(data.labels || []));
      return;
    }

    if (pathname === '/api/plane/views' && method === 'GET') {
      const data = getPlaneData(database);
      res.writeHead(200);
      res.end(JSON.stringify(data.views || []));
      return;
    }

    // 8. POST /api/plane/issues/:id/evidences
    const evMatch = pathname.match(/^\/api\/plane\/issues\/([^/]+)\/evidences$/);
    if (evMatch && method === 'POST') {
      const issueId = decodeURIComponent(evMatch[1]);
      const body = await parseJsonBody(req);
      const evidence = recordIssueEvidence(database, { ...body, issue_id: issueId });
      res.writeHead(201);
      res.end(JSON.stringify({ ok: true, evidence }));
      return;
    }

    // 9. POST /api/plane/issues/:id/comments
    const cmtMatch = pathname.match(/^\/api\/plane\/issues\/([^/]+)\/comments$/);
    if (cmtMatch && method === 'POST') {
      const issueId = decodeURIComponent(cmtMatch[1]);
      const body = await parseJsonBody(req);
      const comment = recordIssueComment(database, { ...body, issue_id: issueId });
      res.writeHead(201);
      res.end(JSON.stringify({ ok: true, comment }));
      return;
    }

    // 10. POST /api/plane/issues/:id/relations
    const relMatch = pathname.match(/^\/api\/plane\/issues\/([^/]+)\/relations$/);
    if (relMatch && method === 'POST') {
      const issueId = decodeURIComponent(relMatch[1]);
      const body = await parseJsonBody(req);
      const relation = recordIssueRelation(database, { ...body, issue_id: issueId });
      res.writeHead(201);
      res.end(JSON.stringify({ ok: true, relation }));
      return;
    }

    // 11. GET /api/plane/pages/:id (con contenido completo markdown, versiones, logs y labels)
    const pageMatch = pathname.match(/^\/api\/plane\/pages\/([^/]+)$/);
    if (pageMatch && method === 'GET') {
      const pageId = decodeURIComponent(pageMatch[1]);
      const page = database.prepare('SELECT * FROM pages WHERE id = ? OR file_path = ?').get(pageId, pageId);
      if (!page) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Pagina no encontrada' }));
        return;
      }
      const versions = database.prepare('SELECT id, version_number, owned_by_role, word_count, last_saved_at, content_markdown FROM page_versions WHERE page_id = ? ORDER BY version_number DESC').all(page.id);
      const logs = database.prepare('SELECT * FROM page_logs WHERE page_id = ? ORDER BY created_at DESC').all(page.id);
      const labels = database.prepare('SELECT l.id, l.name, l.color, l.description FROM page_labels pl JOIN labels l ON pl.label_id = l.id WHERE pl.page_id = ?').all(page.id);
      res.writeHead(200);
      res.end(JSON.stringify({ ...page, versions, logs, labels }));
      return;
    }

    // 12. PATCH /api/plane/issues/:id - Modificar estado/prioridad/ciclo/modulo
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

      syncIssueToFiles(database, issueId);

      const updated = database.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, issue: updated }));
      return;
    }

    // 13. PUT / PATCH /api/plane/pages/:id - Actualizar markdown, propiedades (access, is_favorite, is_locked, archived, duplicate, full_width) o restaurar version
    if (pageMatch && (method === 'PUT' || method === 'PATCH')) {
      const pageId = decodeURIComponent(pageMatch[1]);
      const body = await parseJsonBody(req);
      const updatedPage = updatePagePropertiesInSQLite(database, pageId, {
        access: body.access,
        is_favorite: body.is_favorite,
        is_locked: body.is_locked,
        archived: body.archived,
        archived_at: body.archived_at,
        duplicate: body.duplicate,
        full_width: body.full_width,
        restore_version_id: body.restore_version_id,
        content_markdown: body.content_markdown,
        actor_role: body.role || 'spec-author'
      });
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, page: updatedPage }));
      return;
    }

    // 13b. POST /api/plane/collections - Crear Colección
    if (pathname === '/api/plane/collections' && method === 'POST') {
      const body = await parseJsonBody(req);
      const col = createCollectionInSQLite(database, body);
      res.writeHead(201);
      res.end(JSON.stringify({ ok: true, collection: col }));
      return;
    }

    // 13c. PATCH /api/plane/collections/:id - Actualizar Colección
    const colMatch = pathname.match(/^\/api\/plane\/collections\/([^/]+)$/);
    if (colMatch && (method === 'PATCH' || method === 'PUT')) {
      const colId = decodeURIComponent(colMatch[1]);
      const body = await parseJsonBody(req);
      const col = updateCollectionInSQLite(database, colId, body);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, collection: col }));
      return;
    }

    // 13d. DELETE /api/plane/collections/:id - Archivar Colección
    if (colMatch && method === 'DELETE') {
      const colId = decodeURIComponent(colMatch[1]);
      archiveCollectionInSQLite(database, colId);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, message: `Colección ${colId} archivada` }));
      return;
    }

    // 13e. POST /api/plane/pages/:id/unlock - Desbloquear documento normativo (con auditoría)
    const unlockMatch = pathname.match(/^\/api\/plane\/pages\/([^/]+)\/unlock$/);
    if (unlockMatch && method === 'POST') {
      const pageId = decodeURIComponent(unlockMatch[1]);
      const body = await parseJsonBody(req);
      const unlocked = unlockPageInSQLite(database, pageId, {
        actor: body.actor || { id: body.actorId || 'user-human-lead' },
        reason: body.reason || 'Confirmación explícita de desbloqueo'
      });
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, page: unlocked }));
      return;
    }

    // 13f. POST /api/plane/pages/:id/lock - Bloquear documento normativo (con auditoría)
    const lockMatch = pathname.match(/^\/api\/plane\/pages\/([^/]+)\/lock$/);
    if (lockMatch && method === 'POST') {
      const pageId = decodeURIComponent(lockMatch[1]);
      const body = await parseJsonBody(req);
      const locked = lockPageInSQLite(database, pageId, {
        actor: body.actor || { id: body.actorId || 'user-human-lead' },
        reason: body.reason || 'Bloqueo normativo'
      });
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, page: locked }));
      return;
    }

    // 13g. POST /api/plane/pages/:id/move - Mover de Colección o Padre
    const moveMatch = pathname.match(/^\/api\/plane\/pages\/([^/]+)\/move$/);
    if (moveMatch && method === 'POST') {
      const pageId = decodeURIComponent(moveMatch[1]);
      const body = await parseJsonBody(req);
      const moved = movePageInSQLite(database, pageId, body.collection_id, body.parent_id, {
        actor: body.actor || { id: body.actorId || 'user-human-lead' }
      });
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, page: moved }));
      return;
    }

    // 13h. POST /api/plane/pages/:id/archive-cascade - Archivar página y descendientes (BR-PAGE-09)
    const cascadeMatch = pathname.match(/^\/api\/plane\/pages\/([^/]+)\/archive-cascade$/);
    if (cascadeMatch && method === 'POST') {
      const pageId = decodeURIComponent(cascadeMatch[1]);
      const body = await parseJsonBody(req);
      archivePageCascadeInSQLite(database, pageId, {
        actor: body.actor || { id: body.actorId || 'user-human-lead' }
      });
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, message: `Página ${pageId} y jerarquía archivada` }));
      return;
    }

    // 13i. POST /api/plane/pages/:id/unarchive - Desarchivar página (opción restoreSubtree)
    const unarchiveMatch = pathname.match(/^\/api\/plane\/pages\/([^/]+)\/unarchive$/);
    if (unarchiveMatch && method === 'POST') {
      const pageId = decodeURIComponent(unarchiveMatch[1]);
      const body = await parseJsonBody(req);
      unarchivePageInSQLite(database, pageId, {
        restoreSubtree: Boolean(body?.restoreSubtree),
        actor: body.actor || { id: body.actorId || 'user-human-lead' }
      });
      const updated = database.prepare('SELECT * FROM pages WHERE id = ?').get(pageId);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, page: updated, message: `Página ${pageId} desarchivada exitosamente` }));
      return;
    }

    // 13j. POST /api/plane/pages/:id/versions/:ver/restore - Restaurar versión
    const restoreMatch = pathname.match(/^\/api\/plane\/pages\/([^/]+)\/versions\/(\d+)\/restore$/);
    if (restoreMatch && method === 'POST') {
      const pageId = decodeURIComponent(restoreMatch[1]);
      const verNum = parseInt(restoreMatch[2], 10);
      const body = await parseJsonBody(req);
      const restored = restorePageVersionInSQLite(database, pageId, verNum, {
        actor: body.actor || { id: body.actorId || 'user-human-lead' }
      });
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, page: restored }));
      return;
    }

    // 14. POST /api/plane/sync - Forzar re-sincronizacion
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
  console.log(`  Tablero de Seguimiento SDD Activo en Vivo (Plane + SQLite + AI)`);
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
