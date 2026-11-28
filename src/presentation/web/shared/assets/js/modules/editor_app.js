// Dual Mode Document Editor (Markdown & Block Builder) Alpine App with Ctrl+S & Dirty Guard
function dualEditorApp() {
  return {
    mode: 'markdown',
    saving: false,
    isDirty: false,
    showAdvancedMeta: false,
    tagsInput: (window.__CF_BOOT__ && window.__CF_BOOT__.tagsInput) || '',
    renderedHtml: '<p class="text-slate-400 dark:text-zinc-500 italic text-sm">Comienza a escribir en Markdown para ver la vista previa en vivo...</p>',
    ...window.cfEditorTaxonomyMixin(),
    ...(window.cfEditorWysiwygMixin ? window.cfEditorWysiwygMixin() : {}),

    doc: {
      doc_path: window.__CF_BOOT__.doc.doc_path,
      title: window.__CF_BOOT__.doc.title,
      library_id: window.__CF_BOOT__.doc.library_id,
      module: window.__CF_BOOT__.doc.module,
      tags: window.__CF_BOOT__.doc.tags,
      description: window.__CF_BOOT__.doc.description,
      rawMarkdown: window.__CF_BOOT__.doc.rawMarkdown,
      blocks: [],
      attachments: []
    },

    markDirty() { this.isDirty = true; },
    wordCount() {
      const txt = (this.doc.rawMarkdown || '').trim();
      return txt ? txt.split(/\s+/).length : 0;
    },
    insertStarterTemplate() {
      this.doc.title = this.doc.title || 'Guía de Arquitectura y Reglas';
      this.doc.rawMarkdown = [
        `# ${this.doc.title}`,
        '',
        '## Contexto',
        'Describe el propósito del módulo o decisión técnica.',
        '',
        '## Reglas clave',
        '- Regla 1: ...',
        '- Regla 2: ...',
        '',
        '## Diagrama',
        '```mermaid',
        'flowchart LR',
        '  Cliente --> API --> BaseConocimiento',
        '```',
        ''
      ].join('\n');
      this.markDirty();
      this.onMarkdownInput();
    },

    async init() {
      const draftFromChat = sessionStorage.getItem('cf_draft_markdown');
      if (draftFromChat && !this.doc.doc_path) {
        this.doc.rawMarkdown = draftFromChat;
        sessionStorage.removeItem('cf_draft_markdown');
        const titleMatch = draftFromChat.match(/^#\s+(.+)$/m) || draftFromChat.match(/title:\s*["']?([^"'\n]+)["']?/);
        if (titleMatch) this.doc.title = titleMatch[1].trim();
        this.isDirty = true;
      }
      if (this.doc.rawMarkdown) {
        this.extractAttachmentsFromMarkdown();
        this.onMarkdownInput();
      }
      if ((this.doc.doc_path || draftFromChat) && this.doc.rawMarkdown) await this.syncMarkdownToBlocks();

      // Keyboard shortcut Ctrl+S / Cmd+S (Nielsen H#7)
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          if (!this.saving) this.saveDocument();
        }
      });

      // Prevent accidental loss of unsaved work (Nielsen H#5)
      window.addEventListener('beforeunload', (e) => {
        if (this.isDirty && !this.saving) {
          e.preventDefault();
          e.returnValue = '';
        }
      });

      window.insertMarkdownIntoEditor = (content) => {
        if (!content) return;
        let clean = content.trim();
        const outerMatch = clean.match(/^```(?:markdown|md)\r?\n([\s\S]*?)\r?\n```$/i);
        if (outerMatch) clean = outerMatch[1].trim();
        this.doc.rawMarkdown = (this.doc.rawMarkdown ? this.doc.rawMarkdown.trimEnd() + '\n\n' : '') + clean + '\n';
        this.markDirty();
        this.onMarkdownInput();
        if (this.mode === 'blocks') this.syncMarkdownToBlocks();
        if (this.mode === 'visual' && this.syncMarkdownToWysiwyg) this.syncMarkdownToWysiwyg();
        window.$toast.success('Contenido insertado en el editor.', 'Listo');
      };
    },
    async switchMode(newMode) {
      if (newMode === this.mode) return;
      // Flush current mode back into canonical rawMarkdown first
      if (this.mode === 'blocks') await this.syncBlocksToMarkdown();
      else if (this.mode === 'visual' && this.syncWysiwygToMarkdown) this.syncWysiwygToMarkdown();

      this.mode = newMode;
      if (newMode === 'blocks') await this.syncMarkdownToBlocks();
      else if (newMode === 'visual' && this.syncMarkdownToWysiwyg) this.$nextTick(() => this.syncMarkdownToWysiwyg());
      else if (newMode === 'markdown') await this.onMarkdownInput();
      this.$nextTick(() => { if (window.renderMermaidDiagrams) window.renderMermaidDiagrams(); });
    },
    addBlock(type) {
      this.markDirty();
      if (type === 'heading') this.doc.blocks.push({ type: 'heading', level: 2, text: '' });
      if (type === 'paragraph') this.doc.blocks.push({ type: 'paragraph', text: '' });
      if (type === 'code') this.doc.blocks.push({ type: 'code', language: 'python', code: '' });
      if (type === 'mermaid') this.doc.blocks.push({ type: 'mermaid', code: 'sequenceDiagram\n  A->>B: Petición\n  B-->>A: Respuesta 200' });
    },
    removeBlock(index) { this.markDirty(); this.doc.blocks.splice(index, 1); },
    moveBlockUp(index) {
      if (index <= 0) return;
      this.markDirty();
      this.doc.blocks.splice(index - 1, 0, this.doc.blocks.splice(index, 1)[0]);
    },
    moveBlockDown(index) {
      if (index >= this.doc.blocks.length - 1) return;
      this.markDirty();
      this.doc.blocks.splice(index + 1, 0, this.doc.blocks.splice(index, 1)[0]);
    },
    extractAttachmentsFromMarkdown() {
      const md = this.doc.rawMarkdown || '';
      const found = [];
      const seen = new Set();
      const re = /(!)?\[([^\]]+)\]\(([^)]*(?:\/api\/v1\/assets\/|attachments\/)[^)]*)\)/g;
      let m;
      while ((m = re.exec(md)) !== null) {
        const isImg = Boolean(m[1]);
        const name = m[2].trim();
        const fpath = m[3].trim();
        if (!seen.has(fpath)) {
          seen.add(fpath);
          found.push({ file_name: name, file_path: fpath, mime_type: isImg ? 'image/png' : '', is_image: isImg });
        }
      }
      this.doc.attachments = found;
    },
    removeAttachmentItem(index) {
      this.doc.attachments.splice(index, 1);
    },
    async uploadAttachmentFile(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('library_id', this.doc.library_id || 'default');
      formData.append('book_id', (this.doc.title || 'doc').toLowerCase().replace(/[^a-z0-9_-]+/g, '_'));
      try {
        const res = await fetch('/api/v1/books/upload-attachment', { method: 'POST', body: formData });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Error al subir anexo');
        }
        const data = await res.json();
        const assetUrl = `/api/v1/assets/${encodeURIComponent(this.doc.library_id || 'default')}/${data.file_path}`;
        const attItem = {
          type: 'attachment',
          file_name: data.file_name,
          file_path: assetUrl,
          mime_type: data.mime_type,
          is_image: data.is_image,
        };
        this.doc.attachments.push(attItem);
        this.doc.blocks.push(attItem);
        const snippet = data.is_image
          ? `\n\n![${data.file_name}](${assetUrl})\n`
          : `\n\n> **Anexo:** [${data.file_name}](${assetUrl})\n`;
        if (this.mode === 'visual' && this.syncWysiwygToMarkdown) {
          this.syncWysiwygToMarkdown();
        }
        this.doc.rawMarkdown = (this.doc.rawMarkdown || '').trimEnd() + snippet;
        this.markDirty();
        await this.onMarkdownInput();
        if (this.mode === 'visual' && this.syncMarkdownToWysiwyg) {
          this.syncMarkdownToWysiwyg();
        }
        window.$toast?.success?.(`Archivo "${data.file_name}" adjuntado.`, 'Adjunto listo');
      } catch (err) {
        window.$toast?.error?.('No se pudo subir el archivo: ' + err.message);
      } finally {
        event.target.value = '';
      }
    },
    openPreviewForBlock(block) {
      const url = window.normalizeCfAssetUrl
        ? window.normalizeCfAssetUrl(block.file_path, this.doc.library_id)
        : (block.file_path.startsWith('/api/v1/assets/') ? block.file_path : `/api/v1/assets/${this.doc.library_id}/${block.file_path}`);
      window.openFilePreview(block.file_name, url, block.mime_type || '');
    },
    openScopedChatForDoc() {
      const bookSlug = (this.doc.title || 'doc').toLowerCase().replace(/[^a-z0-9_-]+/g, '_');
      window.openScopedChat(this.doc.title || 'Nuevo documento', this.doc.library_id, bookSlug, this.doc.rawMarkdown);
    },
    async onMarkdownInput() {
      if (!this.doc.rawMarkdown || !this.doc.rawMarkdown.trim()) {
        this.renderedHtml = '<p class="text-slate-400 dark:text-zinc-500 italic text-sm">Comienza a escribir en Markdown para ver la vista previa en vivo...</p>';
        return;
      }
      try {
        const formData = new FormData();
        formData.append('content_markdown', this.doc.rawMarkdown);
        const res = await fetch('/docs/preview-htmx', { method: 'POST', body: formData });
        if (res.ok) {
          this.renderedHtml = await res.text();
          this.$nextTick(() => {
            const box = document.getElementById('markdown-preview-box');
            if (box && window.enhanceRenderedMarkdown) window.enhanceRenderedMarkdown(box);
            if (box && window.enhanceDocumentAttachments) window.enhanceDocumentAttachments(box);
          });
        }
      } catch (err) { console.warn('Preview error:', err); }
    },
    async syncMarkdownToBlocks() {
      try {
        const res = await fetch('/api/v1/books/parse-markdown', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw_markdown: this.doc.rawMarkdown || '' })
        });
        if (res.ok) {
          const data = await res.json();
          this.doc.blocks = Array.isArray(data.blocks) ? data.blocks : [];
          if (data.metadata) {
            if (data.metadata.title) this.doc.title = data.metadata.title;
            if (data.metadata.module) this.doc.module = data.metadata.module;
            if (data.metadata.tags) {
              this.doc.tags = Array.isArray(data.metadata.tags) ? data.metadata.tags : [data.metadata.tags];
              this.tagsInput = this.doc.tags.join(', ');
            }
          }
        }
      } catch (err) { console.warn('Sync to blocks error:', err); }
    },
    async syncBlocksToMarkdown() {
      try {
        const res = await fetch('/api/v1/books/compile-blocks', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: this.doc.title, module: this.doc.module, library_id: this.doc.library_id,
            tags: this.doc.tags, description: this.doc.description, blocks: this.doc.blocks
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.raw_markdown) { this.doc.rawMarkdown = data.raw_markdown; this.onMarkdownInput(); }
        }
      } catch (err) { console.warn('Sync to markdown error:', err); }
    },
    async saveDocument() {
      if (!this.doc.title || !this.doc.title.trim()) {
        window.$toast.warning('Ingresa un título para el documento antes de guardar.', 'Título requerido');
        return;
      }
      this.saving = true;
      try {
        if (this.mode === 'blocks') await this.syncBlocksToMarkdown();
        else if (this.mode === 'visual' && this.syncWysiwygToMarkdown) this.syncWysiwygToMarkdown();
        const res = await fetch('/api/v1/books/save', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: this.doc.title.trim(), module: this.doc.module, library_id: this.doc.library_id,
            tags: this.doc.tags, description: this.doc.description, raw_markdown: this.doc.rawMarkdown,
            blocks: this.doc.blocks, doc_path: this.doc.doc_path || null
          })
        });
        if (!res.ok) throw new Error('Error al guardar documento');
        const data = await res.json();
        this.isDirty = false;
        window.$toast.success(`Documento guardado en ${data.path}`, 'Guardado');
        setTimeout(() => { window.location.href = `/docs/view/${data.path}`; }, 450);
      } catch (err) {
        window.$toast.error('No se pudo guardar: ' + err.message, 'Error');
      } finally { this.saving = false; }
    }
  };
}
