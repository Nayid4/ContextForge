// Reusable Taxonomy Combobox Mixin for Dual Editor (Projects, Modules & Multi-select Tags)
window.cfEditorTaxonomyMixin = function() {
  const boot = window.__CF_BOOT__ || {};
  return {
    availableProjects: boot.projects || [{ slug: 'default', name: 'ContextForge Core' }],
    availableModules: boot.modules || [{ slug: 'architecture', name: 'Arquitectura', icon: 'fa-cubes', color: 'indigo' }],
    availableTags: boot.tags || [],
    moduleOpen: false,
    moduleSearch: '',
    projectOpen: false,
    projectSearch: '',
    tagOpen: false,
    tagSearch: '',

    getModuleName(slug) {
      const hit = this.availableModules.find(m => m.slug === slug);
      return hit ? hit.name : (slug || 'general');
    },
    getProjectName(slug) {
      const hit = this.availableProjects.find(p => p.slug === slug);
      return hit ? hit.name : (slug || 'default');
    },
    filteredModules() {
      const q = (this.moduleSearch || '').trim().toLowerCase();
      return q ? this.availableModules.filter(m => m.slug.includes(q) || m.name.toLowerCase().includes(q)) : this.availableModules;
    },
    filteredProjects() {
      const q = (this.projectSearch || '').trim().toLowerCase();
      return q ? this.availableProjects.filter(p => p.slug.includes(q) || p.name.toLowerCase().includes(q)) : this.availableProjects;
    },
    filteredTags() {
      const q = (this.tagSearch || '').trim().toLowerCase();
      return q ? this.availableTags.filter(t => t.slug.includes(q) || t.name.toLowerCase().includes(q)) : this.availableTags;
    },
    selectModule(slug) { this.doc.module = slug; this.moduleOpen = false; this.moduleSearch = ''; },
    selectProject(slug) { this.doc.library_id = slug; this.projectOpen = false; this.projectSearch = ''; },
    async addCustomModule() {
      const raw = (this.moduleSearch || '').trim();
      if (!raw) return;
      const slug = raw.toLowerCase().replace(/[^a-z0-9_-]+/g, '_');
      if (!this.availableModules.some(m => m.slug === slug)) {
        this.availableModules.push({ slug, name: raw, icon: 'fa-folder', color: 'indigo' });
        fetch(`/api/v1/projects/${encodeURIComponent(this.doc.library_id)}/taxonomy`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: 'module', name: raw, slug }),
        }).catch(() => {});
      }
      this.selectModule(slug);
    },
    toggleTag(slug) {
      const idx = this.doc.tags.indexOf(slug);
      if (idx === -1) this.doc.tags.push(slug);
      else this.doc.tags.splice(idx, 1);
    },
    removeTag(slug) { this.doc.tags = this.doc.tags.filter(t => t !== slug); },
    async addCustomTag() {
      const raw = (this.tagSearch || '').trim().replace(/^#/, '');
      if (!raw) return;
      const slug = raw.toLowerCase().replace(/[^a-z0-9_-]+/g, '_');
      if (!this.availableTags.some(t => t.slug === slug)) {
        this.availableTags.push({ slug, name: raw, color: 'indigo' });
      }
      if (!this.doc.tags.includes(slug)) this.doc.tags.push(slug);
      this.tagSearch = '';
    },
  };
};
