const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8080;
// Raíz del proyecto (un nivel arriba de project-docs) para servir tanto /project-docs/ como archivos en raíz
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

const server = http.createServer((req, res) => {
  // Configurar CORS para permitir peticiones locales fluidas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Sanitizar URL y resolver archivo
  let cleanUrl = req.url.split('?')[0];
  if (cleanUrl === '/' || cleanUrl === '') {
    cleanUrl = '/project-docs/index.html';
  } else if (cleanUrl === '/project-docs' || cleanUrl === '/project-docs/') {
    cleanUrl = '/project-docs/index.html';
  }

  const safePath = path.normalize(decodeURIComponent(cleanUrl)).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(ROOT_DIR, safePath);

  // Si es un directorio, buscar index.html
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

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}/project-docs/`;
  console.log(`========================================================`);
  console.log(`  Tablero de Seguimiento SDD Activo en Vivo`);
  console.log(`  URL: ${url}`);
  console.log(`  Auto-Sync: Activado (detecta cambios en JSON en vivo)`);
  console.log(`========================================================`);
  console.log(`Presiona Ctrl+C para detener el servidor.\n`);

  // Abrir navegador automáticamente según el SO
  const openCmd = process.platform === 'win32' ? `start ${url}`
                : process.platform === 'darwin' ? `open ${url}`
                : `xdg-open ${url}`;
  exec(openCmd, () => {});
});
