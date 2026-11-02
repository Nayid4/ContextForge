(() => {
  // project-docs/src/core/store.js
  var getInitialTheme = () => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("harness_theme");
      if (saved) return saved;
    }
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "dark";
  };
  var initialState = {
    project: "Proyecto",
    features: [],
    currentSpec: {},
    history: { records: [] },
    historyData: { records: [] },
    projectSpec: null,
    activeTab: "features",
    // 'features' | 'architecture' | 'graph' | 'tree' | 'three' | 'history'
    theme: getInitialTheme(),
    filters: {
      search: "",
      status: "",
      module: "",
      priority: "",
      type: ""
      // 'feature' | 'bugfix'
    },
    pagination: {
      page: 1,
      currentPage: 1,
      perPage: 10,
      pageSize: 10,
      totalPages: 1
    },
    selectedFeature: null,
    theme3D: "dark",
    error: null,
    loading: true
  };
  var Store = class {
    constructor(state = initialState) {
      this.state = { ...state };
      this.listeners = /* @__PURE__ */ new Set();
      this.syncThemeDom();
    }
    getState() {
      return this.state;
    }
    setState(updater) {
      const nextPartial = typeof updater === "function" ? updater(this.state) : updater;
      this.state = { ...this.state, ...nextPartial };
      this.notify();
    }
    subscribe(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
    notify() {
      for (const listener of this.listeners) {
        listener(this.state);
      }
    }
    // --- Theme Management ---
    syncThemeDom() {
      if (typeof document !== "undefined") {
        if (this.state.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }
    toggleTheme() {
      const nextTheme = this.state.theme === "dark" ? "light" : "dark";
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("harness_theme", nextTheme);
      }
      this.setState({ theme: nextTheme });
      this.syncThemeDom();
    }
    // --- Mutators ---
    setLoading(loading) {
      this.setState({ loading });
    }
    setData({ project, features, currentSpec, historyData, projectSpec }) {
      const featList = Array.isArray(features) ? features : [];
      const pageSize = this.state.pagination.pageSize || 10;
      const totalPages = Math.ceil(featList.length / pageSize) || 1;
      this.setState({
        project: project || this.state.project,
        features: featList,
        currentSpec: currentSpec || {},
        history: historyData || { records: [] },
        historyData: historyData || { records: [] },
        projectSpec: projectSpec || this.state.projectSpec || null,
        pagination: {
          ...this.state.pagination,
          totalPages
        },
        loading: false,
        error: null
      });
    }
    setError(error) {
      this.setState({ error, loading: false });
    }
    setSelectedFeature(selectedFeature) {
      this.setState({ selectedFeature });
    }
    setPage(page) {
      this.setState({
        pagination: { ...this.state.pagination, page, currentPage: page }
      });
    }
    setPageSize(pageSize) {
      const totalPages = Math.ceil(this.state.features.length / pageSize) || 1;
      this.setState({
        pagination: {
          ...this.state.pagination,
          perPage: pageSize,
          pageSize,
          page: 1,
          currentPage: 1,
          totalPages
        }
      });
    }
    setFilter(key, value) {
      this.setState({
        filters: { ...this.state.filters, [key]: value },
        pagination: { ...this.state.pagination, page: 1, currentPage: 1 }
      });
    }
    resetFilters() {
      this.setState({
        filters: { search: "", status: "", module: "", priority: "", type: "" },
        pagination: { ...this.state.pagination, page: 1, currentPage: 1 }
      });
    }
    // --- Selectors ---
    getAvailableModules() {
      const modules = /* @__PURE__ */ new Set();
      this.state.features.forEach((f) => {
        if (f.module) modules.add(f.module);
      });
      return Array.from(modules);
    }
    isReady(feature) {
      if (feature.status === "done" || feature.status === "in_progress") return false;
      const deps = feature.depends_on || feature.dependencies || [];
      if (!deps.length) return true;
      return deps.every((depId) => {
        const dep = this.state.features.find((f) => f.id === depId);
        return dep && dep.status === "done";
      });
    }
    getBlockedBy(feature) {
      const deps = feature.depends_on || feature.dependencies || [];
      if (!deps.length) return [];
      return deps.map((depId) => this.state.features.find((f) => f.id === depId)).filter((dep) => dep && dep.status !== "done");
    }
    getDepChain(feature, visited = /* @__PURE__ */ new Set()) {
      if (visited.has(feature.id)) return [];
      visited.add(feature.id);
      const chain = [feature];
      const deps = feature.depends_on || feature.dependencies || [];
      deps.forEach((depId) => {
        const dep = this.state.features.find((f) => f.id === depId);
        if (dep) {
          const subChain = this.getDepChain(dep, visited);
          chain.push(...subChain);
        }
      });
      return chain;
    }
    getFilteredFeatures() {
      const { features, filters } = this.state;
      return features.filter((f) => {
        const q = filters.search.trim().toLowerCase();
        if (q) {
          const matchTitle = (f.title || "").toLowerCase().includes(q);
          const matchName = (f.name || "").toLowerCase().includes(q);
          const matchDesc = (f.description || "").toLowerCase().includes(q);
          const matchBranch = (f.branch || "").toLowerCase().includes(q);
          const matchId = String(f.id).includes(q);
          if (!matchTitle && !matchName && !matchDesc && !matchBranch && !matchId) {
            return false;
          }
        }
        if (filters.status && f.status !== filters.status) return false;
        if (filters.module && f.module !== filters.module) return false;
        if (filters.priority && f.priority !== filters.priority) return false;
        if (filters.type && (f.type || "feature") !== filters.type) return false;
        return true;
      });
    }
    getPaginatedFeatures() {
      const filtered = this.getFilteredFeatures();
      const { page, perPage } = this.state.pagination;
      const start = (page - 1) * perPage;
      return {
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / perPage) || 1,
        currentPage: page,
        items: filtered.slice(start, start + perPage)
      };
    }
    getStats() {
      const { features } = this.state;
      const total = features.length;
      const pending = features.filter((f) => f.status === "pending").length;
      const inProgress = features.filter((f) => f.status === "in_progress").length;
      const specReady = features.filter((f) => f.status === "spec_ready").length;
      const done = features.filter((f) => f.status === "done").length;
      const blocked = features.filter((f) => f.status === "blocked").length;
      const featuresCount = features.filter((f) => !f.type || f.type === "feature").length;
      const bugfixesCount = features.filter((f) => f.type === "bugfix").length;
      const percentage = total > 0 ? Math.round(done / total * 100) : 0;
      return {
        total,
        pending,
        inProgress,
        specReady,
        done,
        blocked,
        featuresCount,
        bugfixesCount,
        percentage
      };
    }
  };
  var store = new Store();

  // project-docs/src/core/api.js
  async function fetchProjectData(options = {}) {
    const { bypassCache = false } = options;
    let featureData = null;
    let currentSpec = {};
    let historyData = { records: [] };
    let projectSpec = null;
    const cacheBuster = bypassCache ? `?_t=${Date.now()}` : "";
    const fetchOpts = bypassCache ? { cache: "no-store" } : {};
    const featurePaths = [
      `feature_list.json${cacheBuster}`,
      `../feature_list.json${cacheBuster}`,
      `./project-docs/feature_list.json${cacheBuster}`
    ];
    const currentPaths = [
      `progres/current.json${cacheBuster}`,
      `progress/current.json${cacheBuster}`,
      `../progress/current.json${cacheBuster}`,
      `../project-docs/progres/current.json${cacheBuster}`
    ];
    const historyPaths = [
      `progres/history.json${cacheBuster}`,
      `progress/history.json${cacheBuster}`,
      `../progress/history.json${cacheBuster}`,
      `../project-docs/progres/history.json${cacheBuster}`
    ];
    const specPaths = [
      `project-spec.json${cacheBuster}`,
      `../project-spec.json${cacheBuster}`,
      `./project-docs/project-spec.json${cacheBuster}`
    ];
    for (const path of featurePaths) {
      try {
        const res = await fetch(path, fetchOpts);
        if (res.ok) {
          featureData = await res.json();
          break;
        }
      } catch (_) {
      }
    }
    for (const path of currentPaths) {
      try {
        const res = await fetch(path, fetchOpts);
        if (res.ok) {
          currentSpec = await res.json();
          break;
        }
      } catch (_) {
      }
    }
    for (const path of historyPaths) {
      try {
        const res = await fetch(path, fetchOpts);
        if (res.ok) {
          historyData = await res.json();
          break;
        }
      } catch (_) {
      }
    }
    for (const path of specPaths) {
      try {
        const res = await fetch(path, fetchOpts);
        if (res.ok) {
          projectSpec = await res.json();
          break;
        }
      } catch (_) {
      }
    }
    if (!featureData && typeof window !== "undefined" && window.__FALLBACK_DATA__) {
      featureData = window.__FALLBACK_DATA__.featureList || null;
      currentSpec = window.__FALLBACK_DATA__.currentSpec || {};
      historyData = window.__FALLBACK_DATA__.historyData || { records: [] };
      projectSpec = window.__FALLBACK_DATA__.projectSpec || null;
    }
    if (!projectSpec && typeof window !== "undefined" && window.__FALLBACK_DATA__?.projectSpec) {
      projectSpec = window.__FALLBACK_DATA__.projectSpec;
    }
    if (!featureData) {
      featureData = {
        project: "Proyecto (Modo Local)",
        features: []
      };
    }
    return {
      project: featureData.project || "Proyecto",
      features: Array.isArray(featureData.features) ? featureData.features : [],
      currentSpec,
      historyData,
      projectSpec,
      protocol: typeof window !== "undefined" ? window.location.protocol : "http:"
    };
  }
  function startAutoSync({ onUpdate, intervalMs = 2500 } = {}) {
    let isRunning = true;
    let lastFingerprint = "";
    const checkUpdates = async () => {
      if (!isRunning) return;
      try {
        const data = await fetchProjectData({ bypassCache: true });
        const fingerprint = JSON.stringify({
          project: data.project,
          featuresCount: data.features.length,
          features: data.features.map((f) => ({
            id: f.id,
            status: f.status,
            priority: f.priority,
            weight: f.weight,
            branch: f.branch,
            depends_on: f.depends_on || f.dependencies || []
          })),
          currentSpec: {
            id: data.currentSpec?.id,
            name: data.currentSpec?.name,
            status: data.currentSpec?.status,
            taskCount: (data.currentSpec?.tasks || []).length,
            tasksDone: (data.currentSpec?.tasks || []).filter((t) => t.done || t.status === "done").length
          },
          historyCount: (data.historyData?.records || []).length
        });
        if (!lastFingerprint) {
          lastFingerprint = fingerprint;
        } else if (fingerprint !== lastFingerprint) {
          lastFingerprint = fingerprint;
          if (typeof onUpdate === "function") {
            onUpdate(data);
          }
        }
      } catch (_) {
      }
    };
    const timerId = setInterval(checkUpdates, intervalMs);
    return {
      stop: () => {
        isRunning = false;
        clearInterval(timerId);
      }
    };
  }
  var api = {
    fetchAll: fetchProjectData,
    startAutoSync
  };

  // project-docs/src/core/router.js
  var router = {
    init(callback) {
      const handleHash = () => {
        const hash = window.location.hash.replace("#", "").trim() || "features";
        if (callback) callback(hash);
      };
      window.addEventListener("hashchange", handleHash);
      handleHash();
    },
    navigate(tabId) {
      window.location.hash = tabId;
    }
  };

  // project-docs/src/core/detector.js
  async function detectEnvironment(projectData = {}) {
    const agents = [];
    const agentChecks = [
      {
        id: "antigravity",
        name: "Google Antigravity",
        badge: "Antigravity 2.0",
        icon: "\u26A1",
        color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
        paths: [".agents/rules/antigravity-harness.md", "ANTIGRAVITY.md", ".agents/agents/leader.md"]
      },
      {
        id: "opencode",
        name: "Open Code",
        badge: "OpenCode SDD",
        icon: "\u{1F537}",
        color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
        paths: ["opencode.json", ".opencode/rules/commits.md"]
      },
      {
        id: "copilot",
        name: "GitHub Copilot",
        badge: "Copilot Chat",
        icon: "\u{1F419}",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
        paths: [".github/instructions/commits.instructions.md", ".github/copilot-instructions.md", ".github/skills/"]
      },
      {
        id: "claude",
        name: "Claude Code",
        badge: "Claude SDD",
        icon: "\u{1F9E0}",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        paths: ["CLAUDE.md", ".claude/", ".claude.json"]
      },
      {
        id: "codex",
        name: "Codex / OpenAI",
        badge: "Codex Engine",
        icon: "\u{1F916}",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        paths: [".codex/", ".openai/"]
      }
    ];
    for (const check of agentChecks) {
      let detected = false;
      for (const p of check.paths) {
        try {
          const res = await fetch(p, { method: "HEAD" });
          if (res.ok) {
            detected = true;
            break;
          }
        } catch (_) {
        }
      }
      if (!detected && typeof window !== "undefined") {
        if (check.id === "antigravity" || check.id === "opencode" || check.id === "copilot") {
          detected = true;
        }
      }
      if (detected) {
        agents.push(check);
      }
    }
    let activeAgent = agents[0] || {
      id: "antigravity",
      name: "Google Antigravity",
      badge: "Antigravity 2.0",
      icon: "\u26A1",
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
    };
    const currentExecutor = projectData?.currentSpec?.responsable || projectData?.currentSpec?.executor || "";
    if (currentExecutor.toLowerCase().includes("claude")) {
      activeAgent = agents.find((a) => a.id === "claude") || activeAgent;
    } else if (currentExecutor.toLowerCase().includes("copilot")) {
      activeAgent = agents.find((a) => a.id === "copilot") || activeAgent;
    } else if (currentExecutor.toLowerCase().includes("opencode")) {
      activeAgent = agents.find((a) => a.id === "opencode") || activeAgent;
    }
    let stack = {
      name: projectData?.tech_stack || projectData?.metadata?.stack || "Multi-Stack Agnostico",
      runtime: projectData?.runtime || "Universal",
      isAgnostic: true
    };
    if (projectData?.projectSpec) {
      const spec = projectData.projectSpec;
      const runtimeNames = (spec.tech_stack?.runtimes || []).map((r) => r.name).join(" \xB7 ");
      stack = {
        name: runtimeNames || spec.project?.type || "Node.js & .NET",
        runtime: spec.project?.type || "Clean Architecture",
        isAgnostic: false
      };
    }
    try {
      const yamlRes = await fetch("project-spec.yaml");
      if (yamlRes.ok) {
        const text = await yamlRes.text();
        const runtimeMatch = text.match(/runtime:\s*([^\r\n]+)/);
        const frameworkMatch = text.match(/framework:\s*([^\r\n]+)/);
        if (runtimeMatch || frameworkMatch) {
          stack = {
            name: [frameworkMatch?.[1], runtimeMatch?.[1]].filter(Boolean).join(" \xB7 "),
            runtime: runtimeMatch?.[1] || "Detectado por technical-audit",
            isAgnostic: false
          };
        }
      }
    } catch (_) {
    }
    return {
      agents,
      activeAgent,
      stack
    };
  }

  // project-docs/src/shared/Icons.js
  function createIcon(svgInner, defaultCls = "w-4 h-4") {
    const fn = (cls = defaultCls) => `
    <svg class="${cls}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${svgInner}
    </svg>`.trim();
    fn.toString = () => fn(defaultCls);
    return fn;
  }
  var Icons = {
    check: createIcon('<path d="M5 13l4 4L19 7"/>'),
    checkCircle: createIcon('<circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>'),
    clock: createIcon('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
    spinner: createIcon(`
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  `, "w-4 h-4 animate-spin"),
    alert: createIcon('<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>'),
    search: createIcon('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>'),
    branch: createIcon('<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>'),
    gitBranch: createIcon('<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>'),
    folder: createIcon('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'),
    cube: createIcon('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'),
    eye: createIcon('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
    gitTree: createIcon('<path d="M4 6h16M4 12h16M4 18h7"/>'),
    chevronLeft: createIcon('<polyline points="15 18 9 12 15 6"/>'),
    chevronRight: createIcon('<polyline points="9 18 15 12 9 6"/>'),
    refresh: createIcon('<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>'),
    close: createIcon('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
    layers: createIcon('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'),
    database: createIcon('<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>'),
    server: createIcon('<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>'),
    cpu: createIcon('<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>'),
    code: createIcon('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
    book: createIcon('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
    sun: createIcon('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'),
    moon: createIcon('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>')
  };

  // project-docs/src/shared/Button.js
  function renderTabButton({ id, label, icon = "", active = false, badge = null }) {
    const baseClasses = "inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer select-none";
    const activeClasses = active ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-800";
    const badgeHtml = badge !== null ? `<span class="ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded-full font-bold ${active ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}">${badge}</span>` : "";
    return `
    <button type="button" data-tab="${id}" class="${baseClasses} ${activeClasses}">
      <span class="shrink-0 flex items-center justify-center">${icon}</span>
      <span>${label}</span>
      ${badgeHtml}
    </button>
  `;
  }

  // project-docs/src/shared/Badge.js
  var STATUS_CONFIG = {
    pending: {
      label: "Pendiente",
      classes: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
    },
    spec_ready: {
      label: "Spec Listo",
      classes: "bg-amber-50 text-amber-800 ring-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800"
    },
    in_progress: {
      label: "En Progreso",
      classes: "bg-blue-50 text-blue-700 ring-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-800"
    },
    done: {
      label: "Completado",
      classes: "bg-emerald-50 text-emerald-700 ring-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800"
    },
    blocked: {
      label: "Bloqueado",
      classes: "bg-rose-50 text-rose-700 ring-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800"
    }
  };
  var PRIORITY_CONFIG = {
    alta: {
      label: "Alta",
      classes: "bg-rose-50 text-rose-700 ring-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800"
    },
    media: {
      label: "Media",
      classes: "bg-amber-50 text-amber-700 ring-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800"
    },
    baja: {
      label: "Baja",
      classes: "bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
    }
  };
  var MODULE_CONFIG = {
    backend: {
      label: "Backend",
      classes: "bg-indigo-50 text-indigo-700 ring-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-800"
    },
    frontend: {
      label: "Frontend",
      classes: "bg-purple-50 text-purple-700 ring-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:ring-purple-800"
    },
    infra: {
      label: "Infra",
      classes: "bg-sky-50 text-sky-700 ring-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800"
    },
    domain: {
      label: "Domain",
      classes: "bg-emerald-50 text-emerald-700 ring-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800"
    },
    application: {
      label: "Application",
      classes: "bg-blue-50 text-blue-700 ring-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-800"
    }
  };
  var TYPE_CONFIG = {
    feature: {
      label: "feature",
      classes: "bg-cyan-50 text-cyan-800 ring-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:ring-cyan-800 font-mono"
    },
    bugfix: {
      label: "bugfix",
      classes: "bg-rose-50 text-rose-800 ring-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800 font-mono"
    }
  };
  function Badge({ type, value, extraClasses = "" }) {
    let label = value;
    let classes = "bg-slate-100 text-slate-700 ring-slate-200";
    if (type === "status" && STATUS_CONFIG[value]) {
      label = STATUS_CONFIG[value].label;
      classes = STATUS_CONFIG[value].classes;
    } else if (type === "priority" && PRIORITY_CONFIG[value]) {
      label = PRIORITY_CONFIG[value].label;
      classes = PRIORITY_CONFIG[value].classes;
    } else if (type === "module") {
      const mod = (value || "").toLowerCase();
      label = MODULE_CONFIG[mod]?.label || value;
      classes = MODULE_CONFIG[mod]?.classes || "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300";
    } else if (type === "type") {
      const t = (value || "feature").toLowerCase();
      label = TYPE_CONFIG[t]?.label || value;
      classes = TYPE_CONFIG[t]?.classes || "bg-slate-100 text-slate-700 ring-slate-200 font-mono";
    } else if (type === "ready") {
      label = "Listo";
      classes = "bg-emerald-50 text-emerald-700 ring-emerald-400 font-semibold";
    } else if (type === "blocked-dep") {
      label = "Bloqueado por deps";
      classes = "bg-rose-50 text-rose-700 ring-rose-400 font-semibold";
    }
    return `
    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${classes} ${extraClasses}">
      ${label}
    </span>
  `;
  }
  function renderBadge(type, value, extraClasses = "") {
    return Badge({ type, value, extraClasses });
  }

  // project-docs/src/shared/Modal.js
  function renderModal(feature) {
    if (!feature) {
      return `<div id="modal-container"></div>`;
    }
    const branchName = feature.branch || `${feature.type || "feature"}/INT-${String(feature.id).padStart(3, "0")}/${feature.name}`;
    const branchLength = branchName.length;
    const isBranchLengthOk = branchLength <= 80;
    const acceptanceHtml = feature.acceptance && feature.acceptance.length ? `
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Criterios de Aceptaci\xF3n (${feature.acceptance.length})</h4>
        <ul class="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          ${feature.acceptance.map((a) => `
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">\u2713</span>
              <span>${a}</span>
            </li>`).join("")}
        </ul>
      </div>` : "";
    const tasksHtml = feature.tasks && feature.tasks.length ? `
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tareas (${feature.tasks.filter((t) => t.done).length}/${feature.tasks.length})</h4>
        <ul class="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          ${feature.tasks.map((t) => `
            <li class="flex items-start gap-2 ${t.done ? "text-emerald-700 dark:text-emerald-400 line-through opacity-80" : ""}">
              <span class="${t.done ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"} font-mono">${t.done ? "\u2713" : "\u25CB"}</span>
              <span>${t.title || t}</span>
            </li>`).join("")}
        </ul>
      </div>` : "";
    const rawDeps = feature.depends_on || feature.dependencies || [];
    const depsHtml = rawDeps.length ? `
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Dependencias Directas (${rawDeps.length})</h4>
        <div class="flex flex-wrap gap-1.5">
          ${rawDeps.map((dId) => `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
              <span>INT-${String(dId).padStart(3, "0")}</span>
            </span>`).join("")}
        </div>
      </div>` : "";
    return `
    <div id="modal-container" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity cursor-pointer" data-action="close-modal"></div>

      <!-- Modal Card -->
      <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150" role="dialog" aria-modal="true">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50 dark:bg-slate-950/50">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">INT-${String(feature.id).padStart(3, "0")}</span>
              ${Badge({ type: "type", value: feature.type || "feature" })}
              ${Badge({ type: "status", value: feature.status || "pending" })}
              ${Badge({ type: "priority", value: feature.priority || "P2" })}
              ${feature.module ? Badge({ type: "module", value: feature.module }) : ""}
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              ${feature.title || feature.name}
            </h3>
          </div>
          <button type="button" data-action="close-modal" class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="Cerrar modal (Esc)">
            \u2715
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-5 overflow-y-auto space-y-4 text-slate-700 dark:text-slate-300">
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Descripci\xF3n</h4>
            <p class="text-sm leading-relaxed text-slate-800 dark:text-slate-200">${feature.description || "Sin descripci\xF3n detallada."}</p>
          </div>

          <!-- Branch Info (\u226480c check) -->
          <div class="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <span class="text-indigo-600 dark:text-indigo-400 inline-block align-middle">${Icons.gitBranch}</span> Rama de trabajo SDD
              </span>
              <span class="font-mono text-xs ${isBranchLengthOk ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-rose-600 dark:text-rose-400 font-bold"}">
                ${branchLength}/80 caracteres ${isBranchLengthOk ? "(V\xE1lida)" : "(Excede 80c)"}
              </span>
            </div>
            <code class="text-xs font-mono text-indigo-700 dark:text-indigo-300 select-all break-all block bg-white dark:bg-slate-900/90 p-2 rounded border border-slate-200 dark:border-slate-800">
              git checkout -b ${branchName}
            </code>
          </div>

          ${feature.spec_folder ? `
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Carpeta de Especificaci\xF3n</h4>
              <p class="text-xs font-mono bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-md inline-block text-slate-800 dark:text-slate-300">
                ${feature.spec_folder}
              </p>
            </div>` : ""}

          ${acceptanceHtml}
          ${tasksHtml}
          ${depsHtml}

          ${feature.documentation && feature.documentation.length ? `
            <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Documentaci\xF3n</h4>
              <div class="flex flex-wrap gap-1 text-xs font-mono">
                ${feature.documentation.map((d) => `<span class="bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800">${d}</span>`).join("")}
              </div>
            </div>` : ""}
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end">
          <button type="button" data-action="close-modal" class="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200/80 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all cursor-pointer">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/stats/StatsSummary.js
  function renderStatsSummary(stats = {}) {
    const s = {
      total: stats.total || 0,
      featuresCount: stats.featuresCount || 0,
      bugfixesCount: stats.bugfixesCount || 0,
      pending: stats.pending || 0,
      specReady: stats.specReady || 0,
      inProgress: stats.inProgress || 0,
      done: stats.done || 0,
      blocked: stats.blocked || 0,
      percentage: stats.percentage || 0
    };
    const items = [
      {
        label: "Total Tareas",
        value: s.total,
        sub: `${s.featuresCount} feat \xB7 ${s.bugfixesCount} fix`,
        color: "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100"
      },
      {
        label: "Pendientes",
        value: s.pending,
        sub: "Por iniciar",
        color: "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300"
      },
      {
        label: "Spec Listo",
        value: s.specReady,
        sub: "Esperando aprobaci\xF3n",
        color: "border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300"
      },
      {
        label: "En Progreso",
        value: s.inProgress,
        sub: "Implementando",
        color: "border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300"
      },
      {
        label: "Completados",
        value: s.done,
        sub: `${s.percentage}% del total`,
        color: "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
      },
      {
        label: "Bloqueados",
        value: s.blocked,
        sub: "Requieren atenci\xF3n",
        color: "border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300"
      }
    ];
    return `
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      ${items.map((item) => `
        <div class="p-4 rounded-2xl border ${item.color} shadow-sm backdrop-blur-md flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div class="text-[11px] uppercase tracking-wider font-semibold opacity-70 mb-1">${item.label}</div>
          <div class="text-2xl sm:text-3xl font-extrabold tracking-tight">${item.value}</div>
          <div class="text-[11px] opacity-60 mt-1 truncate">${item.sub}</div>
        </div>
      `).join("")}
    </div>
  `;
  }

  // project-docs/src/features/current-spec/CurrentSpecCard.js
  function renderCurrentSpecCard(currentSpec) {
    const hasSpec = currentSpec && currentSpec.feature && currentSpec.feature.name;
    if (!hasSpec) {
      return `
      <div class="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex items-center justify-between shadow-xs">
        <div class="flex items-center gap-3">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          <div>
            <div class="text-xs uppercase font-semibold text-slate-500 tracking-wider">Spec Activo de la IA</div>
            <div class="text-sm text-slate-600 dark:text-slate-400">No hay ninguna tarea en proceso en este momento (Agente en espera).</div>
          </div>
        </div>
        <span class="text-xs text-slate-400 dark:text-slate-600 font-mono font-semibold">IDLE</span>
      </div>
    `;
    }
    const specFeature = currentSpec.feature;
    const tasks = currentSpec.tasks || [];
    const completedTasks = tasks.filter((t) => t.done).length;
    const totalTasks = tasks.length;
    const progressPercent = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
    const branchName = specFeature.branch || `${specFeature.type || "feature"}/INT-${String(specFeature.id).padStart(3, "0")}/${specFeature.name}`;
    return `
    <article class="p-5 rounded-2xl border-2 border-indigo-500/80 bg-white dark:bg-slate-900/90 shadow-lg relative overflow-hidden backdrop-blur-md cursor-pointer group"
             data-action="view-detail" 
             data-id="${specFeature.id}">
      <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div class="flex items-center gap-2">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
          <span class="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Spec Activo de la IA</span>
          ${Badge({ type: "type", value: specFeature.type || "feature" })}
          ${Badge({ type: "status", value: "in_progress" })}
        </div>
        
        <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>Ejecutado por: <strong class="text-slate-700 dark:text-slate-200">${currentSpec.responsable || "leader"}</strong></span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div class="space-y-1 max-w-2xl">
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
            #${specFeature.id} \u2014 ${specFeature.title || specFeature.name}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            ${specFeature.description || "En desarrollo por el agente implementer."}
          </p>
          <div class="flex items-center gap-2 pt-1">
            <span class="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              ${branchName}
            </span>
            ${specFeature.module ? Badge({ type: "module", value: specFeature.module }) : ""}
            ${specFeature.priority ? Badge({ type: "priority", value: specFeature.priority }) : ""}
          </div>
        </div>

        <div class="sm:min-w-44 text-right">
          <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Progreso de Tareas: ${completedTasks}/${totalTasks}
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div class="bg-indigo-600 h-full rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center justify-end gap-1">
            <span>Clic para ver detalles</span>
            <span class="group-hover:translate-x-0.5 transition-transform">\u2192</span>
          </div>
        </div>
      </div>
    </article>
  `;
  }

  // project-docs/src/features/feature-list/FeatureFilters.js
  function renderFeatureFilters({ filters, modules = [] }) {
    const currentFilters = filters || {};
    const searchVal = currentFilters.search || "";
    const moduleOptions = modules.map((m) => `
    <option value="${m}" ${currentFilters.module === m ? "selected" : ""}>${m}</option>
  `).join("");
    return `
    <div class="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
      <!-- Search Bar -->
      <div class="relative flex-1 min-w-[240px]">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          ${Icons.search}
        </div>
        <input
          type="text"
          id="feature-search-input"
          value="${escapeAttr(searchVal)}"
          placeholder="Buscar por ID, t\xEDtulo, nombre o rama..."
          autocomplete="off"
          spellcheck="false"
          class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950/70 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
        />
      </div>

      <!-- Type Filter -->
      <select id="filter-type" class="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950/70 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono">
        <option value="">Todos los Tipos</option>
        <option value="feature" ${currentFilters.type === "feature" ? "selected" : ""}>feature</option>
        <option value="bugfix" ${currentFilters.type === "bugfix" ? "selected" : ""}>bugfix</option>
      </select>

      <!-- Status Filter -->
      <select id="filter-status" class="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950/70 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
        <option value="">Todos los Estados</option>
        <option value="pending" ${currentFilters.status === "pending" ? "selected" : ""}>Pendiente</option>
        <option value="spec_ready" ${currentFilters.status === "spec_ready" ? "selected" : ""}>Spec Listo</option>
        <option value="in_progress" ${currentFilters.status === "in_progress" ? "selected" : ""}>En Progreso</option>
        <option value="done" ${currentFilters.status === "done" ? "selected" : ""}>Completado</option>
        <option value="blocked" ${currentFilters.status === "blocked" ? "selected" : ""}>Bloqueado</option>
      </select>

      <!-- Module Filter -->
      <select id="filter-module" class="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950/70 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
        <option value="">Todos los M\xF3dulos</option>
        ${moduleOptions}
      </select>

      <!-- Priority Filter -->
      <select id="filter-priority" class="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950/70 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
        <option value="">Todas las Prioridades</option>
        <option value="alta" ${currentFilters.priority === "alta" ? "selected" : ""}>Alta</option>
        <option value="media" ${currentFilters.priority === "media" ? "selected" : ""}>Media</option>
        <option value="baja" ${currentFilters.priority === "baja" ? "selected" : ""}>Baja</option>
        <option value="P0" ${currentFilters.priority === "P0" ? "selected" : ""}>P0</option>
        <option value="P1" ${currentFilters.priority === "P1" ? "selected" : ""}>P1</option>
        <option value="P2" ${currentFilters.priority === "P2" ? "selected" : ""}>P2</option>
      </select>

      <!-- Reset Button -->
      <button
        data-action="reset-filters"
        type="button"
        class="px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
        title="Restablecer filtros"
      >
        Limpiar
      </button>
    </div>
  `;
  }
  function escapeAttr(text) {
    if (!text) return "";
    return String(text).replace(/"/g, "&quot;");
  }

  // project-docs/src/features/feature-list/FeatureTable.js
  function renderFeatureTable({ features, pagination, onSelect }) {
    const { currentPage, pageSize } = pagination;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedFeatures = features.slice(startIndex, startIndex + pageSize);
    if (features.length === 0) {
      return `
      <div class="p-12 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-600 flex items-center justify-center">
          ${Icons.search}
        </div>
        <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-300 mb-1">No se encontraron tareas</h4>
        <p class="text-sm text-slate-500">Intenta ajustar los filtros de b\xFAsqueda o restablecer los criterios.</p>
      </div>
    `;
    }
    const rowsHtml = paginatedFeatures.map((f) => {
      const idFormatted = `INT-${String(f.id).padStart(3, "0")}`;
      const branchName = f.branch || `${f.type || "feature"}/INT-${String(f.id).padStart(3, "0")}/${f.name}`;
      const depsCount = f.depends_on && f.depends_on.length || f.dependencies && f.dependencies.length || 0;
      return `
      <tr class="border-b border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
          data-feature-id="${f.id}"
          tabindex="0"
          role="row">
        <!-- ID -->
        <td class="py-3.5 px-4 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          ${idFormatted}
        </td>

        <!-- Type -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          ${renderBadge("type", f.type || "feature")}
        </td>

        <!-- Title & Description -->
        <td class="py-3.5 px-4">
          <div class="font-medium text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
            ${escapeHtml(f.title || f.name)}
          </div>
          ${f.description ? `<p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">${escapeHtml(f.description)}</p>` : ""}
        </td>

        <!-- Module -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          ${renderBadge("module", f.module || "Core")}
        </td>

        <!-- Priority -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          ${renderBadge("priority", f.priority || "P2")}
        </td>

        <!-- Status -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          ${renderBadge("status", f.status || "pending")}
        </td>

        <!-- Branch (\u226480 chars) -->
        <td class="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate" title="${branchName}">
          <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            <span class="text-indigo-600 dark:text-indigo-400">${Icons.gitBranch}</span>
            <span class="truncate max-w-[200px]">${branchName}</span>
          </span>
        </td>

        <!-- Dependencies -->
        <td class="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
          ${depsCount > 0 ? `<span class="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                ${depsCount} dep${depsCount > 1 ? "s" : ""}
              </span>` : `<span class="text-slate-400 dark:text-slate-600">\u2014</span>`}
        </td>

        <!-- Action -->
        <td class="py-3.5 px-4 text-right whitespace-nowrap">
          <button type="button" 
                  data-action="view-detail" 
                  data-id="${f.id}" 
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-all shadow-xs cursor-pointer">
            ${Icons.eye}
            <span>Detalle</span>
          </button>
        </td>
      </tr>
    `;
    }).join("");
    return `
    <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-md shadow-md">
      <table class="w-full text-left text-sm text-slate-700 dark:text-slate-300">
        <thead class="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <tr>
            <th scope="col" class="py-3.5 px-4">Ticket</th>
            <th scope="col" class="py-3.5 px-4">Tipo</th>
            <th scope="col" class="py-3.5 px-4">T\xEDtulo / Descripci\xF3n</th>
            <th scope="col" class="py-3.5 px-4">M\xF3dulo</th>
            <th scope="col" class="py-3.5 px-4">Prioridad</th>
            <th scope="col" class="py-3.5 px-4">Estado</th>
            <th scope="col" class="py-3.5 px-4">Rama Git (m\xE1x 80c)</th>
            <th scope="col" class="py-3.5 px-4">Bloqueos</th>
            <th scope="col" class="py-3.5 px-4 text-right">Acci\xF3n</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/40 font-normal">
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
  }
  function escapeHtml(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // project-docs/src/features/feature-list/FeaturePagination.js
  function renderFeaturePagination({ totalItems, pagination }) {
    const { currentPage, pageSize, totalPages } = pagination;
    if (totalItems === 0) return "";
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    const pages = [];
    let minPage = Math.max(1, currentPage - 2);
    let maxPage = Math.min(totalPages, minPage + 4);
    if (maxPage - minPage < 4) {
      minPage = Math.max(1, maxPage - 4);
    }
    for (let p = minPage; p <= maxPage; p++) {
      pages.push(p);
    }
    const pageButtons = pages.map((p) => {
      const isActive = p === currentPage;
      return `
      <button type="button" 
              data-page="${p}" 
              class="w-8 h-8 rounded-lg text-xs font-semibold transition-all ${isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"}">
        ${p}
      </button>
    `;
    }).join("");
    return `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-xs text-slate-400">
      <!-- Info & Page size selector -->
      <div class="flex items-center gap-3">
        <span>Mostrando <span class="font-semibold text-slate-200">${start}-${end}</span> de <span class="font-semibold text-slate-200">${totalItems}</span> tareas</span>
        <span class="text-slate-600">|</span>
        <div class="flex items-center gap-1.5">
          <label for="page-size-select" class="text-slate-400">Por p\xE1gina:</label>
          <select id="page-size-select" 
                  data-action="change-page-size" 
                  class="bg-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="5" ${pageSize === 5 ? "selected" : ""}>5</option>
            <option value="10" ${pageSize === 10 ? "selected" : ""}>10</option>
            <option value="20" ${pageSize === 20 ? "selected" : ""}>20</option>
            <option value="50" ${pageSize === 50 ? "selected" : ""}>50</option>
          </select>
        </div>
      </div>

      <!-- Page navigation -->
      <div class="flex items-center gap-1.5" role="navigation" aria-label="Paginaci\xF3n de tareas">
        <button type="button" 
                data-page="${currentPage - 1}" 
                ${currentPage <= 1 ? "disabled" : ""} 
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="P\xE1gina anterior"
                aria-label="P\xE1gina anterior">
          ${Icons.chevronLeft}
        </button>

        ${pageButtons}

        <button type="button" 
                data-page="${currentPage + 1}" 
                ${currentPage >= totalPages ? "disabled" : ""} 
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="P\xE1gina siguiente"
                aria-label="P\xE1gina siguiente">
          ${Icons.chevronRight}
        </button>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/dependency-graph/DependencyGraph.js
  function renderDependencyGraph({ features }) {
    if (!features || features.length === 0) {
      return `<div class="p-12 text-center text-slate-500 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">No hay datos de dependencias disponibles.</div>`;
    }
    const featureMap = /* @__PURE__ */ new Map();
    features.forEach((f) => featureMap.set(f.id, f));
    const nodeLevels = /* @__PURE__ */ new Map();
    function getDepth(id, visited = /* @__PURE__ */ new Set()) {
      if (visited.has(id)) return 0;
      visited.add(id);
      const f = featureMap.get(id);
      if (!f) return 0;
      const deps = f.depends_on || f.dependencies || [];
      if (!deps.length) return 0;
      return 1 + Math.max(...deps.map((dId) => getDepth(dId, new Set(visited))));
    }
    features.forEach((f) => {
      nodeLevels.set(f.id, getDepth(f.id));
    });
    const maxLevel = Math.max(...Array.from(nodeLevels.values()), 0);
    const levels = [];
    for (let i = 0; i <= maxLevel; i++) levels.push([]);
    features.forEach((f) => {
      const lvl = nodeLevels.get(f.id) || 0;
      levels[lvl].push(f);
    });
    let totalEdges = 0;
    let maxInDegree = 0;
    const analyzed = features.map((f) => {
      const rawDeps = f.depends_on || f.dependencies || [];
      totalEdges += rawDeps.length;
      if (rawDeps.length > maxInDegree) maxInDegree = rawDeps.length;
      const deps = rawDeps.map((dId) => featureMap.get(dId)).filter(Boolean);
      const pendingDeps = deps.filter((d) => d.status !== "done");
      const isBlocked = f.status !== "done" && pendingDeps.length > 0;
      const isReady = f.status === "pending" && pendingDeps.length === 0;
      const dependents = features.filter((other) => (other.depends_on || other.dependencies || []).includes(f.id));
      return {
        feature: f,
        deps,
        pendingDeps,
        isBlocked,
        isReady,
        dependents
      };
    });
    const blockedCount = analyzed.filter((a) => a.isBlocked).length;
    const readyCount = analyzed.filter((a) => a.isReady).length;
    const doneCount = analyzed.filter((a) => a.feature.status === "done").length;
    const colWidth = 270;
    const nodeHeight = 98;
    const gapY = 32;
    const gapX = 110;
    const paddingX = 60;
    const paddingTop = 90;
    const paddingBottom = 60;
    let maxRowInCol = 0;
    levels.forEach((lvl) => {
      if (lvl.length > maxRowInCol) maxRowInCol = lvl.length;
    });
    const canvasWidth = Math.max(1240, levels.length * (colWidth + gapX) + paddingX * 2);
    const canvasHeight = Math.max(640, maxRowInCol * (nodeHeight + gapY) + paddingTop + paddingBottom);
    const coords = /* @__PURE__ */ new Map();
    levels.forEach((colFeatures, colIdx) => {
      const x = paddingX + colIdx * (colWidth + gapX);
      const colHeight = colFeatures.length * (nodeHeight + gapY) - gapY;
      const startY = paddingTop + Math.max(0, (canvasHeight - paddingTop - paddingBottom - colHeight) / 2);
      colFeatures.forEach((f, rowIdx) => {
        const y = startY + rowIdx * (nodeHeight + gapY);
        coords.set(f.id, { x, y, width: colWidth, height: nodeHeight, colIdx, rowIdx });
      });
    });
    const edgesSvg = [];
    features.forEach((f) => {
      const target = coords.get(f.id);
      const rawDeps = f.depends_on || f.dependencies || [];
      if (!target || !rawDeps.length) return;
      rawDeps.forEach((depId) => {
        const source = coords.get(depId);
        const sourceFeature = featureMap.get(depId);
        if (!source || !sourceFeature) return;
        const isResolved = sourceFeature.status === "done";
        const startX = source.x + source.width;
        const startY = source.y + source.height / 2;
        const endX = target.x;
        const endY = target.y + target.height / 2;
        const deltaX = endX - startX;
        const ctrl1X = startX + deltaX * 0.45;
        const ctrl2X = endX - deltaX * 0.45;
        const pathD = `M ${startX} ${startY} C ${ctrl1X} ${startY}, ${ctrl2X} ${endY}, ${endX} ${endY}`;
        const strokeColor = isResolved ? "#10b981" : "#f43f5e";
        const markerId = isResolved ? "arrow-resolved" : "arrow-blocked";
        edgesSvg.push(`
        <path d="${pathD}" 
              data-edge-from="${depId}" 
              data-edge-to="${f.id}" 
              class="graph-edge transition-all duration-200" 
              fill="none" 
              stroke="${strokeColor}" 
              stroke-width="2.2" 
              stroke-dasharray="${isResolved ? "none" : "5 4"}" 
              opacity="0.75" 
              marker-end="url(#${markerId})" />
      `);
      });
    });
    const nodesSvg = features.map((f) => {
      const pos = coords.get(f.id);
      if (!pos) return "";
      const isDone = f.status === "done";
      const isProg = f.status === "in_progress";
      const rawDeps = f.depends_on || f.dependencies || [];
      const pendingDeps = rawDeps.filter((dId) => {
        const dep = featureMap.get(dId);
        return dep && dep.status !== "done";
      });
      const isBlocked = f.status !== "done" && pendingDeps.length > 0;
      const isReady = f.status === "pending" && pendingDeps.length === 0;
      let borderClass = "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/95";
      let statusDot = "bg-slate-400";
      let glowClass = "";
      if (isDone) {
        borderClass = "border-emerald-500/70 bg-emerald-50/60 dark:bg-emerald-950/25";
        statusDot = "bg-emerald-500";
      } else if (isProg) {
        borderClass = "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/35 ring-2 ring-indigo-500/30";
        statusDot = "bg-indigo-500 animate-pulse";
        glowClass = "shadow-md shadow-indigo-500/10";
      } else if (isBlocked) {
        borderClass = "border-rose-400 dark:border-rose-500/70 bg-rose-50/60 dark:bg-rose-950/25";
        statusDot = "bg-rose-500";
      } else if (isReady) {
        borderClass = "border-cyan-400 dark:border-cyan-500/70 bg-cyan-50/60 dark:bg-cyan-950/25";
        statusDot = "bg-cyan-500";
      }
      const dependentsCount = features.filter((other) => (other.depends_on || other.dependencies || []).includes(f.id)).length;
      const weightVal = f.weight || (f.priority === "P0" ? 95 : f.priority === "P1" ? 75 : 50);
      return `
      <foreignObject x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}">
        <div xmlns="http://www.w3.org/1999/xhtml"
             data-graph-node="${f.id}"
             data-deps="${rawDeps.join(",")}"
             class="graph-node p-3 w-full h-full rounded-2xl border ${borderClass} ${glowClass} backdrop-blur-md shadow-sm transition-all duration-200 cursor-pointer select-none flex flex-col justify-between hover:scale-[1.02] hover:shadow-lg"
             title="Clic para ver detalle de ${f.branch || f.name}">
          <div>
            <div class="flex items-center justify-between gap-1 mb-1">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full ${statusDot}"></span>
                <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">INT-${String(f.id).padStart(3, "0")}</span>
                <span class="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${f.type === "bugfix" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}">
                  ${f.type || "feat"}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1 py-0.2 rounded border border-amber-200 dark:border-amber-900/60">
                  P:${weightVal}
                </span>
                <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  ${f.status}
                </span>
              </div>
            </div>
            <div class="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate leading-snug">
              ${f.title || f.name}
            </div>
          </div>
          <div class="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
            <span class="font-medium">${f.module || "Core"}</span>
            <div class="flex items-center gap-2 font-mono text-[10px]">
              <span title="Dependencias requeridas">\u2190 ${rawDeps.length} req</span>
              <span title="Tareas que desbloquea">\u2192 ${dependentsCount} dep</span>
            </div>
          </div>
        </div>
      </foreignObject>
    `;
    }).join("");
    const phaseTitles = [
      "Fase 1: Fundamentos (Ra\xEDces)",
      "Fase 2: Arquitectura y Datos",
      "Fase 3: L\xF3gica y Endpoints",
      "Fase 4: Integraci\xF3n & Workers",
      "Fase 5: Extensi\xF3n & BI"
    ];
    const phaseHeaders = levels.map((lvl, colIdx) => {
      const x = paddingX + colIdx * (colWidth + gapX);
      const title = phaseTitles[colIdx] || `Fase ${colIdx + 1}`;
      return `
      <div class="absolute font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider px-3 py-1.5 bg-white/85 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md shadow-xs pointer-events-none"
           style="left: ${x}px; top: 20px; width: ${colWidth}px;">
        <div class="flex items-center justify-between">
          <span>${title}</span>
          <span class="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">${lvl.length}</span>
        </div>
      </div>
    `;
    }).join("");
    return `
    <div class="space-y-6">
      <!-- Barra KPI de Grafo -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Estructura de Red</div>
            <div class="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">Grafo DAG (Malla)</div>
            <div class="text-[10px] text-slate-400 mt-0.5">${features.length} nodos \xB7 ${totalEdges} aristas</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            ${Icons.gitBranch}
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Listas para Iniciar</div>
            <div class="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 font-mono">${readyCount}</div>
            <div class="text-[10px] text-cyan-600 dark:text-cyan-400 mt-0.5">Predecesores completos</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            ${Icons.check}
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Bloqueadas Activas</div>
            <div class="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 font-mono">${blockedCount}</div>
            <div class="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">Esperando resoluci\xF3n</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            ${Icons.clock}
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Tareas Resueltas</div>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">${doneCount}</div>
            <div class="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Flujo completado</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            ${Icons.checkCircle}
          </div>
        </div>
      </div>

      <!-- Lienzo SVG Interactivo del Grafo Dirigido (Sin Recorte) -->
      <div class="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/90 shadow-md overflow-hidden">
        
        <!-- Barra de Herramientas y Leyenda Superior -->
        <div class="p-3 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              ${Icons.gitBranch} Grafo de Bloqueos y Dependencias (DAG)
            </span>
            <span class="text-slate-300 dark:text-slate-700">|</span>
            <span class="text-slate-500 dark:text-slate-400 text-[11px] hidden sm:inline">
              Pasa el cursor sobre un nodo para aislar sus dependientes y requerimientos
            </span>
          </div>

          <div class="flex items-center gap-4 text-[11px]">
            <span class="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span class="w-3 h-0.5 bg-emerald-500 rounded"></span> Satisfecha
            </span>
            <span class="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span class="w-3 h-0.5 border-b-2 border-dashed border-rose-500"></span> Bloqueo Activo
            </span>
            <span class="inline-flex items-center gap-1 text-slate-400 font-mono text-[10px]">
              [P:xx] = Peso
            </span>
          </div>
        </div>

        <!-- Canvas con Desplazamiento Suave y Sin Recorte -->
        <div id="graph-viewport-container" 
             class="relative overflow-x-auto overflow-y-auto p-4 max-h-[720px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 cursor-grab active:cursor-grabbing">
          
          <div class="relative" style="width: ${canvasWidth}px; height: ${canvasHeight}px;">
            ${phaseHeaders}

            <svg viewBox="0 0 ${canvasWidth} ${canvasHeight}" 
                 width="${canvasWidth}" 
                 height="${canvasHeight}" 
                 class="block">
              <defs>
                <marker id="arrow-resolved" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#10b981" />
                </marker>
                <marker id="arrow-blocked" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f43f5e" />
                </marker>
              </defs>

              <!-- Aristas de Grafo (Conexiones de red) -->
              <g id="graph-edges-group">
                ${edgesSvg.join("")}
              </g>

              <!-- Nodos de Grafo -->
              <g id="graph-nodes-group">
                ${nodesSvg}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/dependency-tree/DependencyTree.js
  var DependencyTreeComponent = class {
    constructor(containerEl, { features, currentSpec, onSelect }) {
      this.container = containerEl;
      this.features = features || [];
      this.currentSpec = currentSpec || {};
      this.onSelect = onSelect;
      this.collapsedNodes = /* @__PURE__ */ new Set();
    }
    toggleNode(nodeKey) {
      if (this.collapsedNodes.has(nodeKey)) {
        this.collapsedNodes.delete(nodeKey);
      } else {
        this.collapsedNodes.add(nodeKey);
      }
      this.render();
    }
    expandAll() {
      this.collapsedNodes.clear();
      this.render();
    }
    collapseToModules() {
      this.collapsedNodes.clear();
      this.features.forEach((f) => {
        this.collapsedNodes.add(`feature-${f.id}`);
      });
      this.render();
    }
    collapseAll() {
      const modules = Array.from(new Set(this.features.map((f) => f.module || "core")));
      modules.forEach((m) => this.collapsedNodes.add(`module-${m}`));
      this.features.forEach((f) => this.collapsedNodes.add(`feature-${f.id}`));
      this.render();
    }
    render() {
      if (!this.container) return;
      const projectName = this.features[0]?.project || "CloudSaaS Platform";
      const modulesMap = /* @__PURE__ */ new Map();
      this.features.forEach((f) => {
        const mod = f.module || "core";
        if (!modulesMap.has(mod)) {
          modulesMap.set(mod, []);
        }
        modulesMap.get(mod).push(f);
      });
      const totalFeatures = this.features.length;
      const totalModules = modulesMap.size;
      const completedFeatures = this.features.filter((f) => f.status === "done").length;
      let totalSubtasks = 0;
      this.features.forEach((f) => {
        if (f.id === this.currentSpec?.id && Array.isArray(this.currentSpec?.tasks)) {
          totalSubtasks += this.currentSpec.tasks.length;
        } else if (Array.isArray(f.acceptance)) {
          totalSubtasks += Math.min(f.acceptance.length, 3);
        }
      });
      const totalTreeNodes = 1 + totalModules + totalFeatures + totalSubtasks;
      const totalTreeEdges = totalTreeNodes - 1;
      const modulesHtml = Array.from(modulesMap.entries()).map(([moduleName, moduleFeatures], modIdx) => {
        const modKey = `module-${moduleName}`;
        const isModCollapsed = this.collapsedNodes.has(modKey);
        const modDoneCount = moduleFeatures.filter((f) => f.status === "done").length;
        const modTotal = moduleFeatures.length;
        const modProgressPct = Math.round(modDoneCount / modTotal * 100);
        const featuresHtml = moduleFeatures.map((f, featIdx) => {
          const featKey = `feature-${f.id}`;
          const isFeatCollapsed = this.collapsedNodes.has(featKey);
          const isDone = f.status === "done";
          const isProg = f.status === "in_progress";
          const isBug = f.type === "bugfix";
          const weightVal = f.weight || (f.priority === "P0" ? 95 : f.priority === "P1" ? 75 : 50);
          let subtasks = [];
          if (f.id === this.currentSpec?.id && Array.isArray(this.currentSpec?.tasks)) {
            subtasks = this.currentSpec.tasks.map((t) => ({
              name: t.name || t.title,
              done: t.done || t.status === "done"
            }));
          } else if (Array.isArray(f.acceptance)) {
            subtasks = f.acceptance.slice(0, 3).map((a) => ({
              name: a,
              done: isDone
            }));
          }
          const subtasksHtml = subtasks.map((sub, sIdx) => {
            const isLastSub = sIdx === subtasks.length - 1;
            return `
            <div class="relative flex items-center gap-2 pl-6 py-1 text-xs group">
              <!-- Conector Ortogonal de Hoja -->
              <div class="absolute left-1.5 top-0 w-3 h-3.5 border-l-2 border-b-2 border-slate-300 dark:border-slate-700/80 rounded-bl-sm"></div>
              
              <span class="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${sub.done ? "bg-emerald-500 text-white" : "border border-slate-400 dark:border-slate-600 text-slate-400"}">
                ${sub.done ? "\u2713" : "\u25CB"}
              </span>
              <span class="truncate text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
                ${escapeHtml2(sub.name)}
              </span>
            </div>
          `;
          }).join("");
          const isLastFeat = featIdx === moduleFeatures.length - 1;
          return `
          <div class="relative pl-6 pt-2">
            <!-- Gu\xEDa Vertical del Padre (M\xF3dulo) -->
            ${!isLastFeat ? '<div class="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"></div>' : ""}
            <!-- Conector Ortogonal hacia la Feature -->
            <div class="absolute left-2 top-5 w-4 h-0.5 bg-slate-200 dark:bg-slate-800"></div>

            <!-- Tarjeta de Feature (Nivel 2) -->
            <div class="rounded-xl border ${isProg ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm" : isDone ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/15" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80"} p-3 shadow-xs hover:border-indigo-400 transition-all">
              
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <!-- Bot\xF3n Colapsar Subtareas -->
                  <button type="button" 
                          data-tree-toggle="${featKey}"
                          class="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                          title="${isFeatCollapsed ? "Expandir subtareas" : "Colapsar subtareas"}">
                    ${isFeatCollapsed ? "+" : "\u2212"}
                  </button>

                  <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">INT-${String(f.id).padStart(3, "0")}</span>
                  
                  <span class="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${isBug ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}">
                    ${f.type || "feat"}
                  </span>

                  <!-- Peso Entero -->
                  <span class="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-900/60"
                        title="Peso de importancia: ${weightVal}/100">
                    Peso: ${weightVal}
                  </span>

                  <span class="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    ${escapeHtml2(f.title || f.name)}
                  </span>
                </div>

                <div class="flex items-center gap-2 text-xs">
                  <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${isDone ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : isProg ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 animate-pulse" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}">
                    ${f.status}
                  </span>

                  <button type="button" 
                          data-action="view-detail" 
                          data-id="${f.id}" 
                          class="px-2 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium transition-colors cursor-pointer">
                    Ver Spec
                  </button>
                </div>
              </div>

              <!-- Hojas / Subtareas (Nivel 3) -->
              ${!isFeatCollapsed && subtasks.length > 0 ? `
                <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-0.5">
                  <div class="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1 pl-6">
                    Subtareas de Implementaci\xF3n (${subtasks.filter((s) => s.done).length}/${subtasks.length}):
                  </div>
                  ${subtasksHtml}
                </div>
              ` : ""}
            </div>
          </div>
        `;
        }).join("");
        const isLastMod = modIdx === modulesMap.size - 1;
        return `
        <div class="relative pl-6 pt-4">
          <!-- Gu\xEDa Vertical de la Ra\xEDz -->
          ${!isLastMod ? '<div class="absolute left-2.5 top-0 bottom-0 w-0.5 bg-indigo-300 dark:bg-indigo-900/60"></div>' : ""}
          <!-- Conector Ortogonal hacia el M\xF3dulo -->
          <div class="absolute left-2.5 top-8 w-4 h-0.5 bg-indigo-300 dark:bg-indigo-900/60"></div>

          <!-- Tarjeta de M\xF3dulo (Nivel 1) -->
          <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-md p-3.5 shadow-xs">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <button type="button" 
                        data-tree-toggle="${modKey}"
                        class="w-6 h-6 rounded-lg bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                        title="${isModCollapsed ? "Expandir m\xF3dulo" : "Colapsar m\xF3dulo"}">
                  ${isModCollapsed ? "+" : "\u2212"}
                </button>

                <div class="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                  \u{1F4C1}
                </div>

                <div>
                  <div class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>M\xF3dulo: <span class="font-mono text-indigo-600 dark:text-indigo-400">${moduleName}</span></span>
                    <span class="text-xs font-normal text-slate-400">(${modTotal} tareas subordinadas)</span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400">
                    Padre directo: <span class="font-semibold text-slate-700 dark:text-slate-300">Ra\xEDz del Proyecto</span>
                  </div>
                </div>
              </div>

              <!-- Progreso del M\xF3dulo -->
              <div class="flex items-center gap-3">
                <div class="text-right hidden sm:block">
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">${modDoneCount}/${modTotal} resueltas</div>
                  <div class="text-[10px] text-slate-400">${modProgressPct}% progreso</div>
                </div>
                <div class="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div class="h-full bg-indigo-500 rounded-full" style="width: ${modProgressPct}%"></div>
                </div>
              </div>
            </div>

            <!-- Ramas Hijas (Features del M\xF3dulo) -->
            ${!isModCollapsed ? `
              <div class="mt-2 space-y-1">
                ${featuresHtml}
              </div>
            ` : ""}
          </div>
        </div>
      `;
      }).join("");
      this.container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Tarjeta Pedag\xF3gica: Grafo vs \xC1rbol Jer\xE1rquico -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/5 via-cyan-500/5 to-transparent border border-indigo-200/60 dark:border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              ${Icons.folder}
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                \xC1rbol Jer\xE1rquico Estricto (Taxonom\xEDa Padre \u2192 Hijos)
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
                  Estructura Conexa Ac\xEDclica
                </span>
              </h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                A diferencia del <strong>Grafo DAG</strong> (malla de bloqueos cruzados donde un nodo puede tener m\xFAltiples padres), 
                el <strong>\xC1rbol Jer\xE1rquico</strong> impone que cada nodo tenga <strong>exactamente un \xFAnico padre</strong>: 
                <span class="font-mono text-indigo-600 dark:text-indigo-400">Proyecto (Ra\xEDz) \u2192 M\xF3dulos \u2192 Tareas \u2192 Subtareas</span>. 
                Posee exactamente <span class="font-mono font-bold">${totalTreeNodes - 1} aristas</span> para sus <span class="font-mono font-bold">${totalTreeNodes} nodos</span>.
              </p>
            </div>
          </div>

          <!-- Botones de Acci\xF3n de \xC1rbol -->
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" 
                    data-action="tree-expand-all" 
                    class="px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer">
              + Expandir Todo
            </button>
            <button type="button" 
                    data-action="tree-collapse-modules" 
                    class="px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer">
              \u{1F4C1} Solo M\xF3dulos
            </button>
          </div>
        </div>

        <!-- Contenedor del \xC1rbol Visual con Conexiones Ortogonales -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-md">
          
          <!-- NODO RA\xCDZ \xDANICO (NIVEL 0) -->
          <div class="relative">
            <div class="p-4 rounded-2xl bg-indigo-600 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-xl shadow-xs">
                  \u{1F680}
                </div>
                <div>
                  <div class="text-[11px] font-mono uppercase tracking-wider text-indigo-200 font-bold">Nodo Ra\xEDz (Nivel 0)</div>
                  <h2 class="text-lg font-bold tracking-tight">${escapeHtml2(projectName)}</h2>
                </div>
              </div>

              <div class="flex items-center gap-4 text-xs font-mono">
                <span class="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">
                  ${totalModules} M\xF3dulos
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">
                  ${totalFeatures} Tareas
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">
                  ${totalTreeEdges} Aristas (N - 1)
                </span>
              </div>
            </div>

            <!-- Sub\xE1rboles de M\xF3dulos (Nivel 1 y sucesivos) -->
            <div class="mt-2 space-y-2">
              ${modulesHtml}
            </div>
          </div>
        </div>
      </div>
    `;
      this.container.querySelectorAll("[data-tree-toggle]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const key = btn.getAttribute("data-tree-toggle");
          this.toggleNode(key);
        });
      });
      this.container.querySelectorAll('[data-action="tree-expand-all"]').forEach((btn) => {
        btn.addEventListener("click", () => this.expandAll());
      });
      this.container.querySelectorAll('[data-action="tree-collapse-modules"]').forEach((btn) => {
        btn.addEventListener("click", () => this.collapseToModules());
      });
    }
  };
  function escapeHtml2(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // project-docs/src/features/space-view-3d/SpaceView3D.js
  var SpaceView3D = class {
    constructor() {
      this.container = null;
      this.features = [];
      this.onSelect = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.animationId = null;
      this.nodes = [];
      this.orbitRings = [];
      this.flowParticles = [];
      this.labelSprites = [];
      this.raycaster = null;
      this.mouse = null;
      this.isDragging = false;
      this.prevMousePos = { x: 0, y: 0 };
      this.rotation = { x: 0.25, y: 0.5 };
      this.targetRotation = { x: 0.25, y: 0.5 };
      this.hoveredMesh = null;
      this.hudElement = null;
    }
    mount(containerEl, { features, onSelect }) {
      this.container = containerEl;
      this.features = features || [];
      this.onSelect = onSelect;
      if (!window.THREE) {
        this.container.innerHTML = `
        <div class="h-[600px] flex items-center justify-center bg-slate-900 text-slate-400 rounded-2xl border border-slate-800">
          <p>Librer\xEDa Three.js no disponible.</p>
        </div>
      `;
        return;
      }
      this.container.innerHTML = `
      <div class="relative w-full h-[700px] bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl select-none">
        
        <!-- HUD Superior -->
        <div class="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
          <span class="px-3.5 py-1.5 rounded-xl bg-slate-900/85 border border-slate-700/80 text-slate-200 text-xs backdrop-blur-md shadow-lg flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Constelaci\xF3n 3D | Bolitas proporcionales al Peso | Arrastra para orbitar
          </span>
        </div>

        <!-- Leyenda de Estados, Tama\xF1os y Pesos -->
        <div class="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex flex-wrap items-center gap-3 text-[11px] bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl backdrop-blur-md shadow-lg text-slate-300">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400"></span> Resuelto</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-indigo-500 shadow-xs shadow-indigo-500"></span> En Progreso</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400"></span> Spec Listo</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-rose-500 shadow-xs shadow-rose-500"></span> Bloqueado</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-400 shadow-xs shadow-amber-400"></span> Bugfix</span>
          <span class="text-slate-600">|</span>
          <span class="font-mono text-amber-400 font-bold">Tama\xF1o de Bolita \u221D Peso (20 a 100)</span>
        </div>

        <!-- Panel Lateral de Nodos en \xD3rbita -->
        <div class="absolute top-4 right-4 z-20 w-56 max-h-[640px] bg-slate-900/90 border border-slate-800 rounded-2xl p-3 backdrop-blur-md shadow-2xl overflow-y-auto hidden md:block">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 px-1 flex items-center justify-between">
            <span>Nodos 3D (${this.features.length})</span>
            <span class="text-[10px] text-indigo-400 font-mono">Peso</span>
          </div>
          <div class="space-y-1.5" id="three-node-list">
            ${this.features.map((f) => {
        const dotColor = f.status === "done" ? "bg-emerald-400" : f.status === "in_progress" ? "bg-indigo-400" : f.type === "bugfix" ? "bg-amber-400" : "bg-slate-500";
        const weightVal = f.weight || (f.priority === "P0" ? 95 : f.priority === "P1" ? 75 : 50);
        return `
                <button type="button" 
                        data-focus-node="${f.id}" 
                        class="w-full text-left px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-800/90 transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-700/60">
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="w-2 h-2 rounded-full ${dotColor}"></span>
                    <span class="font-mono text-[11px] font-bold text-slate-200 group-hover:text-indigo-300">INT-${String(f.id).padStart(3, "0")}</span>
                    <span class="truncate text-[11px] text-slate-400">${f.name}</span>
                  </div>
                  <span class="font-mono text-[10px] font-bold text-amber-400 bg-amber-950/40 px-1 py-0.2 rounded border border-amber-900/50">
                    ${weightVal}
                  </span>
                </button>
              `;
      }).join("")}
          </div>
        </div>

        <!-- HUD Tooltip Flotante 3D -->
        <div id="three-tooltip-hud" class="absolute z-30 pointer-events-none hidden transition-opacity duration-150 transform -translate-x-1/2 -translate-y-full mb-4">
          <div class="bg-slate-900/95 border border-indigo-500/70 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-xs text-slate-200 min-w-[240px] max-w-xs">
            <div id="hud-content"></div>
          </div>
        </div>

        <!-- Canvas 3D Root -->
        <div id="three-canvas-root" class="w-full h-full cursor-grab active:cursor-grabbing"></div>
      </div>
    `;
      const root = this.container.querySelector("#three-canvas-root");
      this.hudElement = this.container.querySelector("#three-tooltip-hud");
      this.initThree(root);
    }
    initThree(rootEl) {
      const THREE = window.THREE;
      const width = rootEl.clientWidth || 800;
      const height = rootEl.clientHeight || 700;
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(132631, 14e-4);
      this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 3500);
      this.camera.position.set(0, 45, 540);
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      rootEl.appendChild(this.renderer.domElement);
      const ambientLight = new THREE.AmbientLight(16777215, 1);
      this.scene.add(ambientLight);
      const pointLight = new THREE.PointLight(6514417, 2.5, 1200);
      pointLight.position.set(160, 260, 220);
      this.scene.add(pointLight);
      const secondLight = new THREE.PointLight(440020, 1.8, 1e3);
      secondLight.position.set(-200, -150, 100);
      this.scene.add(secondLight);
      this.createStarfield();
      this.createNodes();
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      this.bindEvents(rootEl);
      this.animate();
    }
    createStarfield() {
      const THREE = window.THREE;
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1300;
      const posArray = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 2400;
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
      const starMat = new THREE.PointsMaterial({
        size: 1.8,
        color: 9741240,
        transparent: true,
        opacity: 0.65
      });
      const starField = new THREE.Points(starGeo, starMat);
      this.scene.add(starField);
    }
    /**
     * Crea una etiqueta 3D (Sprite) con texto nítido renderizado en Canvas 2D
     * Muestra: INT-numero y Peso: xx
     */
    createLabelSprite(taskId, weight, priority, colorHex) {
      const THREE = window.THREE;
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(2, 6, 23, 0.88)";
      ctx.strokeStyle = colorHex || "#6366f1";
      ctx.lineWidth = 5;
      const r = 24;
      ctx.beginPath();
      ctx.moveTo(r, 6);
      ctx.lineTo(256 - r, 6);
      ctx.quadraticCurveTo(256 - 6, 6, 256 - 6, r);
      ctx.lineTo(256 - 6, 128 - r);
      ctx.quadraticCurveTo(256 - 6, 128 - 6, 256 - r, 128 - 6);
      ctx.lineTo(r, 128 - 6);
      ctx.quadraticCurveTo(6, 128 - 6, 6, 128 - r);
      ctx.lineTo(6, r);
      ctx.quadraticCurveTo(6, 6, r, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 36px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(taskId, 128, 46);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 26px monospace";
      ctx.fillText(`Peso: ${weight}`, 128, 92);
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(40, 20, 1);
      return sprite;
    }
    createNodes() {
      const THREE = window.THREE;
      const count = this.features.length;
      this.nodes = [];
      this.orbitRings = [];
      this.flowParticles = [];
      this.labelSprites = [];
      const radius = 200;
      const featureMap = /* @__PURE__ */ new Map();
      this.features.forEach((f) => featureMap.set(f.id, f));
      this.features.forEach((f, idx) => {
        const phi = Math.acos(-1 + 2 * idx / Math.max(count, 1));
        const theta = Math.sqrt(count * Math.PI) * phi;
        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);
        const weightVal = f.weight || (f.priority === "P0" ? 95 : f.priority === "P1" ? 75 : 50);
        const sphereRadius = 6 + weightVal / 100 * 16;
        let color = 6583435;
        let emissive = 3359061;
        let colorHex = "#6366f1";
        const rawDeps = f.depends_on || f.dependencies || [];
        const pendingDeps = rawDeps.filter((dId) => {
          const dep = featureMap.get(dId);
          return dep && dep.status !== "done";
        });
        const isBlocked = f.status !== "done" && pendingDeps.length > 0;
        if (f.status === "done") {
          color = 1096065;
          emissive = 366185;
          colorHex = "#10b981";
        } else if (f.status === "in_progress") {
          color = 6514417;
          emissive = 5195493;
          colorHex = "#6366f1";
        } else if (f.status === "spec_ready") {
          color = 440020;
          emissive = 561586;
          colorHex = "#06b6d4";
        } else if (isBlocked) {
          color = 16007006;
          emissive = 14753096;
          colorHex = "#f43f5e";
        } else if (f.type === "bugfix") {
          color = 16096779;
          emissive = 14251782;
          colorHex = "#f59e0b";
        }
        const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.22,
          metalness: 0.35,
          emissive,
          emissiveIntensity: 0.55
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.userData = {
          feature: f,
          weight: weightVal,
          baseRadius: sphereRadius,
          baseColor: color,
          baseEmissive: emissive
        };
        this.scene.add(mesh);
        this.nodes.push(mesh);
        const taskId = `INT-${String(f.id).padStart(3, "0")}`;
        const sprite = this.createLabelSprite(taskId, weightVal, f.priority, colorHex);
        sprite.position.set(x, y + sphereRadius + 15, z);
        this.scene.add(sprite);
        this.labelSprites.push(sprite);
        if (weightVal >= 80) {
          const ringGeo = new THREE.RingGeometry(sphereRadius + 4, sphereRadius + 6.5, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.65
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.set(x, y, z);
          ring.rotation.x = Math.PI / 2.5;
          this.scene.add(ring);
          this.orbitRings.push(ring);
        }
      });
      this.features.forEach((f) => {
        const rawDeps = f.depends_on || f.dependencies || [];
        if (!rawDeps.length) return;
        const targetMesh = this.nodes.find((n) => n.userData.feature.id === f.id);
        if (!targetMesh) return;
        rawDeps.forEach((depId) => {
          const sourceMesh = this.nodes.find((n) => n.userData.feature.id === depId);
          if (!sourceMesh) return;
          const sourceFeature = featureMap.get(depId);
          const isResolved = sourceFeature && sourceFeature.status === "done";
          const points = [sourceMesh.position, targetMesh.position];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({
            color: isResolved ? 1096065 : 16007006,
            transparent: true,
            opacity: isResolved ? 0.65 : 0.45
          });
          const line = new THREE.Line(lineGeo, lineMat);
          this.scene.add(line);
          const pGeo = new THREE.SphereGeometry(2.4, 12, 12);
          const pMat = new THREE.MeshBasicMaterial({
            color: isResolved ? 3462041 : 16478597
          });
          const particle = new THREE.Mesh(pGeo, pMat);
          particle.userData = {
            start: sourceMesh.position,
            end: targetMesh.position,
            progress: Math.random()
          };
          this.scene.add(particle);
          this.flowParticles.push(particle);
        });
      });
    }
    bindEvents(rootEl) {
      const onMouseDown = (e) => {
        this.isDragging = true;
        this.prevMousePos = { x: e.clientX, y: e.clientY };
      };
      const onMouseMove = (e) => {
        const rect = rootEl.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        this.mouse.x = screenX / rootEl.clientWidth * 2 - 1;
        this.mouse.y = -(screenY / rootEl.clientHeight) * 2 + 1;
        if (this.isDragging) {
          const deltaX = e.clientX - this.prevMousePos.x;
          const deltaY = e.clientY - this.prevMousePos.y;
          this.targetRotation.y += deltaX * 5e-3;
          this.targetRotation.x += deltaY * 5e-3;
          this.prevMousePos = { x: e.clientX, y: e.clientY };
        }
        this.checkRaycast(screenX, screenY);
      };
      const onMouseUp = () => {
        this.isDragging = false;
      };
      const onClick = () => {
        if (this.hoveredMesh) {
          this.focusOnNode(this.hoveredMesh);
        }
      };
      rootEl.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      rootEl.addEventListener("click", onClick);
      this.container.querySelectorAll("[data-focus-node]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = parseInt(btn.getAttribute("data-focus-node"), 10);
          const targetNode = this.nodes.find((n) => n.userData.feature.id === id);
          if (targetNode) {
            this.focusOnNode(targetNode);
          }
        });
      });
      this._cleanupEvents = () => {
        rootEl.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        rootEl.removeEventListener("click", onClick);
      };
    }
    checkRaycast(screenX, screenY) {
      if (!this.raycaster || !this.camera || !this.hudElement) return;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.nodes);
      if (intersects.length > 0) {
        const mesh = intersects[0].object;
        if (this.hoveredMesh !== mesh) {
          if (this.hoveredMesh) {
            this.hoveredMesh.scale.set(1, 1, 1);
          }
          this.hoveredMesh = mesh;
          mesh.scale.set(1.22, 1.22, 1.22);
        }
        const f = mesh.userData.feature;
        const weightVal = mesh.userData.weight;
        const hudContent = this.container.querySelector("#hud-content");
        if (hudContent && f) {
          const branchName = f.branch || `${f.type || "feature"}/INT-${String(f.id).padStart(3, "0")}/${f.name}`;
          const rawDeps = f.depends_on || f.dependencies || [];
          hudContent.innerHTML = `
          <div class="flex items-center justify-between gap-2 mb-2 border-b border-slate-800 pb-2">
            <span class="font-mono font-bold text-indigo-400 text-sm">INT-${String(f.id).padStart(3, "0")}</span>
            <span class="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 uppercase">${f.status}</span>
          </div>
          <div class="font-bold text-slate-100 text-xs mb-1.5 leading-snug">${f.title || f.name}</div>
          <div class="font-mono text-[10px] text-slate-400 truncate mb-2">\u{1F33F} ${branchName}</div>
          
          <!-- Barra de Peso -->
          <div class="mb-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div class="flex items-center justify-between text-[10px] mb-1">
              <span class="text-amber-400 font-bold font-mono">Peso de Importancia:</span>
              <span class="font-mono font-bold text-amber-300">${weightVal} / 100</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" style="width: ${weightVal}%"></div>
            </div>
          </div>

          <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Prioridad: <strong class="text-indigo-300">${f.priority || "P2"}</strong></span>
            <span>${rawDeps.length ? `${rawDeps.length} dependencias` : "Ra\xEDz sin bloqueos"}</span>
          </div>
        `;
        }
        this.hudElement.style.left = `${screenX}px`;
        this.hudElement.style.top = `${screenY}px`;
        this.hudElement.classList.remove("hidden");
      } else {
        if (this.hoveredMesh) {
          this.hoveredMesh.scale.set(1, 1, 1);
          this.hoveredMesh = null;
        }
        this.hudElement.classList.add("hidden");
      }
    }
    focusOnNode(nodeMesh) {
      if (!nodeMesh) return;
      const pos = nodeMesh.position;
      this.targetRotation.x = -pos.y * 3e-3;
      this.targetRotation.y = Math.atan2(pos.x, pos.z);
      if (this.onSelect) {
        this.onSelect(nodeMesh.userData.feature);
      }
    }
    animate() {
      this.animationId = requestAnimationFrame(() => this.animate());
      this.rotation.x += (this.targetRotation.x - this.rotation.x) * 0.08;
      this.rotation.y += (this.targetRotation.y - this.rotation.y) * 0.08;
      if (!this.isDragging) {
        this.targetRotation.y += 12e-4;
      }
      if (this.scene) {
        this.scene.rotation.y = this.rotation.y;
        this.scene.rotation.x = this.rotation.x;
      }
      this.orbitRings.forEach((ring) => {
        ring.rotation.z += 0.015;
      });
      this.flowParticles.forEach((p) => {
        p.userData.progress = (p.userData.progress + 8e-3) % 1;
        const { start, end, progress } = p.userData;
        p.position.lerpVectors(start, end, progress);
      });
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }
    unmount() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      if (this._cleanupEvents) {
        this._cleanupEvents();
        this._cleanupEvents = null;
      }
      if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.nodes = [];
      this.orbitRings = [];
      this.flowParticles = [];
      this.labelSprites = [];
      this.scene = null;
      this.camera = null;
      this.renderer = null;
    }
  };

  // project-docs/src/features/history-timeline/HistoryTimeline.js
  function renderHistoryTimeline({ history, features }) {
    const records = history?.records || history || [];
    if (!records || records.length === 0) {
      return `
      <div class="p-12 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-600 flex items-center justify-center">
          ${Icons.clock}
        </div>
        <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-300 mb-1">Sin historial de ejecuciones a\xFAn</h4>
        <p class="text-sm text-slate-500 max-w-md mx-auto">
          A medida que las features y bugfixes completen el flujo SDD y pasen la revisi\xF3n del subagente <code class="text-indigo-600 dark:text-indigo-400">reviewer</code>, las entradas se registrar\xE1n aqu\xED autom\xE1ticamente desde <code class="text-indigo-600 dark:text-indigo-400">project-docs/progres/history.json</code>.
        </p>
      </div>
    `;
    }
    const itemsHtml = records.map((rec, idx) => {
      const isFirst = idx === 0;
      const branchName = rec.branch || `${rec.type || "feature"}/INT-${String(rec.id).padStart(3, "0")}/${rec.name || "task"}`;
      return `
      <div class="relative pl-8 pb-8 group last:pb-0">
        <!-- L\xEDnea conectora -->
        <div class="absolute top-3 left-3 -ml-[1px] h-full w-0.5 bg-slate-200 dark:bg-slate-800 group-last:hidden"></div>

        <!-- Punto en la l\xEDnea de tiempo -->
        <div class="absolute top-1.5 left-1 w-4 h-4 rounded-full border-2 ${isFirst ? "bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/50" : "bg-white dark:bg-slate-900 border-indigo-500"} transition-transform group-hover:scale-125"></div>

        <!-- Contenido de la tarjeta de historial -->
        <div class="bg-white dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">INT-${String(rec.id).padStart(3, "0")}</span>
              ${renderBadge("type", rec.type || "feature")}
              <span class="font-semibold text-slate-900 dark:text-slate-100 text-sm">${rec.title || rec.name}</span>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ${rec.completed_at || rec.date || "Reciente"}
            </div>
          </div>

          <!-- Rama y Commit -->
          <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span class="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <span class="text-indigo-600 dark:text-indigo-400">${Icons.gitBranch}</span>
              ${branchName}
            </span>

            ${rec.commit ? `
              <span class="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                <span>SHA:</span>
                <span class="text-indigo-600 dark:text-indigo-300 font-semibold">${rec.commit.substring(0, 7)}</span>
              </span>
            ` : ""}

            ${rec.executor ? `
              <span class="text-slate-500 text-xs">
                Por: <span class="text-slate-700 dark:text-slate-300">${rec.executor}</span>
              </span>
            ` : ""}
          </div>

          <!-- Descripci\xF3n o notas -->
          ${rec.summary ? `
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
              ${rec.summary}
            </p>
          ` : ""}
        </div>
      </div>
    `;
    }).join("");
    return `
    <div class="max-w-3xl mx-auto py-4">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">Bit\xE1cora de Cierres de Tareas</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Registro cronol\xF3gico de despliegues y trazabilidad SDD</p>
        </div>
        <span class="px-3 py-1 text-xs font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs">
          Total: ${records.length}
        </span>
      </div>

      <div class="relative">
        ${itemsHtml}
      </div>
    </div>
  `;
  }

  // project-docs/src/features/architecture-docs/ArchitectureDocs.js
  function renderArchitectureDocs({ projectSpec, features = [] }) {
    const spec = projectSpec || getFallbackSpec();
    const proj = spec.project || {};
    const tech = spec.tech_stack || {};
    const arch = spec.architecture || {};
    const modules = spec.modules || [];
    const goals = spec.business_goals || [];
    const featureMap = /* @__PURE__ */ new Map();
    features.forEach((f) => featureMap.set(f.id, f));
    return `
    <div class="space-y-10">
      
      <!-- 1. HEADER: \xBFDe qu\xE9 se trata el proyecto? -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                ${proj.type || "Cloud Architecture"}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                v${proj.version || "2.0.0"}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                ${proj.maturity || "SDD 2.0"}
              </span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${escapeHtml3(proj.name || "CloudSaaS Platform")}
            </h2>
            <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              ${escapeHtml3(proj.tagline || "E-Commerce & Microservicios Cloud")}
            </p>
          </div>

          <!-- M\xE9tricas de Auditor\xEDa R\xE1pida -->
          <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">M\xF3dulos</div>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-base">${modules.length}</div>
            </div>
            <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Servicios Base</div>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-base">3 (DB, Cache, Queue)</div>
            </div>
            <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Auditor\xEDa</div>
              <div class="font-bold text-emerald-600 dark:text-emerald-400 text-base">verify.sh OK</div>
            </div>
          </div>
        </div>

        <!-- Descripci\xF3n del Proyecto y Objetivos -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          <div class="lg:col-span-2 space-y-3">
            <h3 class="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              ${Icons.folder} Prop\xF3sito y Alcance del Sistema
            </h3>
            <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              ${escapeHtml3(proj.description || "")}
            </p>
          </div>

          <div class="space-y-3 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6">
            <h3 class="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              ${Icons.check} Objetivos T\xE9cnicos & de Negocio
            </h3>
            <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              ${goals.map((g) => `
                <li class="flex items-start gap-2">
                  <span class="text-indigo-500 font-bold shrink-0 mt-0.5">\u25AA</span>
                  <span>${escapeHtml3(g)}</span>
                </li>
              `).join("")}
            </ul>
          </div>
        </div>
      </section>

      <!-- 2. DIAGRAMA VISUAL INTERACTIVO DE ARQUITECTURA -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                ${Icons.layers}
              </span>
              Diagrama de Arquitectura del Sistema
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Clean Architecture por capas con comunicaci\xF3n orientada a eventos (EDA) y persistencia distribuida
            </p>
          </div>

          <!-- Leyenda de Conexiones -->
          <div class="flex flex-wrap items-center gap-3 text-[11px] font-mono">
            <span class="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span class="w-3 h-0.5 bg-cyan-500 rounded"></span> S\xEDncrono (REST/HTTPS)
            </span>
            <span class="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span class="w-3 h-0.5 bg-indigo-500 rounded"></span> As\xEDncrono (Events / Colas)
            </span>
            <span class="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span class="w-3 h-0.5 bg-emerald-500 rounded"></span> Persistencia (ACID SQL)
            </span>
            <span class="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span class="w-3 h-0.5 bg-amber-500 rounded"></span> Cache / Locks (Redis)
            </span>
          </div>
        </div>

        <!-- Lienzo SVG del Diagrama de Arquitectura -->
        <div class="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/90 p-4 shadow-inner">
          <div class="min-w-[960px] max-w-5xl mx-auto py-4">
            
            <!-- CAPA 1: Clientes y Entrada Externa -->
            <div class="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs mb-6">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Capa 1: Clientes & Per\xEDmetro de Entrada
                </span>
                <span class="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
                  HTTPS / WSS / JSON
                </span>
              </div>
              <div class="grid grid-cols-4 gap-3">
                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <div class="text-base mb-1">\u{1F4BB}</div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Web App (SPA)</div>
                  <div class="text-[10px] text-slate-400">Dashboard & Cat\xE1logo</div>
                </div>
                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <div class="text-base mb-1">\u{1F4F1}</div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Mobile Client</div>
                  <div class="text-[10px] text-slate-400">Checkout & Tracking</div>
                </div>
                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <div class="text-base mb-1">\u{1F916}</div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Agentes de IA</div>
                  <div class="text-[10px] text-slate-400">Antigravity / SDD CLI</div>
                </div>
                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <div class="text-base mb-1">\u{1F4B3}</div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Webhooks Pasarela</div>
                  <div class="text-[10px] text-slate-400">Stripe / PSE Callbacks</div>
                </div>
              </div>
            </div>

            <!-- Flecha de Flujo 1 -> 2 -->
            <div class="flex justify-center -my-3 relative z-10">
              <div class="px-3 py-1 rounded-full bg-cyan-600 text-white font-mono text-[10px] font-bold shadow-md flex items-center gap-1">
                <span>\u2193 Tr\xE1fico HTTPS Seguro</span>
              </div>
            </div>

            <!-- CAPA 2: API Gateway & Edge -->
            <div class="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 shadow-xs my-6">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Capa 2: API Gateway, Enrutamiento & Seguridad Perimetral
                </span>
                <span class="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  Reverse Proxy + Auth Middleware
                </span>
              </div>
              <div class="grid grid-cols-3 gap-3 text-center">
                <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50">
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">\u{1F6E1}\uFE0F Rate Limiting & SSL</div>
                  <div class="text-[10px] text-slate-400">Protecci\xF3n DoS & TLS 1.3</div>
                </div>
                <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50">
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">\u{1F511} JWT Auth & RBAC</div>
                  <div class="text-[10px] text-slate-400">Middleware de firmas criptogr\xE1ficas</div>
                </div>
                <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50">
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">\u{1F500} Router & Circuit Breaker</div>
                  <div class="text-[10px] text-slate-400">Despacho hacia microservicios</div>
                </div>
              </div>
            </div>

            <!-- Flecha de Flujo 2 -> 3 -->
            <div class="flex justify-center -my-3 relative z-10">
              <div class="px-3 py-1 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold shadow-md flex items-center gap-1">
                <span>\u2193 Casos de Uso & Clean Core</span>
              </div>
            </div>

            <!-- CAPA 3: Dominios & Microservicios (Clean Core) -->
            <div class="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs my-6">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Capa 3: Dominios Funcionales & Microservicios (L\xF3gica de Negocio Pura)
                </span>
                <span class="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                  Clean Architecture
                </span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">auth</span>
                    <span class="text-[9px] font-mono bg-indigo-100 dark:bg-indigo-950/60 px-1 py-0.2 rounded text-indigo-700 dark:text-indigo-300">INT-002, 003</span>
                  </div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Auth & Roles</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">JWT, RBAC y expiraci\xF3n UTC</div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-cyan-600 dark:text-cyan-400">catalog</span>
                    <span class="text-[9px] font-mono bg-cyan-100 dark:bg-cyan-950/60 px-1 py-0.2 rounded text-cyan-700 dark:text-cyan-300">INT-004</span>
                  </div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Product Catalog</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">Cursor pagination & b\xFAsqueda</div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">cart</span>
                    <span class="text-[9px] font-mono bg-emerald-100 dark:bg-emerald-950/60 px-1 py-0.2 rounded text-emerald-700 dark:text-emerald-300">INT-005</span>
                  </div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Shopping Cart</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">Operaciones at\xF3micas Redis</div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-amber-600 dark:text-amber-400">billing</span>
                    <span class="text-[9px] font-mono bg-amber-100 dark:bg-amber-950/60 px-1 py-0.2 rounded text-amber-700 dark:text-amber-300">INT-006, 007</span>
                  </div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Payment Gateway</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">Stripe HMAC & redondeo contable</div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-purple-600 dark:text-purple-400">orders</span>
                    <span class="text-[9px] font-mono bg-purple-100 dark:bg-purple-950/60 px-1 py-0.2 rounded text-purple-700 dark:text-purple-300">INT-008</span>
                  </div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Order Worker</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">Consumidor de colas con DLQ</div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-rose-600 dark:text-rose-400">analytics</span>
                    <span class="text-[9px] font-mono bg-rose-100 dark:bg-rose-950/60 px-1 py-0.2 rounded text-rose-700 dark:text-rose-300">INT-009</span>
                  </div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Event Stream</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">M\xE9tricas Prometheus /metrics</div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-blue-600 dark:text-blue-400">notifications</span>
                    <span class="text-[9px] font-mono bg-blue-100 dark:bg-blue-950/60 px-1 py-0.2 rounded text-blue-700 dark:text-blue-300">INT-010</span>
                  </div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Notification Service</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">Emails transaccionales HTML seguros & retries SMTP</div>
                </div>
              </div>
            </div>

            <!-- Flecha de Flujo 3 -> 4 -->
            <div class="flex justify-center -my-3 relative z-10">
              <div class="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold shadow-md flex items-center gap-1">
                <span>\u2193 Persistencia, Cache & Colas de Mensajes</span>
              </div>
            </div>

            <!-- CAPA 4: Infraestructura, Datos & Mensajer\xEDa -->
            <div class="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xs mt-6">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Capa 4: Servicios de Persistencia, Cache Distribuido & Event Broker
                </span>
                <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  State & Messaging
                </span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- PostgreSQL -->
                <div class="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">\u{1F418}</span>
                    <div>
                      <div class="font-bold text-xs text-slate-900 dark:text-slate-100">PostgreSQL 16 Cluster</div>
                      <div class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Puerto 5432 \xB7 ACID Transaccional</div>
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    \xD3rdenes, usuarios, tablas de roles y cat\xE1logo. Versionado con migraciones deterministas y pool de conexiones.
                  </p>
                </div>

                <!-- Redis -->
                <div class="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">\u{1F534}</span>
                    <div>
                      <div class="font-bold text-xs text-slate-900 dark:text-slate-100">Redis 7.2 Distributed Cache</div>
                      <div class="text-[10px] font-mono text-amber-600 dark:text-amber-400">Puerto 6379 \xB7 In-Memory Key/Value</div>
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Cache de cat\xE1logo, sesiones vol\xE1tiles de carritos an\xF3nimos y cerrojos distribuidos (Redlock) para stock concurrente.
                  </p>
                </div>

                <!-- RabbitMQ / Kafka -->
                <div class="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">\u{1F407}</span>
                    <div>
                      <div class="font-bold text-xs text-slate-900 dark:text-slate-100">RabbitMQ / Kafka Broker</div>
                      <div class="text-[10px] font-mono text-purple-600 dark:text-purple-400">Puerto 5672 \xB7 Event Bus & DLQ</div>
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Colas as\xEDncronas para OrderFulfilled, webhooks entrantes y reintentos autom\xE1ticos con retroceso exponencial.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- 3. STACK DE TECNOLOG\xCDAS Y LIBRER\xCDAS -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              ${Icons.cpu}
            </span>
            Stack de Tecnolog\xEDas y Dependencias Identificadas
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Informaci\xF3n t\xE9cnica recolectada por la skill <code class="font-mono text-indigo-500">/technical-audit</code>
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Runtimes & Lenguajes -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3">
            <div class="flex items-center gap-2 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>\u26A1</span> Runtimes & Lenguajes
            </div>
            <div class="space-y-2.5">
              ${(tech.runtimes || []).map((r) => `
                <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span class="flex items-center gap-1.5">${r.icon || "\u25AA"} ${r.name}</span>
                    <span class="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">${r.version}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">${r.purpose}</div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Servicios & Bases de Datos -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3">
            <div class="flex items-center gap-2 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>\u{1F418}</span> Bases de Datos & Middleware
            </div>
            <div class="space-y-2.5">
              ${(tech.databases || []).map((db) => `
                <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span class="flex items-center gap-1.5">${db.icon || "\u25AA"} ${db.name}</span>
                    <span class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">:${db.port}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">${db.purpose}</div>
                </div>
              `).join("")}
              ${(tech.messaging || []).map((msg) => `
                <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span class="flex items-center gap-1.5">${msg.icon || "\u25AA"} ${msg.name}</span>
                    <span class="font-mono text-[10px] text-purple-600 dark:text-purple-400">:${msg.port}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">${msg.purpose}</div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Librer\xEDas & Paquetes Clave -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3 md:col-span-2 lg:col-span-1">
            <div class="flex items-center gap-2 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>\u{1F4E6}</span> Librer\xEDas & Frameworks Clave
            </div>
            <div class="space-y-2 max-h-[310px] overflow-y-auto pr-1">
              ${(tech.libraries || []).map((lib) => `
                <div class="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-800 dark:text-slate-200">${lib.name}</span>
                    <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">${lib.category}</span>
                  </div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">${lib.purpose}</div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </section>

      <!-- 4. ARQUITECTURA Y PATRONES DE DISE\xD1O -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              ${Icons.cube}
            </span>
            Patrones de Dise\xF1o & Decisiones Arquitecturales
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Estilo principal: <strong class="text-indigo-600 dark:text-indigo-400">${arch.style || "Clean Architecture + EDA"}</strong>
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${(arch.patterns || []).map((pat) => `
            <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-2">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-xs text-slate-900 dark:text-slate-100">${pat.name}</h4>
                <span class="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  ${pat.type}
                </span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ${pat.description}
              </p>
            </div>
          `).join("")}
        </div>
      </section>

      <!-- 5. M\xD3DULOS IDENTIFICADOS -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              ${Icons.folder}
            </span>
            M\xF3dulos del Sistema Identificados (${modules.length})
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            L\xEDmites de contexto (Bounded Contexts) y responsabilidades asignadas a cada m\xF3dulo
          </p>
        </div>

        <div class="space-y-4">
          ${modules.map((mod) => {
      const modFeatures = (mod.features || []).map((fIdStr) => {
        const numId = parseInt(fIdStr.replace("INT-", ""), 10);
        return featureMap.get(numId);
      }).filter(Boolean);
      const doneFeatures = modFeatures.filter((f) => f.status === "done").length;
      const progressPct = modFeatures.length ? Math.round(doneFeatures / modFeatures.length * 100) : 0;
      return `
              <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="flex items-center gap-2.5">
                    <span class="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                      \u{1F4C1}
                    </span>
                    <div>
                      <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>${mod.name}</span>
                        <code class="text-xs font-mono text-indigo-600 dark:text-indigo-400">[${mod.id}]</code>
                      </h4>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${mod.purpose}</p>
                    </div>
                  </div>

                  <!-- Progreso del M\xF3dulo -->
                  <div class="flex items-center gap-3">
                    <div class="text-right">
                      <div class="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">${doneFeatures}/${modFeatures.length} tareas resueltas</div>
                      <div class="text-[10px] text-slate-400">${progressPct}% completado</div>
                    </div>
                    <div class="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div class="h-full bg-indigo-500 rounded-full" style="width: ${progressPct}%"></div>
                    </div>
                  </div>
                </div>

                <!-- Responsabilidades -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                  <div>
                    <span class="font-mono font-bold text-[10px] uppercase text-slate-400">Responsabilidades Principales:</span>
                    <ul class="mt-1 space-y-1 text-slate-600 dark:text-slate-300">
                      ${(mod.responsibilities || []).map((r) => `
                        <li class="flex items-start gap-1.5">
                          <span class="text-indigo-500 font-bold shrink-0 mt-0.5">\u203A</span>
                          <span>${escapeHtml3(r)}</span>
                        </li>
                      `).join("")}
                    </ul>
                  </div>

                  <div>
                    <span class="font-mono font-bold text-[10px] uppercase text-slate-400">Stack Tecnol\xF3gico & Tareas Asignadas:</span>
                    <div class="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-1 mb-2">
                      ${escapeHtml3(mod.tech || "")}
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                      ${modFeatures.map((f) => `
                        <button type="button" 
                                data-action="view-detail" 
                                data-id="${f.id}" 
                                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                title="${f.title || f.name}">
                          <span class="w-1.5 h-1.5 rounded-full ${f.status === "done" ? "bg-emerald-400" : f.status === "in_progress" ? "bg-indigo-400" : "bg-slate-400"}"></span>
                          INT-${String(f.id).padStart(3, "0")}
                        </button>
                      `).join("")}
                    </div>
                  </div>
                </div>
              </div>
            `;
    }).join("")}
        </div>
      </section>

    </div>
  `;
  }
  function escapeHtml3(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function getFallbackSpec() {
    if (typeof window !== "undefined" && window.__FALLBACK_DATA__?.projectSpec) {
      return window.__FALLBACK_DATA__.projectSpec;
    }
    return {
      project: {
        name: "CloudSaaS Platform",
        tagline: "E-Commerce & Microservicios Cloud",
        description: "Plataforma SaaS integral de microservicios con arquitectura limpia y eventos.",
        version: "2.0.0",
        type: "Fullstack Microservices"
      },
      business_goals: [
        "Garantizar transacciones consistentes y at\xF3micas.",
        "Aislamiento estricto de dominios con Clean Architecture."
      ],
      tech_stack: {
        runtimes: [],
        databases: [],
        messaging: [],
        libraries: []
      },
      architecture: {
        style: "Clean Architecture + Event-Driven",
        layers: [],
        patterns: []
      },
      modules: []
    };
  }

  // project-docs/src/main.js
  var App = class {
    constructor() {
      this.root = document.getElementById("app");
      this.spaceView3D = new SpaceView3D();
      this.currentTreeComponent = null;
      this.activeTab = "features";
      this.envInfo = null;
      this.isAppMounted = false;
      this.searchDebounceTimer = null;
      this.autoSyncController = null;
      this.lastSyncTime = /* @__PURE__ */ new Date();
    }
    async init() {
      router.init((tabId) => {
        this.handleTabChange(tabId);
      });
      store.subscribe((state) => {
        this.handleStateChange(state);
      });
      this.bindGlobalEvents();
      await this.refreshData();
      this.initAutoSync();
    }
    initAutoSync() {
      if (this.autoSyncController) {
        this.autoSyncController.stop();
      }
      this.autoSyncController = api.startAutoSync({
        intervalMs: 2500,
        onUpdate: (freshData) => {
          this.lastSyncTime = /* @__PURE__ */ new Date();
          this.pulseSyncIndicator();
          store.setData(freshData);
        }
      });
    }
    pulseSyncIndicator() {
      const dot = document.getElementById("sync-status-dot");
      const timeEl = document.getElementById("sync-last-time");
      if (dot) {
        dot.classList.remove("bg-emerald-500");
        dot.classList.add("bg-cyan-400", "scale-125");
        setTimeout(() => {
          dot.classList.remove("bg-cyan-400", "scale-125");
          dot.classList.add("bg-emerald-500");
        }, 600);
      }
      if (timeEl) {
        timeEl.textContent = "Actualizado";
        setTimeout(() => {
          if (timeEl) timeEl.textContent = "En vivo";
        }, 1500);
      }
    }
    async refreshData() {
      store.setLoading(true);
      try {
        const data = await api.fetchAll({ bypassCache: true });
        this.envInfo = await detectEnvironment(data);
        this.lastSyncTime = /* @__PURE__ */ new Date();
        store.setData(data);
      } catch (err) {
        console.error("Error cargando datos del arn\xE9s:", err);
        store.setError(err.message || "Error al conectar con los datos del arn\xE9s");
      } finally {
        store.setLoading(false);
      }
    }
    handleTabChange(tabId) {
      if (this.activeTab === "three" && tabId !== "three") {
        this.spaceView3D.unmount();
      }
      this.activeTab = tabId;
      this.render();
    }
    handleStateChange(state) {
      const tableContainer = document.getElementById("feature-table-container");
      const paginationContainer = document.getElementById("feature-pagination-container");
      const isSearchFocused = document.activeElement && document.activeElement.id === "feature-search-input";
      if (this.isAppMounted && this.activeTab === "features" && tableContainer && paginationContainer && isSearchFocused) {
        const filteredFeatures = store.getFilteredFeatures();
        tableContainer.innerHTML = renderFeatureTable({
          features: filteredFeatures,
          pagination: state.pagination,
          onSelect: (f) => store.setSelectedFeature(f)
        });
        paginationContainer.innerHTML = renderFeaturePagination({
          totalItems: filteredFeatures.length,
          pagination: state.pagination
        });
        return;
      }
      this.render();
    }
    render() {
      if (!this.root) return;
      const activeElementId = document.activeElement?.id;
      const selectionStart = document.activeElement?.selectionStart;
      const selectionEnd = document.activeElement?.selectionEnd;
      const state = store.getState();
      const stats = store.getStats();
      const filteredFeatures = store.getFilteredFeatures();
      const modules = store.getAvailableModules();
      const isDark = state.theme === "dark";
      const activeAgent = this.envInfo?.activeAgent || { name: "Google Antigravity", icon: "\u26A1" };
      const stackInfo = this.envInfo?.stack || { name: "Multi-Stack Agnostico" };
      const isLocalFile = typeof window !== "undefined" && window.location.protocol === "file:";
      if (state.loading && state.features.length === 0) {
        this.root.innerHTML = `
        <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-6">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 class="text-xl font-bold tracking-tight">Cargando Antigravity AI Harness...</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">Sincronizando spec, tareas y branches</p>
        </div>
      `;
        return;
      }
      if (state.error && state.features.length === 0) {
        this.root.innerHTML = `
        <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-6">
          <div class="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
            ${Icons.clock}
          </div>
          <h2 class="text-xl font-bold text-rose-600 dark:text-rose-400">Error al inicializar el tablero</h2>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md text-center">${state.error}</p>
          <button type="button" data-action="refresh" class="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
            Reintentar
          </button>
        </div>
      `;
        return;
      }
      this.root.innerHTML = `
      <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors duration-200">
        
        <!-- Barra de Estado Superior -->
        <header class="border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md sticky top-0 z-30 transition-colors">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            <!-- Logo & Info del Proyecto -->
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <span class="font-mono font-black text-sm">AG</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-sm font-bold tracking-tight text-slate-900 dark:text-white">${escapeHtml4(state.project)}</h1>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold">
                    SDD 2.0
                  </span>
                </div>
                <div class="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Branch: <code class="text-indigo-600 dark:text-indigo-300 font-semibold">{type}/INT-{id}/{name}</code></span>
                  <span class="text-slate-300 dark:text-slate-700">\u2022</span>
                  <span class="hidden sm:inline">L\xEDmite: <strong class="text-slate-700 dark:text-slate-300">\u226480c</strong></span>
                </div>
              </div>
            </div>

            <!-- Chips de Agente, Stack y Auto-Sync -->
            <div class="hidden lg:flex items-center gap-2 text-xs">
              
              <!-- Badge de Auto-Sync Reactivo -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${isLocalFile ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300" : "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300"} shadow-xs"
                   title="${isLocalFile ? "Modo local file://. Usa abrir-tablero.bat para auto-sync HTTP." : "Auto-Sync activo: detecta cambios en feature_list.json y progres/ en vivo"}">
                <span id="sync-status-dot" class="w-2 h-2 rounded-full ${isLocalFile ? "bg-amber-500" : "bg-emerald-500 animate-pulse"} transition-all"></span>
                <span id="sync-last-time" class="font-mono text-[11px] font-semibold">${isLocalFile ? "file:// local" : "En vivo"}</span>
              </div>

              <!-- Agente Detectado -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 shadow-xs"
                   title="Agentes compatibles homologados: Google Antigravity, Open Code, GitHub Copilot, Claude Code, Codex">
                <span class="text-sm">${activeAgent.icon}</span>
                <span class="font-medium">${activeAgent.name}</span>
              </div>

              <!-- Stack Detectado -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs"
                   title="Stack tecnol\xF3gico detectado por technical-audit">
                <span class="text-slate-400">Stack:</span>
                <span class="font-semibold">${escapeHtml4(stackInfo.name)}</span>
              </div>
            </div>

            <!-- Controles: Modo Claro/Oscuro y Refrescar -->
            <div class="flex items-center gap-2">
              <!-- Switch Modo Claro/Oscuro -->
              <button type="button" 
                      data-action="toggle-theme" 
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all shadow-xs cursor-pointer select-none"
                      title="${isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}">
                <span class="text-amber-500 shrink-0">
                  ${isDark ? Icons.sun : Icons.moon}
                </span>
                <span class="hidden sm:inline">${isDark ? "Modo Claro" : "Modo Oscuro"}</span>
              </button>

              <!-- Bot\xF3n Refrescar -->
              <button type="button" 
                      data-action="refresh" 
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all shadow-xs cursor-pointer"
                      title="Refrescar datos del arn\xE9s ahora">
                <span class="shrink-0 ${state.loading ? "animate-spin" : ""}">${Icons.refresh}</span>
                <span class="hidden sm:inline">Refrescar</span>
              </button>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <!-- 1. KPI Stats Summary -->
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" class="sr-only">M\xE9tricas Generales</h2>
            ${renderStatsSummary(stats)}
          </section>

          <!-- 2. AI Active Execution Card -->
          <section aria-labelledby="active-spec-heading">
            <h2 id="active-spec-heading" class="sr-only">Ejecuci\xF3n Activa del Agente</h2>
            ${renderCurrentSpecCard(state.currentSpec)}
          </section>

          <!-- 3. Navegaci\xF3n por pesta\xF1as (Router) -->
          <nav class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3 overflow-x-auto" aria-label="Vistas del tablero">
            ${renderTabButton({ id: "features", label: "Tareas y Bugfixes", icon: Icons.folder, active: this.activeTab === "features", badge: String(state.features.length) })}
            ${renderTabButton({ id: "architecture", label: "Arquitectura & Stack", icon: Icons.layers, active: this.activeTab === "architecture" })}
            ${renderTabButton({ id: "graph", label: "Grafo Visual DAG", icon: Icons.gitBranch, active: this.activeTab === "graph" })}
            ${renderTabButton({ id: "tree", label: "\xC1rbol Jer\xE1rquico", icon: Icons.check, active: this.activeTab === "tree" })}
            ${renderTabButton({ id: "three", label: "Constelaci\xF3n 3D", icon: Icons.eye, active: this.activeTab === "three" })}
            ${renderTabButton({ id: "history", label: "Bit\xE1cora Hist\xF3rica", icon: Icons.clock, active: this.activeTab === "history", badge: String(state.history?.records?.length || 0) })}
          </nav>

          <!-- 4. Contenido Din\xE1mico de la Pesta\xF1a -->
          <section id="tab-content" class="min-h-[420px]">
            ${this.renderActiveTabContent({ state, filteredFeatures, modules })}
          </section>
        </main>

        <!-- Modal de Detalle -->
        <div id="modal-container">
          ${renderModal(state.selectedFeature)}
        </div>
      </div>
    `;
      this.isAppMounted = true;
      this.postRender({ state, filteredFeatures });
      if (activeElementId && activeElementId === "feature-search-input") {
        requestAnimationFrame(() => {
          const input = document.getElementById("feature-search-input");
          if (input) {
            input.focus();
            if (typeof selectionStart === "number" && typeof selectionEnd === "number") {
              input.setSelectionRange(selectionStart, selectionEnd);
            }
          }
        });
      }
    }
    renderActiveTabContent({ state, filteredFeatures, modules }) {
      switch (this.activeTab) {
        case "features":
          return `
          <div class="space-y-6">
            <div id="feature-filters-container">
              ${renderFeatureFilters({ filters: state.filters, modules })}
            </div>
            <div id="feature-table-container">
              ${renderFeatureTable({
            features: filteredFeatures,
            pagination: state.pagination,
            onSelect: (f) => store.setSelectedFeature(f)
          })}
            </div>
            <div id="feature-pagination-container">
              ${renderFeaturePagination({
            totalItems: filteredFeatures.length,
            pagination: state.pagination
          })}
            </div>
          </div>
        `;
        case "architecture":
          return renderArchitectureDocs({
            projectSpec: state.projectSpec,
            features: state.features
          });
        case "graph":
          return renderDependencyGraph({
            features: state.features
          });
        case "tree":
          return `<div id="tree-mount-target" class="w-full"></div>`;
        case "three":
          return `<div id="three-mount-target" class="w-full"></div>`;
        case "history":
          return renderHistoryTimeline({
            history: state.history,
            features: state.features
          });
        default:
          return `<div class="p-8 text-center text-slate-500">Pesta\xF1a no encontrada.</div>`;
      }
    }
    postRender({ state, filteredFeatures }) {
      if (this.activeTab === "tree") {
        const treeTarget = document.getElementById("tree-mount-target");
        if (treeTarget) {
          this.currentTreeComponent = new DependencyTreeComponent(treeTarget, {
            features: state.features,
            currentSpec: state.currentSpec,
            onSelect: (f) => store.setSelectedFeature(f)
          });
          this.currentTreeComponent.render();
        }
      } else if (this.activeTab === "three") {
        const threeTarget = document.getElementById("three-mount-target");
        if (threeTarget) {
          this.spaceView3D.mount(threeTarget, {
            features: state.features,
            onSelect: (f) => store.setSelectedFeature(f)
          });
        }
      } else if (this.activeTab === "graph") {
        this.bindGraphHoverEvents();
      }
    }
    bindGraphHoverEvents() {
      const nodes = document.querySelectorAll("[data-graph-node]");
      const edges = document.querySelectorAll(".graph-edge");
      nodes.forEach((node) => {
        node.addEventListener("mouseenter", () => {
          const nodeId = parseInt(node.getAttribute("data-graph-node"), 10);
          const nodeDeps = (node.getAttribute("data-deps") || "").split(",").filter(Boolean).map(Number);
          nodes.forEach((n) => n.classList.add("opacity-30"));
          edges.forEach((e) => e.classList.add("opacity-10"));
          node.classList.remove("opacity-30");
          node.classList.add("scale-105", "ring-2", "ring-indigo-500");
          nodeDeps.forEach((depId) => {
            const depEl = document.querySelector(`[data-graph-node="${depId}"]`);
            if (depEl) {
              depEl.classList.remove("opacity-30");
              depEl.classList.add("ring-2", "ring-amber-500");
            }
            const edge = document.querySelector(`[data-edge-from="${depId}"][data-edge-to="${nodeId}"]`);
            if (edge) {
              edge.classList.remove("opacity-10");
              edge.setAttribute("stroke-width", "4");
              edge.setAttribute("opacity", "1");
            }
          });
          document.querySelectorAll(`.graph-edge[data-edge-from="${nodeId}"]`).forEach((edge) => {
            edge.classList.remove("opacity-10");
            edge.setAttribute("stroke-width", "4");
            edge.setAttribute("opacity", "1");
            const toId = edge.getAttribute("data-edge-to");
            const toEl = document.querySelector(`[data-graph-node="${toId}"]`);
            if (toEl) {
              toEl.classList.remove("opacity-30");
              toEl.classList.add("ring-2", "ring-cyan-500");
            }
          });
        });
        node.addEventListener("mouseleave", () => {
          nodes.forEach((n) => n.classList.remove("opacity-30", "scale-105", "ring-2", "ring-indigo-500", "ring-amber-500", "ring-cyan-500"));
          edges.forEach((e) => {
            e.classList.remove("opacity-10");
            e.setAttribute("stroke-width", "2.2");
            e.setAttribute("opacity", "0.75");
          });
        });
      });
    }
    bindGlobalEvents() {
      document.addEventListener("click", (e) => {
        const themeBtn = e.target.closest('[data-action="toggle-theme"]');
        if (themeBtn) {
          store.toggleTheme();
          return;
        }
        const tabBtn = e.target.closest("[data-tab]");
        if (tabBtn) {
          const tabId = tabBtn.getAttribute("data-tab");
          router.navigate(tabId);
          return;
        }
        const refreshBtn = e.target.closest('[data-action="refresh"]');
        if (refreshBtn) {
          this.refreshData();
          return;
        }
        const graphNode = e.target.closest("[data-graph-node]");
        if (graphNode) {
          const id = parseInt(graphNode.getAttribute("data-graph-node"), 10);
          const feature = store.getState().features.find((f) => f.id === id);
          if (feature) store.setSelectedFeature(feature);
          return;
        }
        const viewDetailBtn = e.target.closest('[data-action="view-detail"]');
        if (viewDetailBtn) {
          const id = parseInt(viewDetailBtn.getAttribute("data-id"), 10);
          const feature = store.getState().features.find((f) => f.id === id);
          if (feature) store.setSelectedFeature(feature);
          return;
        }
        const tableRow = e.target.closest("tr[data-feature-id]");
        if (tableRow && !e.target.closest("button")) {
          const id = parseInt(tableRow.getAttribute("data-feature-id"), 10);
          const feature = store.getState().features.find((f) => f.id === id);
          if (feature) store.setSelectedFeature(feature);
          return;
        }
        const closeModalBtn = e.target.closest('[data-action="close-modal"]');
        if (closeModalBtn) {
          store.setSelectedFeature(null);
          return;
        }
        const pageBtn = e.target.closest("[data-page]");
        if (pageBtn) {
          const page = parseInt(pageBtn.getAttribute("data-page"), 10);
          if (!isNaN(page) && page > 0) {
            store.setPage(page);
          }
          return;
        }
        const resetFiltersBtn = e.target.closest('[data-action="reset-filters"]');
        if (resetFiltersBtn) {
          const searchInput = document.getElementById("feature-search-input");
          if (searchInput) searchInput.value = "";
          store.resetFilters();
          return;
        }
      });
      document.addEventListener("input", (e) => {
        if (e.target.id === "feature-search-input") {
          clearTimeout(this.searchDebounceTimer);
          const val = e.target.value;
          this.searchDebounceTimer = setTimeout(() => {
            store.setFilter("search", val);
          }, 260);
        }
      });
      document.addEventListener("change", (e) => {
        if (e.target.id === "filter-type") {
          store.setFilter("type", e.target.value);
        } else if (e.target.id === "filter-status") {
          store.setFilter("status", e.target.value);
        } else if (e.target.id === "filter-module") {
          store.setFilter("module", e.target.value);
        } else if (e.target.id === "filter-priority") {
          store.setFilter("priority", e.target.value);
        } else if (e.target.id === "page-size-select") {
          store.setPageSize(parseInt(e.target.value, 10));
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && store.getState().selectedFeature) {
          store.setSelectedFeature(null);
        }
      });
    }
  };
  function escapeHtml4(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  document.addEventListener("DOMContentLoaded", () => {
    const app = new App();
    app.init();
  });
})();
