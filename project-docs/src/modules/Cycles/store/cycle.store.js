/**
 * Cycle Store - Reactive State Management for Cycles & Sprints
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */

export const initialCycleState = {
  cycles: [],
  selectedCycleId: null,
  filterStatus: 'all' // 'all' | 'active' | 'completed' | 'draft'
};

export class CycleStore {
  constructor(initialState = initialCycleState) {
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
        console.error('Error en CycleStore listener:', err);
      }
    }
  }

  setCycles(cycles) {
    this.setState({ cycles });
  }

  selectCycle(cycleId) {
    this.setState({ selectedCycleId: cycleId });
  }

  setFilterStatus(filterStatus) {
    this.setState({ filterStatus });
  }

  getFilteredCycles() {
    const { cycles, filterStatus } = this.state;
    if (filterStatus === 'all') return cycles;
    return cycles.filter(c => c.status === filterStatus);
  }

  reset() {
    this.state = { ...initialCycleState };
    this.notify();
  }
}

export const cycleStore = new CycleStore();
