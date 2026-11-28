// ContextForge Unified UI Kit: RFC 7807 Problem Renderer + Standardized Status Chips + Accessibility Helpers (WCAG 2.2 AA)
(function() {
  const ACTION_HINTS = {
    insufficient_role_permissions: 'Solicita el rol necesario al Owner del proyecto o al Administrador.',
    authentication_required: 'Inicia sesión nuevamente en /login o verifica tu cabecera X-API-Key.',
    password_change_required: 'Actualiza tu contraseña inicial en /change-password para continuar.',
    last_owner_protected: 'Asigna otro miembro con rol Owner antes de retirar o degradar al último Owner.',
    invalid_webhook_url: 'Usa una URL pública con https:// que no apunte a direcciones internas o privadas.',
    sovereign_policy_violation: 'Activa un motor con egreso Local (Ollama o Extractivo) para proyectos con Modo Soberano.',
    public_agent_cli_forbidden: 'Selecciona un motor HTTP o Cloud API; los motores CLI no pueden exponerse en agentes públicos.',
    cli_command_not_allowed: 'Usa solo un binario y argumentos permitidos por la lista de seguridad CLI (BR-17).',
    etag_mismatch: 'Recarga el documento para obtener la última versión antes de guardar tus cambios.',
  };

  window.cfRenderProblemError = function(problem, fallback) {
    const p = problem && typeof problem === 'object' ? problem : {};
    const detail = p.detail || (p.error && p.error.message) || fallback || 'Ocurrió un error al procesar la solicitud.';
    const code = p.code || (p.error && p.error.code) || '';
    const hint = ACTION_HINTS[code] || '';
    const traceId = p.trace_id || '';
    return {
      message: detail,
      actionHint: hint,
      requestId: traceId,
      formatted: [detail, hint, traceId ? `ID de solicitud: ${traceId}` : ''].filter(Boolean).join(' · '),
    };
  };

  window.cfCopyText = async function(text, label) {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      window.$toast?.success?.(`${label || 'Texto'} copiado al portapapeles.`, 'Copiado');
      return true;
    } catch {
      window.$toast?.error?.('No se pudo acceder al portapapeles.');
      return false;
    }
  };

  window.cfChipMeta = function(kind, rawValue) {
    const val = String(rawValue || '').toLowerCase();
    const maps = {
      egress: {
        local: { label: 'Egreso Local', icon: 'fa-solid fa-house-lock', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
        cloud: { label: 'Egreso Nube', icon: 'fa-solid fa-cloud-arrow-up', cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
      },
      visibility: {
        public: { label: 'Público', icon: 'fa-solid fa-globe', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
        internal: { label: 'Interno', icon: 'fa-solid fa-building-lock', cls: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' },
        private: { label: 'Privado', icon: 'fa-solid fa-lock', cls: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
      },
      editorial: {
        published: { label: 'Publicado', icon: 'fa-solid fa-circle-check', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
        in_review: { label: 'En revisión', icon: 'fa-solid fa-eye', cls: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30' },
        draft: { label: 'Borrador', icon: 'fa-solid fa-pen', cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
        deprecated: { label: 'Obsoleto', icon: 'fa-solid fa-box-archive', cls: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
      },
      sync: {
        synced: { label: 'Sincronizado', icon: 'fa-solid fa-check', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
        in_conflict: { label: 'En conflicto', icon: 'fa-solid fa-code-merge', cls: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
        deleted_on_disk: { label: 'Eliminado en disco', icon: 'fa-solid fa-triangle-exclamation', cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
      },
    };
    return (maps[kind] && maps[kind][val]) || { label: rawValue || 'Desconocido', icon: 'fa-solid fa-circle-info', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
  };
})();
