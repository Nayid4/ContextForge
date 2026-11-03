import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');

// Expresión regular canónica que captura el rango completo de emojis Unicode
const EMOJI_REGEX = /(?:\p{Extended_Pictographic}|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEFF]|[\u2600-\u26FF\u2700-\u27BF])/u;

function scanDirForEmojis(dir, violations = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        scanDirForEmojis(fullPath, violations);
      }
    } else if (/\.(js|html)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        if (EMOJI_REGEX.test(line)) {
          violations.push({
            file: path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/'),
            line: idx + 1,
            text: line.trim()
          });
        }
      });
    }
  }
  return violations;
}

test('Anti-Emoji Gate: project-docs/src/ debe tener 0 emojis unicode en código fuente', () => {
  const srcDir = path.join(ROOT_DIR, 'project-docs', 'src');
  const violations = scanDirForEmojis(srcDir);
  
  if (violations.length > 0) {
    const report = violations.map(v => `  ${v.file}:${v.line} -> ${v.text}`).join('\n');
    assert.fail(`Se detectaron ${violations.length} emojis prohibidos en project-docs/src/:\n${report}`);
  }
  assert.equal(violations.length, 0);
});

test('Anti-Emoji Gate: project-docs/index.html debe tener 0 emojis unicode', () => {
  const indexPath = path.join(ROOT_DIR, 'project-docs', 'index.html');
  const content = fs.readFileSync(indexPath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const violations = [];
  lines.forEach((line, idx) => {
    if (EMOJI_REGEX.test(line)) {
      violations.push({ line: idx + 1, text: line.trim() });
    }
  });

  assert.equal(violations.length, 0, `Se encontraron emojis en index.html: ${JSON.stringify(violations)}`);
});

test('Anti-Emoji Gate: project-docs/sync-data.js debe tener 0 emojis unicode', () => {
  const syncPath = path.join(ROOT_DIR, 'project-docs', 'sync-data.js');
  const content = fs.readFileSync(syncPath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const violations = [];
  lines.forEach((line, idx) => {
    if (EMOJI_REGEX.test(line)) {
      violations.push({ line: idx + 1, text: line.trim() });
    }
  });

  assert.equal(violations.length, 0, `Se encontraron emojis en sync-data.js: ${JSON.stringify(violations)}`);
});
