const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script de sincronización de datos para el modo offline (file:///) y servidor HTTP.
 * Lee los archivos reales generados por las skills:
 * - project-docs/feature_list.json (o raíz)
 * - project-docs/project-spec.json (o raíz)
 * - project-docs/knowledge/knowledge-index.json
 * - project-docs/knowledge/*.md y modules/**\/*.md (Docs-as-Code)
 * - project-docs/progres/current.json (o progress/current.json)
 * - project-docs/progres/history.json (o progress/history.json)
 *
 * Y actualiza automáticamente project-docs/data-fallback.js y knowledge-index.json
 * para que el tablero muestre la documentación y diagramas reales tanto en local como por servidor.
 */

const PROJECT_DOCS_DIR = __dirname;
const ROOT_DIR = path.resolve(__dirname, '..');

function readJsonIfExists(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        return JSON.parse(raw);
      } catch (e) {
        console.warn(`[WARN] Error parseando JSON en ${p}:`, e.message);
      }
    }
  }
  return null;
}

console.log('🔄 Sincronizando datos reales hacia project-docs/data-fallback.js...');

// 1. Feature list
const featureList = readJsonIfExists([
  path.join(PROJECT_DOCS_DIR, 'feature_list.json'),
  path.join(ROOT_DIR, 'feature_list.json')
]) || { project: 'Proyecto', features: [] };

// 2. Project Spec
const projectSpec = readJsonIfExists([
  path.join(PROJECT_DOCS_DIR, 'project-spec.json'),
  path.join(ROOT_DIR, 'project-spec.json')
]);

// 3. Knowledge Index & Ingesta de Documentos Markdown (Docs-as-Code)
const knowledgeIndex = readJsonIfExists([
  path.join(PROJECT_DOCS_DIR, 'knowledge', 'knowledge-index.json'),
  path.join(ROOT_DIR, 'knowledge', 'knowledge-index.json')
]) || {};

const knowledgeDir = path.join(PROJECT_DOCS_DIR, 'knowledge');
if (fs.existsSync(knowledgeDir)) {
  const docs = {};
  function scanDocs(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory()) {
        scanDocs(path.join(dir, ent.name), prefix ? `${prefix}/${ent.name}` : ent.name);
      } else if (ent.isFile() && ent.name.endsWith('.md')) {
        const key = prefix ? `${prefix}/${ent.name}` : ent.name;
        try {
          docs[key] = fs.readFileSync(path.join(dir, ent.name), 'utf8');
        } catch (_) {}
      }
    }
  }
  scanDocs(knowledgeDir);
  knowledgeIndex.docs = docs;

  // Actualizar también el archivo JSON en disco
  const kIndexPath = path.join(knowledgeDir, 'knowledge-index.json');
  try {
    fs.writeFileSync(kIndexPath, JSON.stringify(knowledgeIndex, null, 2), 'utf8');
  } catch (_) {}
}

// 4. Current Spec
const currentSpec = readJsonIfExists([
  path.join(PROJECT_DOCS_DIR, 'progres', 'current.json'),
  path.join(PROJECT_DOCS_DIR, 'progress', 'current.json'),
  path.join(ROOT_DIR, 'progress', 'current.json'),
  path.join(ROOT_DIR, 'progres', 'current.json')
]) || {};

// 5. History
const historyData = readJsonIfExists([
  path.join(PROJECT_DOCS_DIR, 'progres', 'history.json'),
  path.join(PROJECT_DOCS_DIR, 'progress', 'history.json'),
  path.join(ROOT_DIR, 'progress', 'history.json'),
  path.join(ROOT_DIR, 'progres', 'history.json')
]) || { records: [] };

// Construir contenido para data-fallback.js
const fallbackPath = path.join(PROJECT_DOCS_DIR, 'data-fallback.js');
const fallbackContent = `/**
 * Datos de respaldo embebidos (Fallback).
 * Permite que index.html funcione al 100% abriendo directamente con doble clic (file:///)
 * sin ser bloqueado por la directiva CORS de los navegadores.
 * Sincronizado automáticamente por project-docs/sync-data.js
 */
window.__FALLBACK_DATA__ = {
  featureList: ${JSON.stringify(featureList, null, 2)},
  currentSpec: ${JSON.stringify(currentSpec, null, 2)},
  historyData: ${JSON.stringify(historyData, null, 2)},
  projectSpec: ${JSON.stringify(projectSpec, null, 2)},
  knowledgeIndex: ${JSON.stringify(knowledgeIndex, null, 2)}
};
`;

fs.writeFileSync(fallbackPath, fallbackContent, 'utf8');
console.log('✅ project-docs/data-fallback.js actualizado con los datos reales y documentos Markdown.');

// Recompilar bundle para incluir cambios si existe esbuild
try {
  execSync('npx esbuild project-docs/src/main.js --bundle --outfile=project-docs/dist/app.bundle.js --format=iife', {
    cwd: ROOT_DIR,
    stdio: 'ignore'
  });
  console.log('✅ project-docs/dist/app.bundle.js recompilado con éxito.');
} catch (_) {
  // esbuild opcional si no está disponible en el entorno
}

console.log('🎉 Sincronización completada. El tablero ahora muestra los datos reales en modo offline.');
