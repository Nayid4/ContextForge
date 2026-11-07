/**
 * Projects Domain Module Barrel (Public API)
 * 100% Vectorial, sin dependencias externas ni emojis.
 */

// Services & Store
export { projectService, ProjectService } from './services/project.service.js';
export { projectStore, ProjectStore, initialProjectState } from './store/project.store.js';

// Components
export { ProjectHeader } from './components/ProjectHeader.js';
export { ProjectCard } from './components/ProjectCard.js';
export { ProjectSelector } from './components/ProjectSelector.js';

// Master Page
export { ProjectsPage } from './pages/ProjectsPage.js';
