import test from 'node:test';
import assert from 'node:assert/strict';

import {
  harnessService,
  HarnessService,
  harnessStore,
  HarnessStore,
  AgentCard,
  AgentList,
  SkillSyncStatus,
  HarnessOverview,
  HarnessPage,
  renderHarnessView
} from '../../src/modules/Harness/index.js';

test('HarnessService Suite: getAgents y getAgentById retornan roles canónicos', () => {
  const agents = harnessService.getAgents();
  assert.equal(agents.length, 4);

  const leader = harnessService.getAgentById('leader');
  assert.ok(leader);
  assert.equal(leader.role, 'Agente Principal (Master Leader)');

  const implementer = harnessService.getAgentById('implementer');
  assert.ok(implementer);
  assert.equal(implementer.model, 'inherit');
  assert.equal(implementer.workspace, 'inherit');
});

test('HarnessService Suite: getSkills retorna las 18 skills SDD homologadas', () => {
  const skills = harnessService.getSkills();
  assert.equal(skills.length, 18);
  assert.ok(skills.some(s => s.name === 'acceptance-testing'));
  assert.ok(skills.some(s => s.name === 'project-knowledge'));
  assert.ok(skills.some(s => s.name === 'sync-skills'));
});

test('HarnessStore Suite: Observer reactivo y selección de agente', () => {
  const store = new HarnessStore();
  let count = 0;
  store.subscribe(() => count++);

  store.selectAgent('reviewer');
  assert.equal(store.getState().selectedAgentId, 'reviewer');

  store.setActiveTab('skills');
  assert.equal(store.getState().activeTab, 'skills');

  assert.ok(count >= 2);
});

test('Harness UI Suite: Componentes renderizan sin emojis y con estructura semántica', () => {
  const leader = harnessService.getAgentById('leader');
  const cardHtml = AgentCard({ agent: leader, isSelected: true });
  assert.ok(cardHtml.includes('MASTER LEADER'));
  assert.ok(cardHtml.includes('ask_question'));
  assert.ok(cardHtml.includes('Responsabilidades'));

  const listHtml = AgentList({ agents: [leader], selectedAgentId: 'leader' });
  assert.ok(listHtml.includes('MASTER LEADER'));

  const syncHtml = SkillSyncStatus({ skills: [{ name: 'test-skill', description: 'Pruebas' }] });
  assert.ok(syncHtml.includes('/test-skill'));
  assert.ok(syncHtml.includes('100% HOMOLOGADO'));

  const overviewHtml = HarnessOverview({
    governance: harnessService.getGovernanceOverview()
  });
  assert.ok(overviewHtml.includes('Gobernanza del Arnés SDD Multi-Agente'));
  assert.ok(overviewHtml.includes('Ramas Semánticas'));

  const pageHtml = HarnessPage();
  assert.ok(pageHtml.includes('Orquestación de Agentes & Gobernanza SDD'));
  assert.ok(pageHtml.includes('Equipo de Agentes Especializados'));

  const legacyHtml = renderHarnessView();
  assert.ok(legacyHtml.includes('Orquestación de Agentes & Gobernanza SDD'));
});
