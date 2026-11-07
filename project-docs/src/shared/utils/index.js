/**
 * Shared Utilities Barrel
 * 100% JavaScript Vanilla puro, sin dependencias externas ni emojis.
 */
export { renderList } from './renderList.js';
export { $, $$, delegate, escapeHtml, html } from './dom.js';
export { formatDate, formatTimeAgo, calculateReadingTime } from './dates.js';
export {
  renderMarkdown,
  extractTableOfContents,
  slugify,
  parseMarkdownToBlocks,
  blocksToMarkdown
} from './markdown.js';
