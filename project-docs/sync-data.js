const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script de sincronización de datos para el modo offline (file:///).
 * Lee los archivos reales generados por las skills:
 * - project-docs/feature_list.json (o raíz)
 * - project-docs/project-spec.json (o raíz)
 * - project-docs/knowledge/knowledge-index.json
 * - project-docs/progres/current.json (o progress/current.json)
 * - project-docs/progres/history.json (o progress/history.json)
 *
 * Y actualiza automáticamente project-docs/data-fallback.js
 * para que al hacer doble clic directo en index.html, la página
 * muestre los datos reales del proyecto sin necesidad de servidor.
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

// 3. Knowledge Index
const knowledgeIndex = readJsonIfExists([
  path.join(PROJECT_DOCS_DIR, 'knowledge', 'knowledge-index.json'),
  path.join(ROOT_DIR, 'knowledge', 'knowledge-index.json')
]);

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
console.log('✅ project-docs/data-fallback.js actualizado con los datos reales del proyecto.');

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
