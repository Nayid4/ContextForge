/**
 * Core Infrastructure Barrel
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */
export { store, Store, defaultInitialState } from './store.js';
export { router, Router, initRouter } from './router.js';
export { eventBus, EventBus } from './event-bus.js';
export { apiClient, ApiClient } from './api-client.js';
export { api } from './api.js';
export { detectEnvironment } from './detector.js';
export { initDatabase, getDb, isNodeSqliteSupported } from './db.js';
export { syncFilesToSQLite } from './sqlite-sync.js';
