/**
 * Projects List & Project Members Management Alpine component (BR-23).
 */
window.projectsListApp = function projectsListApp() {
  return {
    modalOpen: false,
    membersModalOpen: false,
    membersProjectSlug: '',
    membersList: [],
    teamUsers: [],
    membersLoading: false,
    membersError: '',
    membersForbidden: false,
    memberUserId: '',
    memberRole: 'Curator',
    memberSaving: false,
    newName: '',
    newSlug: '',
    slugEdited: false,

    computeSlug(val) {
      return (val || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48);
    },

    async openMembersModal(slug) {
      this.membersProjectSlug = slug;
      this.membersModalOpen = true;
      this.membersLoading = true;
      this.membersError = '';
      this.membersForbidden = false;
      try {
        const [mRes, uRes] = await Promise.all([
          fetch(`/api/v1/projects/${encodeURIComponent(slug)}/members`),
          fetch('/api/v1/auth/users'),
        ]);
        if (mRes.status === 403 || mRes.status === 401) {
          this.membersForbidden = true;
          return;
        }
        const mData = await mRes.json();
        this.membersList = mData.items || [];
        if (uRes.ok) {
          const uData = await uRes.json();
          this.teamUsers = uData.items || [];
          if (!this.memberUserId && this.teamUsers.length > 0) {
            this.memberUserId = this.teamUsers[0].user_id;
          }
        }
      } catch {
        this.membersError = 'No se pudieron cargar los miembros del proyecto.';
      } finally {
        this.membersLoading = false;
      }
    },

    async addOrUpdateMember() {
      if (!this.memberUserId) return;
      this.memberSaving = true;
      this.membersError = '';
      try {
        const res = await fetch(`/api/v1/projects/${encodeURIComponent(this.membersProjectSlug)}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: this.memberUserId, role: this.memberRole }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          this.membersError = (window.cfRenderProblemError ? window.cfRenderProblemError(data, res.status).message : data.detail) || 'No tienes permiso para modificar miembros.';
          return;
        }
        window.$toast?.success?.('Rol de miembro actualizado.', 'Miembros');
        await this.openMembersModal(this.membersProjectSlug);
      } finally {
        this.memberSaving = false;
      }
    },

    async removeMember(userId) {
      this.membersError = '';
      const res = await fetch(`/api/v1/projects/${encodeURIComponent(this.membersProjectSlug)}/members/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        this.membersError = (window.cfRenderProblemError ? window.cfRenderProblemError(data, res.status).message : data.detail) || 'No se pudo quitar el miembro.';
        return;
      }
      window.$toast?.info?.('Miembro retirado del proyecto.', 'Miembros');
      await this.openMembersModal(this.membersProjectSlug);
    },
  };
};
