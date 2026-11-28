// Reusable Searchable Combobox for AlpineJS (Zero inline JSON quoting issues; HTMX-safe)
window.cfComboboxApp = function() {
  return {
    open: false,
    search: '',
    selected: '',
    mode: 'form',
    urlTemplate: '',
    options: [],

    init() {
      const cfgScript = this.$el.querySelector('script[data-cf-combo-config]');
      if (cfgScript) {
        try {
          const cfg = JSON.parse(cfgScript.textContent || '{}');
          this.selected = String(cfg.selected ?? '');
          this.mode = cfg.mode || 'form';
          this.urlTemplate = cfg.urlTemplate || '';
          this.options = Array.isArray(cfg.options) ? cfg.options : [];
        } catch (err) {
          console.warn('cfComboboxApp config parse error:', err);
        }
      }
    },

    get activeLabel() {
      const found = this.options.find((o) => String(o.value) === String(this.selected));
      return found ? found.label : (this.selected || 'Seleccionar...');
    },

    get filteredOptions() {
      const q = (this.search || '').trim().toLowerCase();
      if (!q) return this.options;
      return this.options.filter(
        (o) =>
          String(o.label || '').toLowerCase().includes(q) ||
          String(o.value || '').toLowerCase().includes(q)
      );
    },

    toggle() {
      this.open = !this.open;
      if (this.open) {
        this.$nextTick(() => {
          if (this.$refs.comboSearch) this.$refs.comboSearch.focus();
        });
      }
    },

    pick(value) {
      this.selected = String(value);
      this.open = false;
      this.search = '';

      if (this.mode === 'form' && this.$refs.comboForm && this.$refs.valueInput) {
        this.$refs.valueInput.value = this.selected;
        this.$refs.comboForm.submit();
        return;
      }

      if (this.mode === 'navigate' && this.urlTemplate) {
        let target = this.urlTemplate.replace('{value}', encodeURIComponent(this.selected));
        if (target.includes('{search}')) {
          const sVal = document.getElementById('search-input')?.value || '';
          target = target.replace('{search}', encodeURIComponent(sVal));
        }
        if (target.includes('{per_page}')) {
          const ppVal = document.getElementById('per-page-input')?.value || '9';
          target = target.replace('{per_page}', encodeURIComponent(ppVal));
        }
        window.location.href = target;
      }
    },
  };
};
