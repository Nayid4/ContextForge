import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Smoke Test: Archivos y enlaces críticos del tablero interactivo', () => {
  const indexPath = fs.existsSync('index.html') ? path.resolve('index.html') : path.resolve('project-docs/index.html');
  const bundlePath = fs.existsSync('dist/app.bundle.js') ? path.resolve('dist/app.bundle.js') : path.resolve('project-docs/dist/app.bundle.js');
  const fallbackPath = fs.existsSync('data-fallback.js') ? path.resolve('data-fallback.js') : path.resolve('project-docs/data-fallback.js');

  assert.ok(fs.existsSync(indexPath), 'index.html debe existir');
  assert.ok(fs.existsSync(bundlePath), 'dist/app.bundle.js debe existir');
  assert.ok(fs.existsSync(fallbackPath), 'data-fallback.js debe existir');

  const indexContent = fs.readFileSync(indexPath, 'utf8');
  assert.ok(indexContent.includes('tailwindcss'), 'Debe incluir Tailwind CSS v4');
  assert.ok(indexContent.includes('three.js'), 'Debe incluir Three.js');
  assert.ok(indexContent.includes('mermaid'), 'Debe incluir Mermaid.js');
  assert.ok(indexContent.includes('data-fallback.js'), 'Debe cargar fallback para soporte offline');
  assert.ok(indexContent.includes('app.bundle.js'), 'Debe cargar el bundle compilado');
});

test('Smoke Test: Evaluación del bundle y renderizado sin excepciones', () => {
  global.window = global;
  global.window.addEventListener = () => {};
  global.window.removeEventListener = () => {};
  global.window.location = { hash: '', protocol: 'file:' };
  global.document = {
    documentElement: { classList: { contains: () => true, add: () => {}, remove: () => {} } },
    addEventListener: () => {},
    getElementById: (id) => {
      if (id === 'app') return { innerHTML: '' };
      return null;
    },
    querySelectorAll: () => []
  };
  global.localStorage = { getItem: () => 'dark', setItem: () => {} };

  const bundlePath = fs.existsSync('dist/app.bundle.js') ? path.resolve('dist/app.bundle.js') : path.resolve('project-docs/dist/app.bundle.js');
  assert.doesNotThrow(() => {
    // Importa el script empaquetado para asegurar que no contenga referencias nulas
    const code = fs.readFileSync(bundlePath, 'utf8');
    const fn = new Function('window', 'document', 'localStorage', code);
    fn(global.window, global.document, global.localStorage);
  }, 'El bundle de la aplicación no debe lanzar excepciones al evaluarse');
});
