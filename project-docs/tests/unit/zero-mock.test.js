import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.resolve(__dirname, '..', '..');

test('Zero-Mock Gate: project-spec.json no debe contener mocks residuales de e-commerce ni lorem ipsum', () => {
  const specPath = path.join(DOCS_DIR, 'project-spec.json');
  assert.ok(fs.existsSync(specPath), 'project-spec.json debe existir');

  const content = fs.readFileSync(specPath, 'utf-8').toLowerCase();
  assert.ok(!content.includes('lorem ipsum'), 'No debe contener texto dummy "lorem ipsum"');
  assert.ok(!content.includes('e-commerce'), 'No debe contener referencias a e-commerce');
  assert.ok(!content.includes('carrito de compras'), 'No debe contener mocks de carrito de compras');
  assert.ok(!content.includes('pasarela de pagos'), 'No debe contener pasarelas de pago no reales');
});

test('Zero-Mock Gate: knowledge-index.json debe indexar los 5 módulos soberanos del arnés', () => {
  const kIndexPath = path.join(DOCS_DIR, 'knowledge', 'knowledge-index.json');
  assert.ok(fs.existsSync(kIndexPath), 'knowledge-index.json debe existir');

  const data = JSON.parse(fs.readFileSync(kIndexPath, 'utf-8'));
  const modules = data.modules || [];
  assert.ok(modules.length >= 5, 'Debe haber al menos 5 bounded contexts del arnés');

  const moduleIds = modules.map(m => typeof m === 'string' ? m : m.id);
  assert.ok(moduleIds.includes('agent-orchestrator'), 'Debe incluir agent-orchestrator');
  assert.ok(moduleIds.includes('triple-sync-engine'), 'Debe incluir triple-sync-engine');
  assert.ok(moduleIds.includes('knowledge-engine'), 'Debe incluir knowledge-engine');
  assert.ok(moduleIds.includes('dashboard-visualizer'), 'Debe incluir dashboard-visualizer');
  assert.ok(moduleIds.includes('testing-qa-suite'), 'Debe incluir testing-qa-suite');
});
