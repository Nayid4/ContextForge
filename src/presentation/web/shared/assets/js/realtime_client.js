// Real-time WebSocket Status Pill Controller
(function() {
  function connectWs() {
    const dot = document.getElementById('cf-ws-status-dot');
    const label = document.getElementById('cf-ws-status-label');
    const peersEl = document.getElementById('cf-ws-peers-count');
    if (!dot || !label) return;
    const match = document.cookie.match(/cf_active_project=([^;]+)/);
    const project = match ? decodeURIComponent(match[1]) : 'default';
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    try {
      const ws = new WebSocket(`${proto}://${window.location.host}/api/v1/ws/collaboration?project=${encodeURIComponent(project)}&user=Equipo`);
      ws.onopen = () => {
        dot.className = 'w-2 h-2 rounded-full bg-emerald-500';
        label.textContent = 'En línea';
      };
      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.event === 'presence.sync' && peersEl) {
            peersEl.textContent = data.count > 1 ? `(${data.count})` : '';
          }
        } catch {}
      };
      ws.onclose = () => {
        dot.className = 'w-2 h-2 rounded-full bg-amber-400';
        label.textContent = 'Local';
      };
      ws.onerror = () => {
        dot.className = 'w-2 h-2 rounded-full bg-slate-400';
        label.textContent = 'Local';
      };
    } catch {
      dot.className = 'w-2 h-2 rounded-full bg-slate-400';
      label.textContent = 'Local';
    }
  }
  document.addEventListener('DOMContentLoaded', connectWs);
})();
