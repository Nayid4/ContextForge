/**
 * Harness Store - Reactive State Management for Multi-Agent Governance
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */
import { CANONICAL_AGENTS, CANONICAL_SKILLS } from '../services/harness.service.js';

export const initialHarnessState = {
  agents: [...CANONICAL_AGENTS],
  skills: [...CANONICAL_SKILLS],
  selectedAgentId: 'leader',
  activeTab: 'agents' // 'agents' | 'skills' | 'rules'
};

export class HarnessStore {
  constructor(initialState = initialHarnessState) {
    this.state = { ...initialState };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(updater) {
    const next = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...next };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error en HarnessStore listener:', err);
      }
    }
  }

  selectAgent(agentId) {
    this.setState({ selectedAgentId: agentId });
  }

  setActiveTab(activeTab) {
    this.setState({ activeTab });
  }

  reset() {
    this.state = { ...initialHarnessState };
    this.notify();
  }
}

export const harnessStore = new HarnessStore();
