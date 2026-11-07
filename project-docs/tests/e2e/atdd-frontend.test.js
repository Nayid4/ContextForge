import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { renderArchitectureDocs } from '../../src/features/architecture-docs/ArchitectureDocs.js';
import { renderKnowledgeBase } from '../../src/features/knowledge-base/KnowledgeBase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.resolve(__dirname, '..', '..');

const EMOJI_REGEX = /(?:\p{Extended_Pictographic}|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEFF]|[\u2600-\u26FF\u2700-\u27BF])/u;

test('ATDD Scenario 1: Interfaz 100% Vectorial sin Emojis en Componentes Principales', () => {
  // GIVEN datos reales del arnés
  const specPath = path.join(DOCS_DIR, 'project-spec.json');
  const kIndexPath = path.join(DOCS_DIR, 'knowledge', 'knowledge-index.json');
  const projectSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const knowledgeIndex = JSON.parse(fs.readFileSync(kIndexPath, 'utf8'));

  // WHEN se renderizan las vistas de Arquitectura y Base de Conocimiento
  const archHtml = renderArchitectureDocs({ projectSpec, knowledgeIndex });
  const kbHtml = renderKnowledgeBase({ projectSpec, knowledgeIndex });

  // THEN no debe haber ningún emoji en el HTML resultante
  assert.ok(!EMOJI_REGEX.test(archHtml), 'renderArchitectureDocs no debe contener emojis');
  assert.ok(!EMOJI_REGEX.test(kbHtml), 'renderKnowledgeBase no debe contener emojis');
});

test('ATDD Scenario 2: Stack Tecnológico estructurado en Tabla Técnica Compacta', () => {
  // GIVEN especificación técnica del proyecto
  const specPath = path.join(DOCS_DIR, 'project-spec.json');
  const projectSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

  // WHEN se renderiza la vista técnica de arquitectura
  const archHtml = renderArchitectureDocs({ projectSpec, knowledgeIndex: {} });

  // THEN debe contener la tabla estructurada con las columnas requeridas
  assert.ok(archHtml.includes('<table'), 'Debe incluir una tabla HTML');
  assert.ok(archHtml.includes('Capa'), 'Debe contener columna Capa');
  assert.ok(archHtml.includes('Tecnología / Herramienta'), 'Debe contener columna Tecnología');
  assert.ok(archHtml.includes('Versión'), 'Debe contener columna Versión');
  assert.ok(archHtml.includes('Propósito en el Sistema'), 'Debe contener columna Propósito');
  assert.ok(archHtml.includes('Estado'), 'Debe contener columna Estado');
  assert.ok(archHtml.includes('Dependencias & Licencia'), 'Debe contener columna Dependencias');
});

test('ATDD Scenario 3: Base de Conocimiento con Estantes Temáticos y Editor Dual ContextForge', () => {
  // GIVEN la base de conocimiento indexada
  const kIndexPath = path.join(DOCS_DIR, 'knowledge', 'knowledge-index.json');
  const knowledgeIndex = JSON.parse(fs.readFileSync(kIndexPath, 'utf8'));

  // WHEN se renderiza la Base de Conocimiento
  const kbHtml = renderKnowledgeBase({ knowledgeIndex, projectSpec: {} });

  // THEN debe contener los 6 estantes temáticos y los controles del editor dual
  assert.ok(kbHtml.includes('kb-view-library'), 'Debe contener el hub de biblioteca');
  assert.ok(kbHtml.includes('kb-view-article'), 'Debe contener el lector de artículos');
  assert.ok(kbHtml.includes('doc-editor-view-container'), 'Debe contener el editor dual');
  assert.ok(kbHtml.includes('Modo Markdown'), 'Debe soportar Modo Markdown');
  assert.ok(kbHtml.includes('Modo Bloques Visuales'), 'Debe soportar Modo Bloques Visuales');
});
