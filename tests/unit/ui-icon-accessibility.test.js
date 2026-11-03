import test from 'node:test';
import assert from 'node:assert/strict';
import { Icons } from '../../project-docs/src/shared/Icons.js';

test('Icon Component Suite: Todos los iconos exportados deben ser funciones con soporte de interpolación string', () => {
  const iconKeys = Object.keys(Icons);
  assert.ok(iconKeys.length >= 25, 'Debe haber al menos 25 iconos técnicos definidos');

  for (const key of iconKeys) {
    const icon = Icons[key];
    assert.equal(typeof icon, 'function', `Icons.${key} debe ser una función`);
    assert.equal(typeof icon.toString, 'function', `Icons.${key}.toString debe ser una función`);
    
    // Test de interpolación directa como string `${Icons.name}`
    const stringVal = `${icon}`;
    assert.ok(stringVal.startsWith('<svg'), `Icons.${key} interpolado debe empezar con <svg`);
    assert.ok(stringVal.endsWith('</svg>'), `Icons.${key} interpolado debe terminar con </svg>`);
  }
});

test('Icon Accessibility Suite: Todos los iconos deben tener aria-hidden="true" y viewBox estándar', () => {
  for (const [key, icon] of Object.entries(Icons)) {
    const svgStr = icon();
    assert.ok(svgStr.includes('aria-hidden="true"'), `Icons.${key} debe incluir aria-hidden="true" para accesibilidad`);
    assert.ok(svgStr.includes('viewBox="0 0 24 24"'), `Icons.${key} debe tener viewBox="0 0 24 24" estándar`);
    assert.ok(svgStr.includes('fill="none"'), `Icons.${key} debe tener fill="none"`);
    assert.ok(svgStr.includes('stroke="currentColor"'), `Icons.${key} debe heredar color vía currentColor`);
  }
});

test('Icon Parametrization Suite: Permite override de clases CSS personalizado', () => {
  const customClass = 'w-8 h-8 text-indigo-500 animate-pulse';
  const rendered = Icons.zap(customClass);
  assert.ok(rendered.includes(`class="${customClass}"`), 'Debe respetar la clase CSS pasada como argumento');
});
