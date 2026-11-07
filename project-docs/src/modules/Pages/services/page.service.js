/**
 * Page Service - Data Access Layer for Knowledge Pages & Markdown Docs
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */
import { apiClient } from '../../../core/api-client.js';

export class PageService {
  constructor(client = apiClient) {
    this.client = client;
  }

  /**
   * Carga la lista completa de páginas de conocimiento.
   * @param {{ bypassCache?: boolean }} [options]
   * @returns {Promise<Array<Record<string, any>>>}
   */
  async getPages(options = {}) {
    const planeData = await this.client.fetchPlaneData(options);
    if (planeData && Array.isArray(planeData.pages) && planeData.pages.length > 0) {
      return planeData.pages;
    }

    // Fallback desde knowledgeIndex
    const allData = await this.client.fetchAll(options);
    if (allData.knowledgeIndex && allData.knowledgeIndex.docs) {
      return Object.entries(allData.knowledgeIndex.docs).map(([key, content], idx) => {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : key;
        const words = content.trim().split(/\s+/).filter(Boolean).length;
        const readingTime = Math.max(1, Math.ceil(words / 200));

        return {
          id: `page-${key.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
          title,
          file_path: key,
          shelf: this.resolveShelf(key),
          word_count: words,
          reading_time_min: readingTime,
          content_markdown: content
        };
      });
    }

    return [];
  }

  /**
   * Obtiene una página por su ID con su contenido Markdown.
   * @param {string} pageId
   * @returns {Promise<Record<string, any>|null>}
   */
  async getPageById(pageId) {
    const pages = await this.getPages();
    return pages.find(p => p.id === pageId) || null;
  }

  /**
   * Guarda o actualiza el contenido Markdown de una página.
   * @param {string} pageId
   * @param {string} markdownContent
   * @returns {Promise<{ ok: boolean }>}
   */
  async savePageMarkdown(pageId, markdownContent) {
    return this.client.updatePlanePage(pageId, markdownContent);
  }

  /**
   * Actualiza propiedades de una página estilo Plane (access, is_favorite, is_locked, archived, duplicate, full_width, restore_version_id).
   * @param {string} pageId
   * @param {Record<string, any>} props
   * @returns {Promise<any>}
   */
  async updatePageProperties(pageId, props = {}) {
    return this.client.updatePlanePage(pageId, props);
  }

  /**
   * Alterna visibilidad de la página entre Public (0) y Private (1) según BR-PAGE-04 de Plane.
   * @param {string} pageId
   * @param {number} access 0 = Public, 1 = Private
   */
  async updateAccess(pageId, access = 0) {
    return this.client.updatePlanePage(pageId, { access: Number(access) === 1 ? 1 : 0 });
  }

  /**
   * Archiva una página (establece archived_at y desmarca is_favorite según BR-PAGE-03 de Plane).
   * @param {string} pageId
   */
  async archivePage(pageId) {
    return this.client.updatePlanePage(pageId, { archived: true });
  }

  /**
   * Restaura una página archivada (archived_at = null).
   * @param {string} pageId
   */
  async restorePage(pageId) {
    return this.client.updatePlanePage(pageId, { archived: false });
  }

  /**
   * Duplica una página (Make a copy) en SQLite y disco (.md) según BR-PAGE-05 de Plane.
   * @param {string} pageId
   */
  async duplicatePage(pageId) {
    return this.client.updatePlanePage(pageId, { duplicate: true });
  }

  /**
   * Devuelve el título normalizado o 'Untitled' si está vacío (Plane getPageName).
   * @param {string} [title]
   * @returns {string}
   */
  getPageName(title = '') {
    return (!title || !String(title).trim()) ? 'Untitled' : String(title).trim();
  }

  /**
   * Evalúa si una página es editable en el editor según Plane base-page.ts (isContentEditable).
   * @param {Record<string, any>} page
   * @returns {boolean}
   */
  isContentEditable(page = {}) {
    return !page.is_locked && !page.archived_at;
  }

  /**
   * Determina el estante canónico a partir de la ruta del archivo.
   * @param {string} filePath
   * @returns {string}
   */
  resolveShelf(filePath = '') {
    const p = filePath.toLowerCase();
    if (p.includes('c4') || p.includes('architecture')) return 'architecture';
    if (p.includes('business-rule') || p.includes('invariants')) return 'business_rules';
    if (p.includes('requirements') || p.includes('user-stor')) return 'requirements';
    if (p.includes('adr') || p.includes('decision')) return 'adrs';
    if (p.includes('standard') || p.includes('service')) return 'standards';
    if (p.includes('module')) return 'modules';
    if (p.includes('spec')) return 'specs';
    return 'standards';
  }

  /**
   * Calcula métricas de lectura de un texto en Markdown.
   * @param {string} markdown
   * @returns {{ words: number, readingTimeMin: number }}
   */
  calculateReadingMetrics(markdown = '') {
    const words = markdown.trim().split(/\s+/).filter(Boolean).length;
    const readingTimeMin = Math.max(1, Math.ceil(words / 200));
    return { words, readingTimeMin };
  }
}

export const pageService = new PageService();
