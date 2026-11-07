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
   * Actualiza propiedades de una página estilo Plane (is_favorite, is_locked, full_width, restore_version_id).
   * @param {string} pageId
   * @param {Record<string, any>} props
   * @returns {Promise<any>}
   */
  async updatePageProperties(pageId, props = {}) {
    return this.client.updatePlanePage(pageId, props);
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
