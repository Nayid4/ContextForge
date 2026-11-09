const fs = require('fs');
const path = require('path');
const { initDatabase } = require('../src/core/db.js');

const dbPath = path.resolve(__dirname, '../data/harness.db');
const backupPath = path.resolve(__dirname, '../data/harness.db.bak');

const isDryRun = process.argv.includes('--dry-run');
const isApply = process.argv.includes('--apply');

console.log('=== MIGRACIÓN DE RECONSTRUCCIÓN DE TABLA PAGES CON FOREIGN KEYS ===');
console.log('DB Path:', dbPath);
console.log('Modo:', isDryRun ? 'DRY-RUN (solo verificación)' : isApply ? 'APPLY (modificación en disco)' : 'DEFAULT (inspección)');

// 1. Verificar respaldo
if (isApply && !fs.existsSync(backupPath)) {
  fs.copyFileSync(dbPath, backupPath);
  console.log('[BACKUP] Creado respaldo de seguridad en:', backupPath);
} else {
  console.log('[BACKUP] Respaldo verificado en:', backupPath);
}

const db = initDatabase(dbPath);

// 2. Comprobar si ya tiene las FKs
const fks = db.prepare('PRAGMA foreign_key_list(pages)').all();
console.log('FKs actuales en pages:', fks.map(f => `${f.from} -> ${f.table}(${f.to})`));

const hasColFk = fks.some(f => f.from === 'collection_id' && f.table === 'collections');
const hasParentFk = fks.some(f => f.from === 'parent_id' && f.table === 'pages');

if (hasColFk && hasParentFk) {
  console.log('[OK] La tabla pages ya cuenta con todas las Foreign Keys requeridas.');
  process.exit(0);
}

if (!isApply) {
  console.log('[DRY-RUN] Faltan FKs en pages. Para aplicar la migración ejecute con --apply.');
  process.exit(0);
}

// 3. Reconstrucción segura
db.exec('PRAGMA foreign_keys = OFF;');
db.exec('BEGIN IMMEDIATE TRANSACTION;');

try {
  // Crear tabla temporal con el esquema exacto de db.js
  db.exec(`
    CREATE TABLE pages_rebuild (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL DEFAULT 'proj-harness',
      workspace_id TEXT NOT NULL DEFAULT 'ws-harness',
      owned_by_id TEXT DEFAULT 'user-spec-author',
      owned_by_role TEXT DEFAULT 'spec-author',
      updated_by_id TEXT DEFAULT 'user-spec-author',
      parent_id TEXT,
      collection_id TEXT NOT NULL DEFAULT 'general',
      owner_name TEXT DEFAULT 'spec-author',
      emoji TEXT DEFAULT 'page',
      module_id TEXT,
      file_path TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT,
      shelf TEXT NOT NULL,
      content_markdown TEXT NOT NULL,
      description_html TEXT DEFAULT '',
      description_stripped TEXT DEFAULT '',
      access INTEGER NOT NULL DEFAULT 0,
      is_locked INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      view_props TEXT DEFAULT '{"full_width":false}',
      logo_props TEXT DEFAULT '{"in_use":"icon","icon":{"name":"file-text","color":"#6366f1"}}',
      archived_at DATETIME,
      word_count INTEGER NOT NULL DEFAULT 0,
      char_count INTEGER NOT NULL DEFAULT 0,
      paragraph_count INTEGER NOT NULL DEFAULT 0,
      diagrams_count INTEGER NOT NULL DEFAULT 0,
      reading_time_min INTEGER DEFAULT 1,
      slug TEXT,
      sort_order REAL DEFAULT 1000,
      depth INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE RESTRICT,
      FOREIGN KEY (parent_id) REFERENCES pages(id) ON DELETE SET NULL
    );
  `);

  // Obtener columnas existentes en pages
  const cols = db.prepare('PRAGMA table_info(pages)').all().map(c => c.name);
  const targetCols = [
    'id', 'project_id', 'workspace_id', 'owned_by_id', 'owned_by_role', 'updated_by_id',
    'parent_id', 'collection_id', 'owner_name', 'emoji', 'module_id', 'file_path',
    'title', 'summary', 'shelf', 'content_markdown', 'description_html', 'description_stripped',
    'access', 'is_locked', 'is_favorite', 'view_props', 'logo_props', 'archived_at',
    'word_count', 'char_count', 'paragraph_count', 'diagrams_count', 'reading_time_min',
    'slug', 'sort_order', 'depth', 'created_at', 'updated_at'
  ];

  const commonCols = targetCols.filter(c => cols.includes(c));
  const colList = commonCols.join(', ');

  console.log(`[COPY] Copiando ${commonCols.length} columnas desde pages hacia pages_rebuild...`);
  db.exec(`INSERT INTO pages_rebuild (${colList}) SELECT ${colList} FROM pages;`);

  const oldCount = db.prepare('SELECT COUNT(*) as c FROM pages').get()?.c;
  const newCount = db.prepare('SELECT COUNT(*) as c FROM pages_rebuild').get()?.c;
  console.log(`[VERIFY] Filas transferidas: ${newCount} (origen: ${oldCount})`);

  if (oldCount !== newCount) {
    throw new Error(`Inconsistencia en conteo de filas: ${oldCount} != ${newCount}`);
  }

  db.exec('DROP TABLE pages;');
  db.exec('ALTER TABLE pages_rebuild RENAME TO pages;');

  // Recrear índices
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_pages_collection_id ON pages(collection_id);
    CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id);
    CREATE INDEX IF NOT EXISTS idx_pages_archived_at ON pages(archived_at);
    CREATE INDEX IF NOT EXISTS idx_pages_favorite ON pages(is_favorite);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_collection_slug ON pages(collection_id, slug);
  `);

  db.exec('COMMIT;');
  db.exec('PRAGMA foreign_keys = ON;');

  const fkCheck = db.prepare('PRAGMA foreign_key_check;').all();
  console.log('[CHECK] PRAGMA foreign_key_check:', fkCheck.length === 0 ? 'TODO VÁLIDO (0 violaciones)' : fkCheck);

  const finalFks = db.prepare('PRAGMA foreign_key_list(pages)').all();
  console.log('[SUCCESS] Nuevas FKs en pages:', finalFks.map(f => `${f.from} -> ${f.table}(${f.to}) [ON DELETE ${f.on_delete}]`));
} catch (err) {
  db.exec('ROLLBACK;');
  console.error('[ERROR] Error en migración:', err.message);
  process.exit(1);
}
