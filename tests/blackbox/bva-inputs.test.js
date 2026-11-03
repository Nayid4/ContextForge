import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Black-Box Testing: Partición de Equivalencia y Análisis de Valores Límite (BVA)', () => {
  // Regla de Branching: {type}/INT-{id}/{name} <= 80 caracteres. Tipos: 'feature' | 'bugfix'
  const BRANCH_REGEX = /^(feature|bugfix)\/INT-\d{3,}\/[a-z0-9_]{1,65}$/;
  const MAX_BRANCH_LENGTH = 80;

  test('BVA & EP: Longitudes límite de rama (79c, 80c, 81c)', () => {
    // 79 caracteres: Válido (Max - 1)
    const branch79 = 'feature/INT-999/' + 'a'.repeat(79 - 'feature/INT-999/'.length);
    assert.equal(branch79.length, 79);
    assert.ok(branch79.length <= MAX_BRANCH_LENGTH);
    assert.match(branch79, BRANCH_REGEX);

    // 80 caracteres: Válido (Límite Exacto Max)
    const branch80 = 'feature/INT-999/' + 'a'.repeat(80 - 'feature/INT-999/'.length);
    assert.equal(branch80.length, 80);
    assert.ok(branch80.length <= MAX_BRANCH_LENGTH);
    assert.match(branch80, BRANCH_REGEX);

    // 81 caracteres: Inválido (Max + 1)
    const branch81 = 'feature/INT-999/' + 'a'.repeat(81 - 'feature/INT-999/'.length);
    assert.equal(branch81.length, 81);
    assert.ok(branch81.length > MAX_BRANCH_LENGTH, '81 caracteres debe violar la restricción');
  });

  test('EP: Clases de equivalencia de tipos de rama permitidos vs prohibidos', () => {
    // Clases válidas
    const validFeature = 'feature/INT-001/valido';
    const validBugfix = 'bugfix/INT-002/correccion';
    assert.match(validFeature, BRANCH_REGEX);
    assert.match(validBugfix, BRANCH_REGEX);

    // Clases inválidas (hotfix, chore, refactor, release)
    const invalidTypes = [
      'hotfix/INT-003/parche_urgente',
      'chore/INT-004/actualizar_deps',
      'refactor/INT-005/limpieza',
      'release/v1.0.0'
    ];

    for (const b of invalidTypes) {
      assert.doesNotMatch(b, BRANCH_REGEX, `El tipo no estándar en "${b}" debe ser rechazado`);
    }
  });

  test('BVA: Límites de cálculo de palabras y tiempo de lectura (0, 1, 200, 201 palabras)', () => {
    const calcTime = (words) => Math.max(1, Math.ceil(words / 200));

    // Valor mínimo inferior
    assert.equal(calcTime(0), 1);
    // Valor mínimo típico
    assert.equal(calcTime(1), 1);
    // Valor límite superior del primer bloque (200w)
    assert.equal(calcTime(200), 1);
    // Límite + 1 (201w debe transicionar a 2 min)
    assert.equal(calcTime(201), 2);
  });
});
