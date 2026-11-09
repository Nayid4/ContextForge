/**
 * Frontmatter Migration & Validation Tool for Plane Wiki Knowledge Base
 * Ejecuta análisis y migración determinista de metadatos YAML en project-docs/knowledge/
 * Uso:
 *   node project-docs/scripts/migrate-frontmatter.cjs --dry-run
 *   node project-docs/scripts/migrate-frontmatter.cjs --apply
 */

const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.resolve(__dirname, '../knowledge');

function getMdFiles(dir) {
  let res = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) res.push(...getMdFiles(full));
    else if (e.name.endsWith('.md')) res.push(full);
  }
  return res;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { frontmatter: {}, body: content, hasFrontmatter: false };

  const raw = match[1];
  const body = content.slice(match[0].length);
  const data = {};

  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (kv) {
      const key = kv[1].trim();
      let val = kv[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      } else if (val.startsWith('[') && val.endsWith(']')) {
        try {
          val = JSON.parse(val.replace(/'/g, '"'));
        } catch (_) {
          val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
      } else if (val === 'true' || val === '1') {
        val = true;
      } else if (val === 'false' || val === '0') {
        val = false;
      } else if (val === 'null' || val === '') {
        val = null;
      }
      data[key] = val;
    }
  }

  return { frontmatter: data, body, hasFrontmatter: true, rawFrontmatter: raw };
}

const CANONICAL_COLLECTION_MAP = {
  // General: Visión, contexto, dominio DDD, estándares transversales, logs IA y dossier maestro
  '01-project-overview-and-business.md': 'general',
  '04-domain-ddd-and-crc.md': 'general',
  'coding-standards.md': 'general',
  'external-services.md': 'general',
  'ai-runs-log.md': 'general',
  'MASTER-PROJECT-KNOWLEDGE.md': 'general',

  // Engineering: Arquitectura AS-IS, C4, UML, datos, ADRs, trazabilidad y submódulos
  '02-architecture-and-patterns.md': 'engineering',
  'c4-model.md': 'engineering',
  'uml-diagrams.md': 'engineering',
  'data-dictionary.md': 'engineering',
  'adr-catalog.md': 'engineering',
  'traceability-matrix.md': 'engineering',

  // Product: Capacidades, historias de usuario, requerimientos SRS y reglas de negocio
  '03-capabilities-and-features.md': 'product',
  'functional-requirements.md': 'product',
  'user-stories-catalog.md': 'product',
  'business-rules.md': 'product',
  'system-capabilities.md': 'product'
};

function deriveCollection(relPath, fm) {
  if (fm.collection) {
    const c = String(fm.collection).toLowerCase().trim().replace(/[- ]+/g, '_');
    if (['product', 'engineering', 'general', 'design', 'customer_support'].includes(c)) return c;
  }
  const cleanRel = relPath.replace(/\\/g, '/');
  if (CANONICAL_COLLECTION_MAP[cleanRel]) return CANONICAL_COLLECTION_MAP[cleanRel];
  if (cleanRel.startsWith('modules/')) return 'engineering';

  const low = cleanRel.toLowerCase();
  if (low.includes('/product/') || low.includes('requirements') || low.includes('capabilities') || low.includes('stories')) return 'product';
  if (low.includes('/engineering/') || low.includes('c4') || low.includes('architecture') || low.includes('uml') || low.includes('data-dictionary')) return 'engineering';
  if (low.includes('/design/') || low.includes('tokens') || low.includes('ui-')) return 'design';
  if (low.includes('/customer_support/') || low.includes('runbook') || low.includes('troubleshoot')) return 'customer_support';
  return 'general';
}

function deriveParent(relPath, fm) {
  if (fm.parent !== undefined) return fm.parent;
  const cleanRel = relPath.replace(/\\/g, '/');

  // Modules sub-files parented under their module-spec.md
  if (cleanRel.startsWith('modules/') && !cleanRel.endsWith('module-spec.md')) {
    const modDir = path.dirname(cleanRel);
    return `${modDir}/module-spec.md`;
  }

  // Views parented under c4-model.md in engineering
  if (cleanRel === '02-architecture-and-patterns.md') return 'c4-model.md';
  if (cleanRel === 'uml-diagrams.md') return 'c4-model.md';
  if (cleanRel === 'traceability-matrix.md') return 'c4-model.md';

  // Product subpages parented under 03-capabilities-and-features.md
  if (cleanRel === 'system-capabilities.md') return '03-capabilities-and-features.md';
  if (cleanRel === 'user-stories-catalog.md') return '03-capabilities-and-features.md';

  return null;
}

function deriveLockStatus(relPath, fm) {
  if (fm.is_locked !== undefined) return Boolean(fm.is_locked);
  const low = relPath.toLowerCase();
  return (
    low.includes('business-rule') ||
    low.includes('functional-requirements') ||
    low.includes('data-dictionary') ||
    low.includes('c4-model') ||
    low.includes('coding-standards') ||
    low.includes('requirements-and-rules.md')
  );
}

function deriveFavoriteStatus(relPath, fm) {
  if (fm.is_favorite !== undefined) return Boolean(fm.is_favorite);
  const low = relPath.toLowerCase();
  return low.includes('c4-model') || low.includes('01-project-overview') || low.includes('03-capabilities');
}

function deriveFullWidth(relPath, fm, body) {
  if (fm.full_width !== undefined) return Boolean(fm.full_width);
  const low = relPath.toLowerCase();
  const hasMermaid = body.includes('```mermaid');
  return low.includes('c4-model') || low.includes('data-dictionary') || low.includes('traceability') || low.includes('diagrams') || hasMermaid;
}

function buildYamlFrontmatter(data) {
  const lines = ['---'];
  // Keep key order: id, title, collection, parent, owner, status, version, access, is_locked, is_favorite, full_width, last_updated, tags, labels
  const orderedKeys = [
    'id', 'title', 'collection', 'parent', 'owner', 'module', 'status', 'version',
    'access', 'is_locked', 'is_favorite', 'full_width', 'last_updated', 'tags', 'labels'
  ];

  for (const k of orderedKeys) {
    if (data[k] !== undefined) {
      const v = data[k];
      if (Array.isArray(v)) {
        lines.push(`${k}: ${JSON.stringify(v)}`);
      } else if (typeof v === 'boolean') {
        lines.push(`${k}: ${v}`);
      } else if (typeof v === 'number') {
        lines.push(`${k}: ${v}`);
      } else if (v === null) {
        lines.push(`${k}: null`);
      } else {
        lines.push(`${k}: "${String(v).replace(/"/g, '\\"')}"`);
      }
    }
  }

  // Any other keys
  for (const k of Object.keys(data)) {
    if (!orderedKeys.includes(k)) {
      const v = data[k];
      if (Array.isArray(v)) lines.push(`${k}: ${JSON.stringify(v)}`);
      else lines.push(`${k}: "${String(v)}"`);
    }
  }

  lines.push('---');
  return lines.join('\n');
}

function runMigration({ dryRun = true } = {}) {
  const files = getMdFiles(KNOWLEDGE_DIR);
  const report = [];

  for (const file of files) {
    const rel = path.relative(KNOWLEDGE_DIR, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const { frontmatter, body, hasFrontmatter } = parseFrontmatter(content);

    // Retener claves existentes sin alterarlas
    const id = frontmatter.id || `DOC-${rel.replace(/[^a-zA-Z0-9_-]/g, '_').toUpperCase()}`;
    const title = frontmatter.title || rel.replace(/\.md$/, '').replace(/^[0-9]+-/, '').replace(/[-_]/g, ' ');
    const collection = deriveCollection(rel, frontmatter);
    const parent = deriveParent(rel, frontmatter);
    const owner = frontmatter.owner || (rel.includes('specs/') ? 'spec-author' : 'leader');
    const access = frontmatter.access !== undefined ? frontmatter.access : 0;
    const isLocked = deriveLockStatus(rel, frontmatter);
    const isFavorite = deriveFavoriteStatus(rel, frontmatter);
    const fullWidth = deriveFullWidth(rel, frontmatter, body);
    const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : (frontmatter.tags ? [frontmatter.tags] : []);
    const labels = Array.isArray(frontmatter.labels) ? frontmatter.labels : [...new Set([...tags, collection])];

    const updatedFm = {
      ...frontmatter,
      id,
      title,
      collection,
      parent,
      owner,
      status: frontmatter.status || 'Publicado',
      version: frontmatter.version || '4.0.0',
      access,
      is_locked: isLocked,
      is_favorite: isFavorite,
      full_width: fullWidth,
      last_updated: frontmatter.last_updated || new Date().toISOString().slice(0, 10),
      tags,
      labels
    };

    const newFrontmatterStr = buildYamlFrontmatter(updatedFm);
    const newContent = `${newFrontmatterStr}\n${body.replace(/^\r?\n+/, '\n')}`;

    report.push({
      file: rel,
      id: updatedFm.id,
      collection: updatedFm.collection,
      parent: updatedFm.parent || '(root)',
      is_locked: updatedFm.is_locked ? 'SI' : 'NO',
      is_favorite: updatedFm.is_favorite ? 'SI' : 'NO',
      labels_count: updatedFm.labels.length,
      action: hasFrontmatter ? 'UPDATE_FIELDS' : 'INSERT_FRONTMATTER'
    });

    if (!dryRun) {
      fs.writeFileSync(file, newContent, 'utf8');
    }
  }

  return report;
}

// CLI Entrypoint
const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--apply');
console.log(`[FRONTMATTER-MIGRATOR] Modo: ${isDryRun ? 'DRY-RUN (Simulación sin escrituras)' : 'APPLY (Escritura en disco)'}`);

const results = runMigration({ dryRun: isDryRun });
console.log(`[FRONTMATTER-MIGRATOR] Documentos procesados: ${results.length}`);
console.table(results.slice(0, 15));

module.exports = { runMigration };
