import test from 'node:test';
import assert from 'node:assert/strict';

test('Convención de ramas {feature|bugfix}/INT-{numero}/{nombre} (≤ 80 caracteres)', () => {
  const branchPattern = /^(feature|bugfix)\/INT-\d{3,4}\/[a-z0-9_]+$/;

  const validBranches = [
    'feature/INT-001/refactor_harness_architecture',
    'bugfix/INT-002/fix_jwt_expiration',
    'feature/INT-015/add_oauth2_sso',
    'bugfix/INT-999/patch_cors_issue'
  ];

  for (const branch of validBranches) {
    assert.ok(branchPattern.test(branch), `Rama válida debe coincidir con el patrón: ${branch}`);
    assert.ok(branch.length <= 80, `Rama no debe superar 80 caracteres: ${branch} (${branch.length}c)`);
  }

  const invalidBranches = [
    'hotfix/INT-001/invalid_type', // hotfix no permitido, solo feature o bugfix
    'feature/001/missing_int_prefix', // falta INT-
    'feature/INT-001/UpperCaseNotAllowed', // mayúsculas no permitidas
    'feature/INT-001/' + 'a'.repeat(70) // excede 80 caracteres
  ];

  for (const branch of invalidBranches) {
    const isValid = branchPattern.test(branch) && branch.length <= 80;
    assert.equal(isValid, false, `Rama inválida debe ser rechazada: ${branch}`);
  }
});

test('Formato de commits semánticos', () => {
  const commitPattern = /^(feat|fix|docs|refactor|test|chore)(\([a-z0-9_-]+\))?:\s[a-z0-9\s.,_-]+$/i;

  assert.ok(commitPattern.test('feat(docs): implement editorial library hub'));
  assert.ok(commitPattern.test('fix(auth): correct token epoch calculation'));
  assert.ok(commitPattern.test('refactor(harness): decouple stack agents'));
  assert.ok(commitPattern.test('test(unit): add markdown parser assertions'));

  assert.equal(commitPattern.test('cambios varios en el proyecto'), false);
  assert.equal(commitPattern.test('WIP: no semantic format'), false);
});
