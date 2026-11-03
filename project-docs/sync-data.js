import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

console.log('[SYNC] Sincronizando datos reales hacia project-docs/data-fallback.js...');

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
  const docMetadata = {};
  const shelves = {
    architecture: { id: 'architecture', title: 'Arquitectura & Modelado C4', iconName: 'architecture', docs: [] },
    business_rules: { id: 'business_rules', title: 'Reglas de Negocio & Dominio', iconName: 'business_rules', docs: [] },
    requirements: { id: 'requirements', title: 'Requerimientos & Metodología Ágil', iconName: 'requirements', docs: [] },
    adrs: { id: 'adrs', title: 'Decisiones de Arquitectura (ADRs)', iconName: 'adrs', docs: [] },
    standards: { id: 'standards', title: 'Estándares, Capacidades & Servicios', iconName: 'standards', docs: [] },
    modules: { id: 'modules', title: 'Módulos & Bounded Contexts', iconName: 'modules', docs: [] }
  };

  function classifyShelf(key) {
    if (key.startsWith('modules/')) return 'modules';
    if (key === 'c4-model.md' || key === 'uml-diagrams.md' || key === 'data-dictionary.md' || key.includes('architecture') || key.includes('diagrams')) return 'architecture';
    if (key === 'business-rules.md' || key.includes('rules-catalog') || key.includes('business-rules')) return 'business_rules';
    if (key === 'functional-requirements.md' || key === 'user-stories-catalog.md' || key === 'traceability-matrix.md' || key.includes('requirements') || key.includes('stories')) return 'requirements';
    if (key === 'adr-catalog.md') return 'adrs';
    if (key === 'coding-standards.md' || key === 'external-services.md' || key === 'system-capabilities.md' || key.includes('overview') || key.includes('domain') || key.includes('MASTER') || key.includes('code-quality')) return 'standards';
    return 'general';
  }

  function extractTitleAndSummary(content, filename) {
    const lines = content.split(/\r?\n/);
    let title = '';
    let summary = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!title && trimmed.startsWith('# ')) {
        title = trimmed.replace(/^#\s+/, '').trim();
      } else if (title && !summary && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('>') && !trimmed.startsWith('-') && !trimmed.startsWith('```')) {
        summary = trimmed.slice(0, 160) + (trimmed.length > 160 ? '...' : '');
      }
      if (title && summary) break;
    }
    if (!title) {
      title = filename.replace(/\.md$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    if (!summary) {
      summary = 'Documentación técnica y especificación formal de ingeniería.';
    }
    return { title, summary };
  }

  function scanDocs(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        scanDocs(fullPath, prefix ? `${prefix}/${ent.name}` : ent.name);
      } else if (ent.isFile() && ent.name.endsWith('.md')) {
        const key = prefix ? `${prefix}/${ent.name}` : ent.name;
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const stat = fs.statSync(fullPath);
          docs[key] = content;

          const words = content.trim().split(/\s+/).length;
          const readingTime = Math.max(1, Math.ceil(words / 200));
          const { title, summary } = extractTitleAndSummary(content, ent.name);
          const shelfKey = classifyShelf(key);
          const brMatches = (content.match(/BR-[A-Z]+-[0-9]+/g) || []).length;
          const rfMatches = (content.match(/RF-[A-Z]+-[0-9]+/g) || []).length;
          const adrMatches = (content.match(/ADR-[0-9]+/g) || []).length;

          const meta = {
            key,
            filename: ent.name,
            title,
            summary,
            shelf: shelfKey,
            readingTime,
            wordCount: words,
            lastModified: stat.mtime.toISOString().split('T')[0],
            ruleCount: brMatches,
            reqCount: rfMatches,
            adrCount: adrMatches,
            isModule: key.startsWith('modules/'),
            moduleName: key.startsWith('modules/') ? key.split('/')[1] : null
          };

          docMetadata[key] = meta;
          if (shelves[shelfKey]) {
            shelves[shelfKey].docs.push(key);
          }
        } catch (_) {}
      }
    }
  }

  function extractDiagrams(docs, existingDiagrams = []) {
    const configs = [
      {
        docKey: 'c4-model.md',
        headingRegex: /##\s+Nivel\s+1/i,
        id: 'c1',
        type: 'C4 Model',
        level: 'Nivel 1',
        title: 'Modelo C4 - Contexto de Sistema (C1)',
        defaultDescription: 'Muestra los límites del arnés, los actores principales y los sistemas externos con los que interactúa.'
      },
      {
        docKey: 'c4-model.md',
        headingRegex: /##\s+Nivel\s+2/i,
        id: 'c2',
        type: 'C4 Model',
        level: 'Nivel 2',
        title: 'Modelo C4 - Contenedores del Arnés (C2)',
        defaultDescription: 'Descompone el arnés en sus subsistemas y aplicaciones principales.'
      },
      {
        docKey: 'c4-model.md',
        headingRegex: /##\s+Nivel\s+3/i,
        id: 'c3',
        type: 'C4 Model',
        level: 'Nivel 3',
        title: 'Modelo C4 - Componentes del Tablero Web (C3)',
        defaultDescription: 'Desglose interno de la aplicación web en project-docs/.'
      },
      {
        docKey: 'uml-diagrams.md',
        headingRegex: /##\s+1\.\s+Diagrama\s+de\s+Clases/i,
        id: 'class',
        type: 'UML Clases',
        level: 'Modelo de Dominio',
        title: 'Diagrama de Clases del Dominio SDD',
        defaultDescription: 'Muestra las entidades, value objects y relaciones del modelo conceptual del arnés.'
      },
      {
        docKey: 'uml-diagrams.md',
        headingRegex: /##\s+2\.\s+Diagrama\s+de\s+Secuencia:\s*Ciclo/i,
        id: 'seq-sdd',
        type: 'UML Secuencia',
        level: 'Proceso SDD',
        title: 'Secuencia: Ciclo de Vida Completo SDD',
        defaultDescription: 'Secuencia completa de interacciones entre desarrollador y agentes en el ciclo SDD.'
      },
      {
        docKey: 'uml-diagrams.md',
        headingRegex: /##\s+3\.\s+Diagrama\s+de\s+Secuencia:\s*Editor/i,
        id: 'seq-editor',
        type: 'UML Secuencia',
        level: 'Editor Dual',
        title: 'Secuencia: Editor Dual ContextForge',
        defaultDescription: 'Secuencia de interacción en el editor dual con scroll sincronizado.'
      },
      {
        docKey: 'uml-diagrams.md',
        headingRegex: /##\s+4\.\s+Diagrama\s+de\s+Casos/i,
        id: 'use-cases',
        type: 'UML Casos de Uso',
        level: 'Casos de Uso',
        title: 'Diagrama de Casos de Uso del Arnés SDD',
        defaultDescription: 'Casos de uso del arnés de ingeniería ejecutados por humanos y agentes de IA.'
      },
      {
        docKey: 'data-dictionary.md',
        headingRegex: /##\s+1\.\s+Diagrama\s+Entidad/i,
        id: 'erd',
        type: 'Database ERD',
        level: 'Persistencia',
        title: 'Diagrama Entidad-Relación (ERD)',
        defaultDescription: 'Diagrama Entidad-Relación formal de las entidades y esquemas JSON/YAML.'
      }
    ];

    const extractedList = [];

    for (const cfg of configs) {
      const docContent = docs[cfg.docKey];
      if (!docContent) continue;
      const parts = docContent.split(/(?=^##\s+)/m);
      for (const part of parts) {
        if (cfg.headingRegex.test(part)) {
          const match = part.match(/```mermaid\r?\n([\s\S]*?)```/);
          if (match) {
            const lines = part.split(/\r?\n/);
            let desc = '';
            for (const line of lines) {
              const tr = line.trim();
              if (!tr || tr.startsWith('#') || tr.startsWith('```') || tr.startsWith('>')) continue;
              desc = tr;
              break;
            }
            extractedList.push({
              id: cfg.id,
              type: cfg.type,
              level: cfg.level,
              title: cfg.title,
              description: desc || cfg.defaultDescription,
              mermaid: match[1].trim()
            });
          }
          break;
        }
      }
    }

    return extractedList;
  }

  scanDocs(knowledgeDir);
  knowledgeIndex.docs = docs;
  knowledgeIndex.docMetadata = docMetadata;
  knowledgeIndex.shelves = shelves;
  knowledgeIndex.diagrams = extractDiagrams(docs, knowledgeIndex.diagrams || []);

  // Agrupar módulos y sus artefactos para el explorador modular
  const modulesData = {};
  for (const key of Object.keys(docs)) {
    if (key.startsWith('modules/')) {
      const parts = key.split('/');
      const modName = parts[1];
      const filename = parts[2];
      if (!modulesData[modName]) {
        modulesData[modName] = {
          id: modName,
          name: modName,
          title: modName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          status: 'COMPLETAMENTE CUBIERTO',
          docs: [],
          docMetadata: {}
        };
      }
      modulesData[modName].docs.push(key);
      modulesData[modName].docMetadata[filename] = docMetadata[key];
    }
  }
  knowledgeIndex.modulesData = modulesData;

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
console.log('[OK] project-docs/data-fallback.js actualizado con los datos reales y documentos Markdown.');

// Recompilar bundle para incluir cambios si existe esbuild
try {
  execSync('npx esbuild project-docs/src/main.js --bundle --outfile=project-docs/dist/app.bundle.js --format=iife', {
    cwd: ROOT_DIR,
    stdio: 'ignore'
  });
  console.log('[OK] project-docs/dist/app.bundle.js recompilado con éxito.');
} catch (_) {
  // esbuild opcional si no está disponible en el entorno
}

console.log('[SUCCESS] Sincronización completada. El tablero ahora muestra los datos reales en modo offline.');
