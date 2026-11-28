/**
 * Knowledge Health & Gaps Panel Alpine component (BR-24).
 */
window.knowledgeHealthApp = function knowledgeHealthApp(initialProject) {
  return {
    project: initialProject || 'default',
    loading: true,
    errorMsg: '',
    forbidden: false,
    health: {
      open_gaps_count: 0,
      expired_docs_count: 0,
      expired_docs: [],
      useful_ratio_pct: 100,
      abstention_rate_pct: 0,
      sync_conflicts_count: 0,
      pending_drafts_count: 0,
      feedback_up: 0,
      feedback_down: 0,
    },
    gaps: [],
    gapStatusFilter: 'open',
    selectedIds: [],
    ignoreReason: '',
    assignUserId: '',

    async loadAll() {
      this.loading = true;
      this.errorMsg = '';
      this.forbidden = false;
      try {
        const [hRes, gRes] = await Promise.all([
          fetch(`/api/v1/projects/${encodeURIComponent(this.project)}/knowledge-health`),
          fetch(`/api/v1/projects/${encodeURIComponent(this.project)}/knowledge-gaps?status=${encodeURIComponent(this.gapStatusFilter)}`),
        ]);
        if (hRes.status === 401 || hRes.status === 403) {
          this.forbidden = true;
          return;
        }
        if (!hRes.ok) {
          const err = await hRes.json().catch(() => ({}));
          this.errorMsg = (window.cfRenderProblemError ? window.cfRenderProblemError(err, hRes.status).message : err.detail) || 'No se pudo cargar el tablero de salud documental.';
          return;
        }
        this.health = await hRes.json();
        const gData = gRes.ok ? await gRes.json() : { items: [] };
        this.gaps = gData.items || [];
        this.selectedIds = [];
      } catch {
        this.errorMsg = 'No se pudo cargar el tablero de salud documental.';
      } finally {
        this.loading = false;
      }
    },

    toggleSelect(id) {
      if (this.selectedIds.includes(id)) {
        this.selectedIds = this.selectedIds.filter((x) => x !== id);
      } else {
        this.selectedIds.push(id);
      }
    },

    async assignGap(gapId) {
      const target = prompt('ID de usuario o correo del responsable para este vacío:', this.assignUserId || 'usr-curator');
      if (!target || !target.trim()) return;
      const res = await fetch(`/api/v1/projects/${encodeURIComponent(this.project)}/knowledge-gaps/${encodeURIComponent(gapId)}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: target.trim() }),
      });
      if (res.ok) {
        window.$toast?.success?.('Responsable asignado al vacío.', 'Vacíos');
        this.loadAll();
      } else {
        const d = await res.json().catch(() => ({}));
        const msg = window.cfRenderProblemError ? window.cfRenderProblemError(d, res.status).message : (d.detail || 'No se pudo asignar.');
        window.$toast?.error?.(msg, 'Vacíos');
      }
    },

    async ignoreGap(gapId) {
      const reason = prompt('Motivo para ignorar este vacío (mínimo 3 caracteres):');
      if (!reason || reason.trim().length < 3) return;
      const res = await fetch(`/api/v1/projects/${encodeURIComponent(this.project)}/knowledge-gaps/${encodeURIComponent(gapId)}/ignore`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      if (res.ok) {
        window.$toast?.info?.('Vacío marcado como ignorado.', 'Vacíos');
        this.loadAll();
      } else {
        const d = await res.json().catch(() => ({}));
        const msg = window.cfRenderProblemError ? window.cfRenderProblemError(d, res.status).message : (d.detail || 'No se pudo ignorar.');
        window.$toast?.error?.(msg, 'Vacíos');
      }
    },

    async runBulk(action) {
      if (this.selectedIds.length === 0) return;
      let reason = '';
      let assigned_to = '';
      if (action === 'ignore') {
        reason = prompt('Motivo obligatorio para ignorar los vacíos seleccionados:') || '';
        if (reason.trim().length < 3) return;
      }
      if (action === 'assign') {
        assigned_to = prompt('ID del responsable para asignar los vacíos seleccionados:') || '';
        if (!assigned_to.trim()) return;
      }
      const res = await fetch(`/api/v1/projects/${encodeURIComponent(this.project)}/knowledge-gaps/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, gap_ids: this.selectedIds, reason, assigned_to }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        window.$toast?.success?.(`Acción masiva aplicada a ${d.affected} vacío(s).`, 'Vacíos');
        this.loadAll();
      } else {
        const msg = window.cfRenderProblemError ? window.cfRenderProblemError(d, res.status).message : (d.detail || 'No se pudo ejecutar la acción masiva.');
        window.$toast?.error?.(msg, 'Vacíos');
      }
    },

    async markDocReviewed(docPath) {
      const res = await fetch(`/api/v1/projects/${encodeURIComponent(this.project)}/documents/governance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: docPath, mark_reviewed: true }),
      });
      if (res.ok) {
        window.$toast?.success?.('Documento marcado como revisado hoy.', 'Frescura');
        this.loadAll();
      } else {
        const d = await res.json().catch(() => ({}));
        const msg = window.cfRenderProblemError ? window.cfRenderProblemError(d, res.status).message : (d.detail || 'No se pudo actualizar la fecha de revisión.');
        window.$toast?.error?.(msg, 'Frescura');
      }
    },
  };
};
