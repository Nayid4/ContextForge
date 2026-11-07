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
    knowledgeIndex: null,
    activeTab: "features",
    // 'features' | 'architecture' | 'knowledge' | 'graph' | 'tree' | 'three' | 'history'
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
    loading: true,
    // Plane Architecture & Multi-View State
    layoutMode: typeof window !== "undefined" && window.location?.hash?.includes("plane") ? "plane" : "legacy",
    planeData: { workspace: null, project: null, states: [], cycles: [], modules: [], issues: [], pages: [] },
    planeView: "issues",
    // 'issues' | 'cycles' | 'modules' | 'pages' | 'analytics' | 'space3d' | 'depgraph'
    planeViewMode: "list",
    // 'list' | 'board' | 'calendar' | 'spreadsheet'
    planeFilterState: "all",
    planeFilterPriority: "all",
    planeFilterAssignee: "all",
    planeGroupBy: "state",
    // 'state' | 'priority' | 'assignee'
    planeOrderBy: "sequence",
    planeSearchQuery: "",
    planePageSearchQuery: "",
    planeActivePageId: null,
    planeActivePageContent: "",
    planePageEditorMode: "reader",
    // 'reader' | 'editor'
    planeSelectedIssueId: null,
    isSidebarCollapsed: false
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
    setData({ project, features, currentSpec, historyData, projectSpec, knowledgeIndex }) {
      const featList = Array.isArray(features) ? features : [];
      const pageSize = this.state.pagination.pageSize || 10;
      const totalPages = Math.ceil(featList.length / pageSize) || 1;
      let mergedKIndex = knowledgeIndex || this.state.knowledgeIndex || null;
      if (mergedKIndex && typeof localStorage !== "undefined") {
        try {
          const customDocs = JSON.parse(localStorage.getItem("harness_custom_docs") || "{}");
          if (Object.keys(customDocs).length > 0) {
            mergedKIndex = {
              ...mergedKIndex,
              docs: { ...mergedKIndex.docs || {}, ...customDocs }
            };
          }
        } catch (_) {
        }
      }
      this.setState({
        project: project || this.state.project,
        features: featList,
        currentSpec: currentSpec || {},
        history: historyData || { records: [] },
        historyData: historyData || { records: [] },
        projectSpec: projectSpec || this.state.projectSpec || null,
        knowledgeIndex: mergedKIndex,
        pagination: {
          ...this.state.pagination,
          totalPages
        },
        loading: false,
        error: null
      });
    }
    saveDoc(key, content) {
      const kIndex = this.state.knowledgeIndex ? { ...this.state.knowledgeIndex } : { docs: {} };
      if (!kIndex.docs) kIndex.docs = {};
      kIndex.docs[key] = content;
      if (typeof localStorage !== "undefined") {
        try {
          const customDocs = JSON.parse(localStorage.getItem("harness_custom_docs") || "{}");
          customDocs[key] = content;
          localStorage.setItem("harness_custom_docs", JSON.stringify(customDocs));
        } catch (_) {
        }
      }
      this.setState({ knowledgeIndex: { ...kIndex } });
    }
    deleteDoc(key) {
      const kIndex = this.state.knowledgeIndex ? { ...this.state.knowledgeIndex } : { docs: {} };
      if (kIndex.docs && kIndex.docs[key]) {
        delete kIndex.docs[key];
      }
      if (typeof localStorage !== "undefined") {
        try {
          const customDocs = JSON.parse(localStorage.getItem("harness_custom_docs") || "{}");
          delete customDocs[key];
          localStorage.setItem("harness_custom_docs", JSON.stringify(customDocs));
        } catch (_) {
        }
      }
      this.setState({ knowledgeIndex: { ...kIndex } });
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
    if (typeof window !== "undefined" && window.location?.protocol === "file:") {
      const fallback = window.__FALLBACK_DATA__ || {};
      const fData = fallback.featureList || { project: "Proyecto (Modo Local)", features: [] };
      return {
        project: fData.project || "Proyecto",
        features: Array.isArray(fData.features) ? fData.features : [],
        currentSpec: fallback.currentSpec || {},
        historyData: fallback.historyData || { records: [] },
        projectSpec: fallback.projectSpec || null,
        knowledgeIndex: fallback.knowledgeIndex || null,
        protocol: "file:"
      };
    }
    let featureData = null;
    let currentSpec = {};
    let historyData = { records: [] };
    let projectSpec = null;
    let knowledgeIndex = null;
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
    const knowledgePaths = [
      `knowledge/knowledge-index.json${cacheBuster}`,
      `../knowledge/knowledge-index.json${cacheBuster}`,
      `./project-docs/knowledge/knowledge-index.json${cacheBuster}`
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
    for (const path of knowledgePaths) {
      try {
        const res = await fetch(path, fetchOpts);
        if (res.ok) {
          knowledgeIndex = await res.json();
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
      knowledgeIndex = window.__FALLBACK_DATA__.knowledgeIndex || null;
    }
    if (!projectSpec && typeof window !== "undefined" && window.__FALLBACK_DATA__?.projectSpec) {
      projectSpec = window.__FALLBACK_DATA__.projectSpec;
    }
    if (!knowledgeIndex && typeof window !== "undefined" && window.__FALLBACK_DATA__?.knowledgeIndex) {
      knowledgeIndex = window.__FALLBACK_DATA__.knowledgeIndex;
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
      knowledgeIndex,
      protocol: typeof window !== "undefined" ? window.location?.protocol || "http:" : "http:"
    };
  }
  function startAutoSync({ onUpdate, intervalMs = 2500 } = {}) {
    if (typeof window !== "undefined" && window.location?.protocol === "file:") {
      return {
        stop: () => {
        }
      };
    }
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
  async function fetchPlaneData(options = {}) {
    if (typeof window !== "undefined" && window.location?.protocol === "file:") {
      const fallback = window.__PLANE_DATA__ || window.__FALLBACK_DATA__ && window.__FALLBACK_DATA__.planeData || {};
      return fallback;
    }
    try {
      const res = await fetch("/api/plane/data");
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {
    }
    return window.__PLANE_DATA__ || window.__FALLBACK_DATA__ && window.__FALLBACK_DATA__.planeData || {};
  }
  async function updatePlaneIssue(issueId, updates = {}) {
    if (typeof window !== "undefined" && window.location?.protocol === "file:") {
      if (window.__PLANE_DATA__ && Array.isArray(window.__PLANE_DATA__.issues)) {
        const issue = window.__PLANE_DATA__.issues.find((i) => i.id === issueId);
        if (issue) Object.assign(issue, updates);
      }
      return { ok: true };
    }
    try {
      const res = await fetch(`/api/plane/issues/${encodeURIComponent(issueId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("[API] Error actualizando issue:", e);
    }
    return { ok: false };
  }
  async function updatePlanePage(pageId, markdownContent) {
    if (typeof window !== "undefined" && window.location?.protocol === "file:") {
      if (window.__PLANE_DATA__ && Array.isArray(window.__PLANE_DATA__.pages)) {
        const page = window.__PLANE_DATA__.pages.find((p) => p.id === pageId);
        if (page) page.content_markdown = markdownContent;
      }
      return { ok: true };
    }
    try {
      const res = await fetch(`/api/plane/pages/${encodeURIComponent(pageId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_markdown: markdownContent })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("[API] Error actualizando p\xE1gina:", e);
    }
    return { ok: false };
  }
  var api = {
    fetchAll: fetchProjectData,
    fetchPlaneData,
    updatePlaneIssue,
    updatePlanePage,
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
        iconName: "zap",
        color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
        paths: [".agents/rules/antigravity-harness.md", ".agents/ANTIGRAVITY.md", "ANTIGRAVITY.md", ".agents/agents/leader.md"]
      },
      {
        id: "opencode",
        name: "Open Code",
        badge: "OpenCode SDD",
        iconName: "code",
        color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
        paths: ["opencode.json", ".opencode/rules/commits.md"]
      },
      {
        id: "copilot",
        name: "GitHub Copilot",
        badge: "Copilot Chat",
        iconName: "bot",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
        paths: [".github/instructions/commits.instructions.md", ".github/copilot-instructions.md", ".github/skills/"]
      },
      {
        id: "claude",
        name: "Claude Code",
        badge: "Claude SDD",
        iconName: "cpu",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        paths: ["CLAUDE.md", ".claude/", ".claude.json"]
      },
      {
        id: "codex",
        name: "Codex / OpenAI",
        badge: "Codex Engine",
        iconName: "terminal",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        paths: [".codex/", ".openai/"]
      }
    ];
    const isFileProtocol = typeof window !== "undefined" && window.location?.protocol === "file:";
    for (const check of agentChecks) {
      let detected = false;
      if (!isFileProtocol) {
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
      iconName: "zap",
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
    };
    const rawExecutor = projectData?.currentSpec?.responsable || projectData?.currentSpec?.executor || "";
    const currentExecutor = typeof rawExecutor === "string" ? rawExecutor : rawExecutor?.name || rawExecutor?.role || "";
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
    if (!isFileProtocol) {
      try {
        let yamlRes = await fetch("project-docs/project-spec.yaml");
        if (!yamlRes.ok) {
          yamlRes = await fetch("/project-docs/project-spec.yaml");
        }
        if (!yamlRes.ok) {
          yamlRes = await fetch("project-spec.yaml");
        }
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
    <svg class="${cls}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      ${svgInner}
    </svg>`.trim();
    fn.toString = () => fn(defaultCls);
    return fn;
  }
  var Icons = {
    // General & Acciones
    check: createIcon('<path d="M5 13l4 4L19 7"/>'),
    checkCircle: createIcon('<circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>'),
    clock: createIcon('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
    spinner: createIcon(`
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  `, "w-4 h-4 animate-spin"),
    plus: createIcon('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
    minus: createIcon('<line x1="5" y1="12" x2="19" y2="12"/>'),
    download: createIcon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
    upload: createIcon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'),
    trash: createIcon('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
    edit: createIcon('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'),
    copy: createIcon('<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    save: createIcon('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>'),
    refresh: createIcon('<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>'),
    close: createIcon('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
    search: createIcon('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>'),
    eye: createIcon('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: createIcon('<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'),
    filter: createIcon('<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>'),
    share: createIcon('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>'),
    externalLink: createIcon('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'),
    // Navegación & Flechas
    chevronLeft: createIcon('<polyline points="15 18 9 12 15 6"/>'),
    chevronRight: createIcon('<polyline points="9 18 15 12 9 6"/>'),
    chevronUp: createIcon('<polyline points="18 15 12 9 6 15"/>'),
    chevronDown: createIcon('<polyline points="6 9 12 15 18 9"/>'),
    arrowLeft: createIcon('<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>'),
    arrowRight: createIcon('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
    // Alertas & Notificaciones
    alert: createIcon('<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>'),
    alertTriangle: createIcon('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
    alertCircle: createIcon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'),
    xCircle: createIcon('<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'),
    info: createIcon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'),
    lightbulb: createIcon('<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/>'),
    zap: createIcon('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
    // Sistema, Arquitectura & Código
    branch: createIcon('<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>'),
    gitBranch: createIcon('<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>'),
    gitTree: createIcon('<path d="M4 6h16M4 12h16M4 18h7"/>'),
    cube: createIcon('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'),
    layers: createIcon('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'),
    database: createIcon('<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>'),
    server: createIcon('<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>'),
    cpu: createIcon('<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>'),
    code: createIcon('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
    terminal: createIcon('<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>'),
    shield: createIcon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
    bot: createIcon('<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/>'),
    layout: createIcon('<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>'),
    grid: createIcon('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'),
    table: createIcon('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="12" y1="3" x2="12" y2="21"/>'),
    activity: createIcon('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'),
    scale: createIcon('<line x1="12" y1="3" x2="12" y2="21"/><path d="M4 7l4 8h-8l4-8z"/><path d="M20 7l4 8h-8l4-8z"/>'),
    architecture: createIcon('<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>'),
    network: createIcon('<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M5 16v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><line x1="12" y1="8" x2="12" y2="11"/>'),
    box: createIcon('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>'),
    // Documentos, Biblioteca & Texto
    folder: createIcon('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'),
    book: createIcon('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
    bookOpen: createIcon('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
    file: createIcon('<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>'),
    fileText: createIcon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'),
    star: createIcon('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
    tag: createIcon('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'),
    sparkles: createIcon('<path d="M12 3l1.912 5.885L20 10.8l-4.756 3.657L16.824 21 12 17.273 7.176 21l1.58-6.543L4 10.8l6.088-1.915L12 3z"/>'),
    sun: createIcon('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'),
    moon: createIcon('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
    // Plane-Inspired Project Management Icons
    kanban: createIcon('<rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/>'),
    calendar: createIcon('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
    cycle: createIcon('<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'),
    moduleIcon: createIcon('<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>'),
    page: createIcon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
    priorityUrgent: createIcon('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'),
    priorityHigh: createIcon('<line x1="6" y1="18" x2="6" y2="10"/><line x1="12" y1="18" x2="12" y2="6"/><line x1="18" y1="18" x2="18" y2="2"/>'),
    priorityMedium: createIcon('<line x1="6" y1="18" x2="6" y2="14"/><line x1="12" y1="18" x2="12" y2="10"/><line x1="18" y1="18" x2="18" y2="10"/>'),
    priorityLow: createIcon('<line x1="6" y1="18" x2="6" y2="16"/><line x1="12" y1="18" x2="12" y2="16"/><line x1="18" y1="18" x2="18" y2="16"/>'),
    menu: createIcon('<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>'),
    dotsHorizontal: createIcon('<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'),
    user: createIcon('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>')
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
  function escapeHtml(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function renderModal(feature) {
    if (!feature) {
      return `<div id="modal-container"></div>`;
    }
    const branchName = feature.branch || `${feature.type || "feature"}/INT-${String(feature.id).padStart(3, "0")}/${feature.name}`;
    const branchLength = branchName.length;
    const isBranchLengthOk = branchLength <= 80;
    const userStoryHtml = feature.user_story ? `
      <div class="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
        <div class="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <span class="w-4 h-4 shrink-0">${Icons.sparkles}</span>
          <span>Historia de Usuario (Scrum)</span>
        </div>
        <div class="space-y-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
          <p><strong class="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[11px] mr-1">Como</strong> ${escapeHtml(feature.user_story.as_a)},</p>
          <p><strong class="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[11px] mr-1">Quiero</strong> ${escapeHtml(feature.user_story.i_want)},</p>
          <p><strong class="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[11px] mr-1">Para</strong> ${escapeHtml(feature.user_story.so_that)}.</p>
        </div>
      </div>` : "";
    const subtasksHtml = feature.subtasks && feature.subtasks.length ? `
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span class="text-indigo-600 dark:text-indigo-400 shrink-0">${Icons.layers}</span> Subtareas Jira (${feature.subtasks.length})
          </h4>
          <span class="text-[11px] text-slate-500 font-mono">Pistas DEV & QA</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${feature.subtasks.map((st) => {
      const isDev = st.type === "development";
      const isDone = st.status === "done";
      const isInProgress = st.status === "in_progress";
      const badgeClass = isDone ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800" : isInProgress ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
      const statusText = isDone ? "Done" : isInProgress ? "In Progress" : "To Do";
      const itemsList = isDev ? st.tasks || [] : st.test_cases || [];
      return `
              <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-1.5">
                    <span class="inline-flex items-center gap-1 font-mono text-[11px] font-bold ${isDev ? "text-indigo-600 dark:text-indigo-400" : "text-amber-600 dark:text-amber-400"}">
                      <span>${isDev ? "[DEV]" : "[QA]"}</span>
                      <span>${st.id}</span>
                    </span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${badgeClass}">
                      ${statusText}
                    </span>
                  </div>
                  <h5 class="text-xs font-semibold text-slate-900 dark:text-slate-200 mb-1.5 leading-snug">
                    ${escapeHtml(st.title)}
                  </h5>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    <span>Responsable: <strong class="text-slate-700 dark:text-slate-300 font-mono">${st.assignee || (isDev ? "implementer" : "reviewer")}</strong></span>
                  </div>
                  ${itemsList.length ? `
                    <ul class="space-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                      ${itemsList.map((item) => {
        const done = item.done || item.status === "passed";
        return `
                          <li class="flex items-start gap-1.5 ${done ? "line-through opacity-75 text-emerald-600 dark:text-emerald-400" : ""}">
                            <span class="shrink-0 font-mono text-[11px] font-bold ${done ? "text-emerald-600" : "text-slate-400"}">${done ? Icons.check("w-3 h-3") : "\u25CB"}</span>
                            <span class="text-[11px] leading-tight">${escapeHtml(item.title)}</span>
                          </li>
                        `;
      }).join("")}
                    </ul>
                  ` : ""}
                </div>
              </div>
            `;
    }).join("")}
        </div>
      </div>` : "";
    const dodHtml = feature.definition_of_done && feature.definition_of_done.length ? `
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <span class="text-emerald-600 dark:text-emerald-400 shrink-0">${Icons.shield}</span> Definition of Done (DoD - ${feature.definition_of_done.length})
        </h4>
        <ul class="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          ${feature.definition_of_done.map((d) => `
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">${Icons.check("w-3.5 h-3.5")}</span>
              <span>${escapeHtml(d)}</span>
            </li>`).join("")}
        </ul>
      </div>` : "";
    const acceptanceHtml = feature.acceptance && feature.acceptance.length ? `
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Criterios de Aceptaci\xF3n (${feature.acceptance.length})</h4>
        <ul class="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          ${feature.acceptance.map((a) => `
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">${Icons.check("w-3.5 h-3.5")}</span>
              <span>${escapeHtml(a)}</span>
            </li>`).join("")}
        </ul>
      </div>` : "";
    const evidenceHtml = feature.evidence ? `
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span class="text-indigo-600 dark:text-indigo-400 shrink-0">${Icons.terminal}</span> Evidencias de Pruebas y Cierre
          </h4>
          ${feature.evidence.completed_at ? `<span class="text-[11px] text-slate-500 font-mono">${escapeHtml(feature.evidence.completed_at)}</span>` : ""}
        </div>
        
        ${feature.evidence.dev_summary ? `
          <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mb-2.5">
            <strong class="text-slate-900 dark:text-slate-200">Resumen de Implementaci\xF3n:</strong>
            <p class="mt-0.5 leading-relaxed">${escapeHtml(feature.evidence.dev_summary)}</p>
          </div>
        ` : ""}

        ${feature.evidence.tests_executed && feature.evidence.tests_executed.length ? `
          <div class="mb-3">
            <span class="text-[11px] font-semibold uppercase text-slate-500 block mb-1">Pruebas Ejecutadas:</span>
            <div class="flex flex-wrap gap-1.5">
              ${feature.evidence.tests_executed.map((t) => `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span>${Icons.check("w-3 h-3")}</span>
                  <span>${escapeHtml(t)}</span>
                </span>
              `).join("")}
            </div>
          </div>
        ` : ""}

        ${feature.evidence.screenshots && feature.evidence.screenshots.length ? `
          <div>
            <span class="text-[11px] font-semibold uppercase text-slate-500 block mb-1.5">Capturas de Pantalla (${feature.evidence.screenshots.length}):</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${feature.evidence.screenshots.map((sc) => `
                <div class="group relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 shadow-xs">
                  <a href="${sc.path}" target="_blank" rel="noopener noreferrer" class="block aspect-video overflow-hidden">
                    <img src="${sc.path}" alt="${escapeHtml(sc.caption || sc.name)}" class="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-200" loading="lazy" />
                  </a>
                  <div class="p-1.5 text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 truncate" title="${escapeHtml(sc.caption || sc.name)}">
                    ${escapeHtml(sc.caption || sc.name)}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}
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
              ${escapeHtml(feature.title || feature.name)}
            </h3>
          </div>
          <button type="button" data-action="close-modal" class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="Cerrar modal (Esc)">
            ${Icons.close("w-4 h-4")}
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-5 overflow-y-auto space-y-4 text-slate-700 dark:text-slate-300">
          <!-- Scrum User Story -->
          ${userStoryHtml}

          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Descripci\xF3n</h4>
            <p class="text-sm leading-relaxed text-slate-800 dark:text-slate-200">${escapeHtml(feature.description || "Sin descripci\xF3n detallada.")}</p>
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
                ${escapeHtml(feature.spec_folder)}
              </p>
            </div>` : ""}

          <!-- Subtareas Jira DEV / QA -->
          ${subtasksHtml}

          <!-- Definition of Done (DoD) -->
          ${dodHtml}

          <!-- Acceptance Criteria -->
          ${acceptanceHtml}

          <!-- Evidencias de Pruebas y Screenshots -->
          ${evidenceHtml}

          <!-- Dependencias -->
          ${depsHtml}

          ${feature.documentation && feature.documentation.length ? `
            <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Documentaci\xF3n</h4>
              <div class="flex flex-wrap gap-1 text-xs font-mono">
                ${feature.documentation.map((d) => `<span class="bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800">${escapeHtml(d)}</span>`).join("")}
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
          <div class="flex items-center gap-2 pt-1 flex-wrap">
            <span class="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              ${branchName}
            </span>
            ${specFeature.module ? Badge({ type: "module", value: specFeature.module }) : ""}
            ${specFeature.priority ? Badge({ type: "priority", value: specFeature.priority }) : ""}
            ${specFeature.subtasks && specFeature.subtasks.length ? `
              <span class="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <span>Subtarea:</span>
                <span>${specFeature.subtasks.find((st) => st.status === "in_progress")?.id || specFeature.subtasks[0].id}</span>
              </span>
            ` : ""}
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
            ${escapeHtml2(f.title || f.name)}
          </div>
          ${f.description ? `<p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">${escapeHtml2(f.description)}</p>` : ""}
          ${f.subtasks && f.subtasks.length ? `
            <div class="flex items-center gap-1.5 mt-1.5">
              ${f.subtasks.map((st) => {
        const isDev = st.type === "development";
        const isDone = st.status === "done";
        const isInProgress = st.status === "in_progress";
        const color = isDone ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" : isInProgress ? "text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800" : "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
        const iconHtml = isDone ? Icons.check("w-2.5 h-2.5") : isInProgress ? '<span class="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>' : '<span class="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>';
        return `
                  <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border font-semibold ${color}" title="${escapeHtml2(st.title)}">
                    <span>${isDev ? "DEV" : "QA"}</span>
                    <span class="shrink-0 flex items-center">${iconHtml}</span>
                  </span>
                `;
      }).join("")}
            </div>
          ` : ""}
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
  function escapeHtml2(text) {
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
                ${sub.done ? Icons.check("w-2.5 h-2.5") : "\u25CB"}
              </span>
              <span class="truncate text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
                ${escapeHtml3(sub.name)}
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
                    ${escapeHtml3(f.title || f.name)}
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
                  ${Icons.folder("w-3.5 h-3.5")}
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
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer">
              ${Icons.folder("w-3.5 h-3.5")} <span>Solo M\xF3dulos</span>
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
                  ${Icons.cube("w-5 h-5")}
                </div>
                <div>
                  <div class="text-[11px] font-mono uppercase tracking-wider text-indigo-200 font-bold">Nodo Ra\xEDz (Nivel 0)</div>
                  <h2 class="text-lg font-bold tracking-tight">${escapeHtml3(projectName)}</h2>
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
  function escapeHtml3(text) {
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
      this.pyramidGuides = [];
      this.flowParticles = [];
      this.labelSprites = [];
      this.raycaster = null;
      this.mouse = null;
      this.isDragging = false;
      this.prevMousePos = { x: 0, y: 0 };
      this.rotation = { x: 0.22, y: 0.45 };
      this.targetRotation = { x: 0.22, y: 0.45 };
      this.hoveredMesh = null;
      this.hudElement = null;
    }
    mount(containerEl, { features, onSelect }) {
      this.container = containerEl;
      this.features = features || [];
      this.onSelect = onSelect;
      if (!window.THREE) {
        this.container.innerHTML = `
        <div class="h-[650px] flex items-center justify-center bg-slate-900 text-slate-400 rounded-3xl border border-slate-800">
          <p class="font-mono text-sm">Librer\xEDa Three.js no disponible.</p>
        </div>
      `;
        return;
      }
      this.container.innerHTML = `
      <div class="relative w-full h-[720px] bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl select-none">
        
        <!-- HUD Superior: Indicador Piramidal -->
        <div class="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-2">
          <span class="px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs backdrop-blur-md shadow-xl flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <strong>Jerarqu\xEDa Piramidal 3D</strong> \u2022 \xC1pice (Entrada) \u2192 Base (Persistencia)
          </span>
          <span class="px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            Arrastra para orbitar la pir\xE1mide \u2022 Clic en nodo para enfocar
          </span>
        </div>

        <!-- Leyenda de Niveles Piramidales y Estados -->
        <div class="absolute bottom-4 left-4 z-20 pointer-events-none hidden lg:flex flex-col gap-2 text-[11px] bg-slate-900/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-md shadow-2xl text-slate-300">
          <div class="font-mono font-bold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">
            Niveles de la Pir\xE1mide Arquitect\xF3nica
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-sky-400"></span> Nivel 1: \xC1pice (Clientes & Auth)</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-indigo-400"></span> Nivel 2: Core de Dominio</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-purple-400"></span> Nivel 3: Features & Casos de Uso</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Nivel 4: Base (Infra & BD)</span>
          </div>
          <div class="flex items-center gap-3 pt-1 border-t border-slate-800/80 text-[10px] font-mono">
            <span class="text-emerald-400 font-semibold">\u25CF Resuelto</span>
            <span class="text-indigo-400 font-semibold">\u25CF En Progreso</span>
            <span class="text-cyan-400 font-semibold">\u25CF Spec Listo</span>
            <span class="text-rose-400 font-semibold">\u25CF Bloqueado</span>
            <span class="text-amber-400 font-semibold">\u25CF Bugfix</span>
          </div>
        </div>

        <!-- Panel Lateral de Nodos Clasificados -->
        <div class="absolute top-4 right-4 z-20 w-60 max-h-[660px] bg-slate-900/90 border border-slate-800 rounded-2xl p-3 backdrop-blur-md shadow-2xl overflow-y-auto hidden md:block">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 px-1 flex items-center justify-between">
            <span>Nodos Piramidales (${this.features.length})</span>
            <span class="text-[10px] text-indigo-400 font-mono">Nivel</span>
          </div>
          <div class="space-y-1" id="three-node-list">
            ${this.features.map((f) => {
        const tier = this.getNodeTier(f);
        const tierColors = { 1: "text-sky-400", 2: "text-indigo-400", 3: "text-purple-400", 4: "text-emerald-400" };
        const dotColor = f.status === "done" ? "bg-emerald-400" : f.status === "in_progress" ? "bg-indigo-400" : f.type === "bugfix" ? "bg-amber-400" : "bg-slate-500";
        return `
                <button type="button" 
                        data-focus-node="${f.id}" 
                        class="w-full text-left px-2 py-1.5 rounded-xl text-xs hover:bg-slate-800/90 transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-700/60">
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="w-2 h-2 rounded-full ${dotColor} shrink-0"></span>
                    <span class="font-mono text-[11px] font-bold text-slate-200 group-hover:text-indigo-300">INT-${String(f.id).padStart(3, "0")}</span>
                    <span class="truncate text-[10px] text-slate-400">${f.name}</span>
                  </div>
                  <span class="font-mono text-[10px] font-bold ${tierColors[tier]} bg-slate-950 px-1 py-0.2 rounded border border-slate-800">
                    L${tier}
                  </span>
                </button>
              `;
      }).join("")}
          </div>
        </div>

        <!-- HUD Tooltip Flotante 3D -->
        <div id="three-tooltip-hud" class="absolute z-30 pointer-events-none hidden transition-opacity duration-150 transform -translate-x-1/2 -translate-y-full mb-4">
          <div class="bg-slate-900/95 border border-indigo-500/70 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs text-slate-200 min-w-[260px] max-w-xs space-y-2">
            <div id="hud-content"></div>
          </div>
        </div>

        <div id="three-canvas-root" class="w-full h-full cursor-grab active:cursor-grabbing"></div>
      </div>
    `;
      const canvasRoot = this.container.querySelector("#three-canvas-root");
      this.hudElement = this.container.querySelector("#three-tooltip-hud");
      this.initThree(canvasRoot);
    }
    getNodeTier(feature) {
      const mod = (feature.module || "").toLowerCase();
      const title = (feature.title || feature.name || "").toLowerCase();
      if (mod.includes("infra") || mod.includes("analytics") || mod.includes("notification") || title.includes("database") || title.includes("worker") || title.includes("dlq")) {
        return 4;
      }
      if (mod.includes("auth") || mod.includes("gateway") || mod.includes("ui") || mod.includes("client") || feature.priority === "P0" && (!feature.depends_on || !feature.depends_on.length)) {
        return 1;
      }
      if (mod.includes("catalog") || mod.includes("cart") || mod.includes("core") || mod.includes("domain")) {
        return 2;
      }
      return 3;
    }
    getTierName(tier) {
      switch (tier) {
        case 1:
          return "Nivel 1: \xC1pice (Per\xEDmetro & Auth)";
        case 2:
          return "Nivel 2: Core de Dominio";
        case 3:
          return "Nivel 3: Features & Casos de Uso";
        case 4:
          return "Nivel 4: Base (Persistencia & Infra)";
        default:
          return `Nivel ${tier}`;
      }
    }
    initThree(rootEl) {
      const THREE = window.THREE;
      const width = rootEl.clientWidth || 800;
      const height = rootEl.clientHeight || 700;
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(132631, 11e-4);
      this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 3e3);
      this.camera.position.set(0, 70, 560);
      this.camera.lookAt(0, 0, 0);
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      rootEl.appendChild(this.renderer.domElement);
      const ambientLight = new THREE.AmbientLight(16777215, 0.7);
      this.scene.add(ambientLight);
      const dirLight1 = new THREE.DirectionalLight(6514417, 1.2);
      dirLight1.position.set(200, 400, 200);
      this.scene.add(dirLight1);
      const dirLight2 = new THREE.DirectionalLight(3718648, 0.8);
      dirLight2.position.set(-200, -300, -200);
      this.scene.add(dirLight2);
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      this.createStarfield();
      this.createPyramidalGuides();
      this.createNodes();
      this.bindEvents(rootEl);
      this.animate();
    }
    createStarfield() {
      const THREE = window.THREE;
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1400;
      const posArray = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 2600;
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
      const starMat = new THREE.PointsMaterial({
        size: 1.6,
        color: 9741240,
        transparent: true,
        opacity: 0.6
      });
      const starField = new THREE.Points(starGeo, starMat);
      this.scene.add(starField);
    }
    /**
     * Crea los anillos guía y planos traslúcidos que dibujan la silueta de la pirámide
     */
    createPyramidalGuides() {
      const THREE = window.THREE;
      this.pyramidGuides = [];
      const tierLevels = [
        { tier: 1, y: 165, radius: 70, color: 3718648 },
        { tier: 2, y: 55, radius: 150, color: 8490232 },
        { tier: 3, y: -55, radius: 230, color: 11032055 },
        { tier: 4, y: -165, radius: 310, color: 1096065 }
      ];
      tierLevels.forEach((tl) => {
        const ringGeo = new THREE.RingGeometry(tl.radius - 1, tl.radius + 1, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: tl.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.22
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = tl.y;
        this.scene.add(ringMesh);
        this.pyramidGuides.push(ringMesh);
      });
      const apexRadius = 70;
      const baseRadius = 310;
      const apexY = 165;
      const baseY = -165;
      for (let i = 0; i < 4; i++) {
        const angle = Math.PI / 2 * i + Math.PI / 4;
        const topPt = new THREE.Vector3(apexRadius * Math.cos(angle), apexY, apexRadius * Math.sin(angle));
        const btmPt = new THREE.Vector3(baseRadius * Math.cos(angle), baseY, baseRadius * Math.sin(angle));
        const lineGeo = new THREE.BufferGeometry().setFromPoints([topPt, btmPt]);
        const lineMat = new THREE.LineDashedMaterial({
          color: 6514417,
          dashSize: 10,
          gapSize: 6,
          transparent: true,
          opacity: 0.25
        });
        const edgeLine = new THREE.Line(lineGeo, lineMat);
        edgeLine.computeLineDistances();
        this.scene.add(edgeLine);
        this.pyramidGuides.push(edgeLine);
      }
    }
    createLabelSprite(taskId, weight, tier, colorHex) {
      const THREE = window.THREE;
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(2, 6, 23, 0.9)";
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
      ctx.fillText(taskId, 128, 44);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 24px monospace";
      ctx.fillText(`P:${weight} | L${tier}`, 128, 92);
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(38, 19, 1);
      return sprite;
    }
    createNodes() {
      const THREE = window.THREE;
      this.nodes = [];
      this.orbitRings = [];
      this.flowParticles = [];
      this.labelSprites = [];
      const featureMap = /* @__PURE__ */ new Map();
      this.features.forEach((f) => featureMap.set(f.id, f));
      const tierGroups = { 1: [], 2: [], 3: [], 4: [] };
      this.features.forEach((f) => {
        const tier = this.getNodeTier(f);
        tierGroups[tier].push(f);
      });
      const tierSettings = {
        1: { y: 165, radius: 70, offsetAngle: 0 },
        2: { y: 55, radius: 150, offsetAngle: Math.PI / 6 },
        3: { y: -55, radius: 230, offsetAngle: Math.PI / 4 },
        4: { y: -165, radius: 310, offsetAngle: Math.PI / 3 }
      };
      Object.keys(tierGroups).forEach((tierStr) => {
        const tier = parseInt(tierStr, 10);
        const items = tierGroups[tier];
        const count = items.length;
        const cfg = tierSettings[tier];
        items.forEach((f, idx) => {
          const angle = cfg.offsetAngle + (count > 1 ? Math.PI * 2 * idx / count : 0);
          const yOffset = Math.sin(idx * 1.5) * 6;
          const x = cfg.radius * Math.cos(angle);
          const y = cfg.y + yOffset;
          const z = cfg.radius * Math.sin(angle);
          const weightVal = f.weight || (f.priority === "P0" ? 95 : f.priority === "P1" ? 75 : 50);
          const sphereRadius = 7 + weightVal / 100 * 15;
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
            roughness: 0.2,
            metalness: 0.35,
            emissive,
            emissiveIntensity: 0.6
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(x, y, z);
          mesh.userData = {
            feature: f,
            tier,
            weight: weightVal,
            baseRadius: sphereRadius,
            baseColor: color,
            baseEmissive: emissive
          };
          this.scene.add(mesh);
          this.nodes.push(mesh);
          const taskId = `INT-${String(f.id).padStart(3, "0")}`;
          const sprite = this.createLabelSprite(taskId, weightVal, tier, colorHex);
          sprite.position.set(x, y + sphereRadius + 14, z);
          this.scene.add(sprite);
          this.labelSprites.push(sprite);
          if (weightVal >= 75) {
            const ringGeo = new THREE.RingGeometry(sphereRadius + 3.5, sphereRadius + 5.5, 32);
            const ringMat = new THREE.MeshBasicMaterial({
              color,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.65
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.set(x, y, z);
            ring.rotation.x = Math.PI / 2.3;
            this.scene.add(ring);
            this.orbitRings.push(ring);
          }
        });
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
          const midPoint = new THREE.Vector3().lerpVectors(sourceMesh.position, targetMesh.position, 0.5);
          midPoint.y += 12;
          const curve = new THREE.QuadraticBezierCurve3(sourceMesh.position, midPoint, targetMesh.position);
          const curvePoints = curve.getPoints(24);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
          const lineMat = new THREE.LineBasicMaterial({
            color: isResolved ? 1096065 : 16007006,
            transparent: true,
            opacity: isResolved ? 0.7 : 0.45,
            linewidth: 2
          });
          const line = new THREE.Line(lineGeo, lineMat);
          this.scene.add(line);
          const pGeo = new THREE.SphereGeometry(2.5, 12, 12);
          const pMat = new THREE.MeshBasicMaterial({
            color: isResolved ? 3462041 : 16478597
          });
          const particle = new THREE.Mesh(pGeo, pMat);
          particle.userData = {
            curve,
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
        btn.addEventListener("click", () => {
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
          mesh.scale.set(1.25, 1.25, 1.25);
        }
        const f = mesh.userData.feature;
        const weightVal = mesh.userData.weight;
        const tierVal = mesh.userData.tier;
        const tierName = this.getTierName(tierVal);
        const hudContent = this.container.querySelector("#hud-content");
        if (hudContent && f) {
          const branchName = f.branch || `${f.type || "feature"}/INT-${String(f.id).padStart(3, "0")}/${f.name}`;
          const rawDeps = f.depends_on || f.dependencies || [];
          hudContent.innerHTML = `
          <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span class="font-mono font-bold text-indigo-400 text-sm">INT-${String(f.id).padStart(3, "0")}</span>
            <span class="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 uppercase">${f.status}</span>
          </div>
          <div class="font-bold text-slate-100 text-xs leading-snug">${f.title || f.name}</div>
          <div class="font-mono text-[10px] text-slate-400 truncate flex items-center gap-1">${Icons.gitBranch("w-3 h-3")} <span>${branchName}</span></div>
          
          <!-- Nivel Piramidal -->
          <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
            <div class="text-[10px] uppercase font-bold text-indigo-400">Jerarqu\xEDa Arquitect\xF3nica:</div>
            <div class="font-bold text-slate-200 mt-0.5">${tierName}</div>
          </div>

          <!-- Barra de Peso -->
          <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
            <div class="flex items-center justify-between text-[10px] mb-1">
              <span class="text-amber-400 font-bold font-mono">Peso de Importancia:</span>
              <span class="font-mono font-bold text-amber-300">${weightVal} / 100</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" style="width: ${weightVal}%"></div>
            </div>
          </div>

          <div class="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
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
        this.targetRotation.y += 1e-3;
      }
      if (this.scene) {
        this.scene.rotation.y = this.rotation.y;
        this.scene.rotation.x = this.rotation.x;
      }
      this.orbitRings.forEach((ring) => {
        ring.rotation.z += 0.012;
      });
      this.flowParticles.forEach((p) => {
        p.userData.progress = (p.userData.progress + 8e-3) % 1;
        const pt = p.userData.curve.getPoint(p.userData.progress);
        p.position.copy(pt);
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
      this.pyramidGuides = [];
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

  // project-docs/src/shared/MermaidViewer.js
  function renderMermaidViewer(diagram) {
    const { id, title, type, level, description, mermaid: code } = diagram;
    return `
    <div class="mermaid-viewer-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm overflow-hidden transition-all duration-200" 
         id="mermaid-card-${id}">
      
      <!-- 1. Barra de Herramientas Superior -->
      <div class="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            ${type || "Diagrama"}
          </span>
          <span class="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
            ${level || ""}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Switcher Vista Visual / C\xF3digo -->
          <div class="inline-flex rounded-xl p-0.5 bg-slate-200/70 dark:bg-slate-800/80 text-xs font-medium">
            <button type="button" 
                    data-diagram-toggle="visual" 
                    data-diagram-id="${id}"
                    class="diagram-view-btn active px-3 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5">
              ${Icons.eye("w-3.5 h-3.5")} <span>Visual</span>
            </button>
            <button type="button" 
                    data-diagram-toggle="code" 
                    data-diagram-id="${id}"
                    class="diagram-view-btn px-3 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5">
              ${Icons.code("w-3.5 h-3.5")} <span>C\xF3digo</span>
            </button>
          </div>

          <!-- Bot\xF3n Pantalla Completa / Zoom -->
          <button type="button" 
                  data-action="expand-diagram" 
                  data-diagram-id="${id}"
                  class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Expandir a Pantalla Completa con Zoom y Paneo">
            ${Icons.maximize ? Icons.maximize("w-3.5 h-3.5") : Icons.eye("w-3.5 h-3.5")}
          </button>

          <!-- Bot\xF3n Copiar C\xF3digo -->
          <button type="button" 
                  data-copy-mermaid="${escapeAttr2(code)}"
                  class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Copiar c\xF3digo Mermaid">
            ${Icons.copy("w-3.5 h-3.5")}
          </button>

          <!-- Bot\xF3n Abrir / Editar en Draw.io -->
          <a href="https://app.diagrams.net/?splash=0#R${encodeURIComponent(code)}" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="px-2 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono font-semibold"
             title="Abrir e interactuar con este diagrama en Draw.io (diagrams.net)">
            ${Icons.edit("w-3.5 h-3.5")} <span class="hidden sm:inline">Draw.io</span>
          </a>
        </div>
      </div>

      <!-- 2. Informaci\xF3n del Diagrama -->
      <div class="px-5 pt-4 pb-2">
        <h4 class="font-bold text-sm sm:text-base text-slate-900 dark:text-white">${escapeHtml4(title)}</h4>
        <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">${escapeHtml4(description)}</p>
      </div>

      <!-- 3. Contenedores de Vista -->
      
      <!-- 3.1 VISTA VISUAL (RENDER SVG INTERACTIVO) -->
      <div id="diagram-view-visual-${id}" class="diagram-visual-panel p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/60 overflow-x-auto min-h-[320px] flex items-center justify-center">
        <div class="mermaid-render-target w-full flex justify-center items-center" 
             id="mermaid-target-${id}" 
             data-mermaid-code="${escapeAttr2(code)}">
          <div class="text-xs font-mono text-slate-400 animate-pulse text-center p-6 flex flex-col items-center gap-2">
            <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Generando visualizaci\xF3n interactiva del diagrama...</span>
          </div>
        </div>
      </div>

      <!-- 3.2 VISTA DE C\xD3DIGO FUENTE (OCULTA POR DEFECTO) -->
      <div id="diagram-view-code-${id}" class="diagram-code-panel hidden p-4 bg-slate-900 border-t border-slate-800">
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] font-mono text-slate-400">
          <span>Sintaxis Mermaid</span>
          <button type="button" data-copy-mermaid="${escapeAttr2(code)}" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer">Copiar</button>
        </div>
        <pre class="text-xs font-mono text-indigo-300 leading-relaxed overflow-x-auto p-2 select-all"><code>${escapeHtml4(code)}</code></pre>
      </div>

    </div>
  `;
  }
  function escapeHtml4(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function escapeAttr2(text) {
    if (!text) return "";
    return String(text).replace(/"/g, "&quot;");
  }

  // project-docs/src/features/architecture-docs/ArchitectureDocs.js
  function renderArchitectureDocs({ projectSpec, knowledgeIndex, features = [] }) {
    const spec = projectSpec || {};
    const kData = knowledgeIndex || {};
    const proj = spec.project || {};
    const tech = spec.tech_stack || {};
    const arch = spec.architecture || {};
    const modules = spec.modules || [];
    const goals = spec.business_goals || [];
    const diagrams = kData.diagrams || [];
    const layers = arch.layers || [];
    const patterns = arch.patterns || [];
    const featureMap = /* @__PURE__ */ new Map();
    features.forEach((f) => featureMap.set(f.id, f));
    const stackRows = buildStructuredStack(tech, spec);
    return `
    <div class="space-y-10">
      
      <!-- 1. HEADER: Prop\xF3sito, Alcance y Metadatos del Sistema -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                ${proj.type || "Sistema de Software"}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                v${proj.version || "1.0.0"}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                ${proj.maturity || "Harness SDD"}
              </span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${escapeHtml5(proj.name || "Proyecto de Software")}
            </h2>
            <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              ${escapeHtml5(proj.tagline || "Arquitectura Can\xF3nica y Especificaci\xF3n T\xE9cnica")}
            </p>
          </div>

          <!-- M\xE9tricas T\xE9cnicas Compactas -->
          <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">M\xF3dulos</div>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-base">${modules.length}</div>
            </div>
            <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Stack Items</div>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-base">${stackRows.length}</div>
            </div>
            <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Diagramas</div>
              <div class="font-bold text-indigo-600 dark:text-indigo-400 text-base">${diagrams.length}</div>
            </div>
          </div>
        </div>

        <!-- Descripci\xF3n y Objetivos -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          <div class="lg:col-span-2 space-y-3">
            <h3 class="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              ${Icons.folder} Prop\xF3sito y Alcance del Sistema
            </h3>
            ${proj.description ? `
              <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                ${escapeHtml5(proj.description)}
              </p>
            ` : `
              <div class="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                No hay descripci\xF3n registrada en <code>project-spec.json</code>. Ejecuta <code>/technical-audit</code> para generarla.
              </div>
            `}
          </div>

          <div class="space-y-3 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6">
            <h3 class="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              ${Icons.check} Objetivos T\xE9cnicos & de Negocio
            </h3>
            ${goals.length > 0 ? `
              <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                ${goals.map((g) => `
                  <li class="flex items-start gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                    <span>${escapeHtml5(g)}</span>
                  </li>
                `).join("")}
              </ul>
            ` : `
              <p class="text-xs text-slate-400 italic">No se han registrado objetivos expl\xEDcitos en el spec.</p>
            `}
          </div>
        </div>
      </section>

      <!-- 2. DIAGRAMAS GENERALES DE ARQUITECTURA (C4, UML & ERD) -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                ${Icons.layers}
              </span>
              Diagramas de Arquitectura, UML & Persistencia
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualiza modelos C4, secuencias y el esquema relacional con renderizado interactivo y soporte de Draw.io
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" 
                    id="copy-active-mermaid-btn" 
                    class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5">
              ${Icons.copy} Copiar Mermaid / XML
            </button>
          </div>
        </div>

        <!-- Selector de Pesta\xF1as de Diagramas -->
        <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs font-medium" id="arch-diagram-nav">
          <button type="button" 
                  data-arch-tab="layers" 
                  class="arch-tab-btn active px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold transition-all cursor-pointer flex items-center gap-1.5">
            ${Icons.layers} Capas del Sistema
          </button>
          ${diagrams.map((diag) => {
      const iconSvg = diag.type === "C4 Model" ? Icons.architecture : diag.type === "Database ERD" ? Icons.database : Icons.gitTree;
      return `
              <button type="button" 
                      data-arch-tab="${diag.id}" 
                      class="arch-tab-btn px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5">
                ${iconSvg} ${diag.title || diag.id}
              </button>
            `;
    }).join("")}
        </div>

        <!-- 2.1 PANEL: CAPAS DIN\xC1MICAS DEL SISTEMA -->
        <div id="diagram-panel-layers" class="diagram-panel block mt-6">
          ${renderDynamicLayersPanel({ layers, modules, featureMap })}
        </div>

        <!-- 2.2 PANELES DE DIAGRAMAS MERMAID / DRAW.IO -->
        ${diagrams.map((diag) => `
          <div id="diagram-panel-${diag.id}" class="diagram-panel hidden mt-6">
            ${renderMermaidViewer(diag)}
          </div>
        `).join("")}

      </section>

      <!-- 3. STACK DE TECNOLOG\xCDAS COMPACTO & T\xC9CNICO (TABLA ESTRUCTURADA) -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                ${Icons.cpu}
              </span>
              Stack Tecnol\xF3gico & Matriz de Dependencias
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cat\xE1logo t\xE9cnico verificado por <code class="font-mono text-indigo-500">/technical-audit</code> libre de dependencias fantasma
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            ${stackRows.length} componentes auditados
          </span>
        </div>

        <!-- Tabla Estructurada del Stack -->
        <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th class="py-3 px-4 font-bold">Capa</th>
                <th class="py-3 px-4 font-bold">Tecnolog\xEDa / Herramienta</th>
                <th class="py-3 px-4 font-bold">Versi\xF3n</th>
                <th class="py-3 px-4 font-bold">Prop\xF3sito en el Sistema</th>
                <th class="py-3 px-4 font-bold">Estado</th>
                <th class="py-3 px-4 font-bold">Dependencias & Licencia</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              ${stackRows.map((row) => `
                <tr class="hover:bg-white dark:hover:bg-slate-900 transition-colors">
                  <td class="py-3 px-4 whitespace-nowrap">
                    <span class="font-mono font-bold text-[11px] px-2 py-0.5 rounded ${row.layerBadgeClass}">
                      ${row.layer}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    <div class="flex items-center gap-2">
                      <span class="text-indigo-600 dark:text-indigo-400">${row.iconSvg}</span>
                      <span>${escapeHtml5(row.technology)}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    ${escapeHtml5(row.version || "Auto")}
                  </td>
                  <td class="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs">
                    ${escapeHtml5(row.purpose)}
                  </td>
                  <td class="py-3 px-4 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${row.statusBadgeClass}">
                      <span class="w-1.5 h-1.5 rounded-full ${row.statusDotClass}"></span>
                      ${row.status}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    ${escapeHtml5(row.dependencies || "Nativa / MIT")}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <!-- 4. PATRONES DE DISE\xD1O Y ARQUITECTURA -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              ${Icons.cube}
            </span>
            Patrones de Dise\xF1o & Estilo de Arquitectura
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Estilo principal: <strong class="text-indigo-600 dark:text-indigo-400">${arch.style || "L\xF3gica desacoplada"}</strong>
          </p>
        </div>

        ${patterns.length > 0 ? `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${patterns.map((pat) => {
      const pName = typeof pat === "string" ? pat : pat.name;
      const pType = typeof pat === "string" ? "Patr\xF3n Can\xF3nico" : pat.type || "Patr\xF3n";
      const pDesc = typeof pat === "string" ? "Est\xE1ndar arquitect\xF3nico adoptado en el repositorio." : pat.description || "";
      return `
                <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-2">
                  <div class="flex items-center justify-between">
                    <h4 class="font-bold text-xs text-slate-900 dark:text-slate-100">${escapeHtml5(pName)}</h4>
                    <span class="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      ${escapeHtml5(pType)}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    ${escapeHtml5(pDesc)}
                  </p>
                </div>
              `;
    }).join("")}
          </div>
        ` : `
          <div class="p-6 text-center text-slate-400 text-xs rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            No se han registrado patrones expl\xEDcitos en <code>project-spec.json</code>.
          </div>
        `}
      </section>

      <!-- 5. M\xD3DULOS DEL SISTEMA IDENTIFICADOS -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              ${Icons.folder}
            </span>
            M\xF3dulos del Sistema Identificados (${modules.length})
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            L\xEDmites de contexto (Bounded Contexts) con trazabilidad hacia tareas INT-*
          </p>
        </div>

        ${modules.length > 0 ? `
          <div class="space-y-4">
            ${modules.map((mod) => {
      const modFeatures = (mod.features || []).map((fIdStr) => {
        const numId = parseInt(String(fIdStr).replace("INT-", ""), 10);
        return featureMap.get(numId);
      }).filter(Boolean);
      const doneFeatures = modFeatures.filter((f) => f.status === "done").length;
      const progressPct = modFeatures.length ? Math.round(doneFeatures / modFeatures.length * 100) : 0;
      return `
                <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <span class="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                        ${Icons.folder}
                      </span>
                      <div>
                        <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>${mod.name}</span>
                          <code class="text-xs font-mono text-indigo-600 dark:text-indigo-400">[${mod.id}]</code>
                        </h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${mod.purpose || ""}</p>
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
                            <span>${escapeHtml5(r)}</span>
                          </li>
                        `).join("")}
                      </ul>
                    </div>

                    <div>
                      <span class="font-mono font-bold text-[10px] uppercase text-slate-400">Stack Tecnol\xF3gico & Tareas Asignadas:</span>
                      <div class="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-1 mb-2">
                        ${escapeHtml5(mod.tech || "")}
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
        ` : `
          <div class="p-8 text-center text-slate-400 text-xs rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            No se han registrado m\xF3dulos a\xFAn. Ejecuta <code>/project-knowledge</code> para extraer los Bounded Contexts.
          </div>
        `}
      </section>

    </div>
  `;
  }
  function buildStructuredStack(tech, spec) {
    const rows = [];
    if (tech.orchestration || spec.runtime?.language) {
      rows.push({
        layer: "Orquestaci\xF3n",
        layerBadgeClass: "bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
        iconSvg: Icons.bot,
        technology: tech.orchestration || "Antigravity 2.0 / OpenCode / Copilot",
        version: "v2.5.0",
        purpose: "Orquestaci\xF3n multi-agente con roles especializados (leader, spec-author, implementer, reviewer)",
        status: "Activo",
        statusBadgeClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
        statusDotClass: "bg-emerald-500",
        dependencies: "MIT / Sovereign Agents"
      });
    }
    rows.push({
      layer: "Frontend",
      layerBadgeClass: "bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800",
      iconSvg: Icons.layout,
      technology: tech.frontend || "Vanilla JS + Tailwind CSS v4 + Three.js",
      version: "r128 / v4.0",
      purpose: "Tablero SPA interactivo, lector editorial ContextForge y constelaci\xF3n 3D en Screaming Architecture",
      status: "Activo",
      statusBadgeClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
      statusDotClass: "bg-emerald-500",
      dependencies: "@tailwindcss/browser@4, three.min.js"
    });
    rows.push({
      layer: "Tooling",
      layerBadgeClass: "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
      iconSvg: Icons.terminal,
      technology: tech.tooling || "Node.js (ESM) + esbuild",
      version: ">=18.0.0 / ^0.25.0",
      purpose: "Compilaci\xF3n IIFE ultrarr\xE1pida, servidor est\xE1tico y pipeline de sincronizaci\xF3n de datos",
      status: "Activo",
      statusBadgeClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
      statusDotClass: "bg-emerald-500",
      dependencies: "esbuild (devDependency)"
    });
    rows.push({
      layer: "Docs-as-Code",
      layerBadgeClass: "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
      iconSvg: Icons.bookOpen,
      technology: tech.documentation || "Markdown + Mermaid.js + Draw.io XML",
      version: "Mermaid v10.9+",
      purpose: "Elicitaci\xF3n formal IEEE 830, diagramas C4, UML, ERD y decisiones arquitect\xF3nicas (ADRs)",
      status: "Activo",
      statusBadgeClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
      statusDotClass: "bg-emerald-500",
      dependencies: "mermaid.min.js"
    });
    rows.push({
      layer: "Testing & QA",
      layerBadgeClass: "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
      iconSvg: Icons.shield,
      technology: tech.testing || "Node.js Test Runner + Playwright ATDD",
      version: "Node.js Native / ^1.40",
      purpose: "Pruebas unitarias de parser/sincronizaci\xF3n y pruebas de aceptaci\xF3n E2E de interfaz",
      status: "Activo",
      statusBadgeClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
      statusDotClass: "bg-emerald-500",
      dependencies: "node:test, node:assert"
    });
    if (Array.isArray(tech.runtimes)) {
      tech.runtimes.forEach((r) => {
        rows.push({
          layer: "Runtime",
          layerBadgeClass: "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
          iconSvg: Icons.cpu,
          technology: r.name,
          version: r.version || "Detectada",
          purpose: r.purpose || "Entorno de ejecuci\xF3n de backend",
          status: "Activo",
          statusBadgeClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
          statusDotClass: "bg-emerald-500",
          dependencies: "Sistema"
        });
      });
    }
    if (Array.isArray(tech.databases)) {
      tech.databases.forEach((db) => {
        rows.push({
          layer: "Persistencia",
          layerBadgeClass: "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
          iconSvg: Icons.database,
          technology: db.name,
          version: db.type || "Storage Engine",
          purpose: db.purpose || "Almacenamiento de estado del sistema",
          status: "Activo",
          statusBadgeClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
          statusDotClass: "bg-emerald-500",
          dependencies: db.port ? `Puerto :${db.port}` : "Local/Embedded"
        });
      });
    }
    return rows;
  }
  function renderDynamicLayersPanel({ layers, modules, featureMap }) {
    if (!layers.length && !modules.length) {
      return `
      <div class="p-8 text-center text-slate-500 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
        <div class="p-3 w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto mb-3 flex items-center justify-center">
          ${Icons.zap}
        </div>
        <div class="text-sm font-bold text-slate-800 dark:text-slate-200">No hay capas de arquitectura configuradas a\xFAn</div>
        <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">Ejecuta la skill <code>/technical-audit</code> o <code>/project-knowledge</code> para extraer la arquitectura real del proyecto.</p>
      </div>
    `;
    }
    return `
    <div class="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/90 p-4 shadow-inner">
      <div class="min-w-[960px] max-w-5xl mx-auto py-4 space-y-6">
        
        <!-- Capa 1: Entrada & Per\xEDmetro -->
        <div class="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Capa 1: Clientes & Per\xEDmetro de Entrada
            </span>
            <span class="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
              HTTPS / WSS / API Contracts
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div class="flex justify-center text-indigo-600 dark:text-indigo-400 mb-1.5">${Icons.layout}</div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Web App (SPA)</div>
              <div class="text-[10px] text-slate-400">Dashboard & Clientes</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div class="flex justify-center text-indigo-600 dark:text-indigo-400 mb-1.5">${Icons.bot}</div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Agentes de IA</div>
              <div class="text-[10px] text-slate-400">Antigravity / SDD CLI</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div class="flex justify-center text-indigo-600 dark:text-indigo-400 mb-1.5">${Icons.terminal}</div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Terminal CLI</div>
              <div class="text-[10px] text-slate-400">Scripts de Verificaci\xF3n</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div class="flex justify-center text-indigo-600 dark:text-indigo-400 mb-1.5">${Icons.shield}</div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Guardrails & Tests</div>
              <div class="text-[10px] text-slate-400">Anti-Sesgo & ATDD</div>
            </div>
          </div>
        </div>

        <!-- Flecha de Flujo 1 -> 2 -->
        <div class="flex justify-center -my-3 relative z-10">
          <div class="px-3 py-1 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold shadow-md flex items-center gap-1.5">
            ${Icons.chevronDown} Casos de Uso & L\xF3gica de Negocio
          </div>
        </div>

        <!-- Capa 2: Dominios & M\xF3dulos Din\xE1micos -->
        <div class="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Capa de Dominio: Bounded Contexts (${modules.length} m\xF3dulos)
            </span>
            <span class="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
              Screaming Architecture Core
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            ${modules.map((mod) => {
      const modFeatures = (mod.features || []).map((fIdStr) => {
        const numId = parseInt(String(fIdStr).replace("INT-", ""), 10);
        return featureMap.get(numId);
      }).filter(Boolean);
      return `
                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">${mod.id}</span>
                    <span class="text-[9px] font-mono bg-indigo-100 dark:bg-indigo-950/60 px-1 py-0.2 rounded text-indigo-700 dark:text-indigo-300">
                      ${modFeatures.length} tareas
                    </span>
                  </div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">${mod.name}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5 line-clamp-2">${mod.purpose || ""}</div>
                </div>
              `;
    }).join("")}
          </div>
        </div>

        <!-- Flecha de Flujo 2 -> 3 -->
        <div class="flex justify-center -my-3 relative z-10">
          <div class="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold shadow-md flex items-center gap-1.5">
            ${Icons.chevronDown} Estado, Persistencia & Documentaci\xF3n
          </div>
        </div>

        <!-- Capa 3: Persistencia & Base de Conocimiento -->
        <div class="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Capa de Infraestructura & Estado Soberano
            </span>
            <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Filesystem & Offline Fallback
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-indigo-600 dark:text-indigo-400">${Icons.database}</span>
                <div>
                  <div class="font-bold text-xs text-slate-900 dark:text-slate-100">data-fallback.js</div>
                  <div class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Embedded Data Cache</div>
                </div>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Cache serializado que permite ejecuci\xF3n 100% offline a trav\xE9s del protocolo file:/// sin servidor local.
              </p>
            </div>

            <div class="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-indigo-600 dark:text-indigo-400">${Icons.book}</span>
                <div>
                  <div class="font-bold text-xs text-slate-900 dark:text-slate-100">project-docs/knowledge/</div>
                  <div class="text-[10px] font-mono text-purple-600 dark:text-purple-400">Sovereign Knowledge Engine</div>
                </div>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Repositorio vivo de documentos Markdown, especificaciones C4, UML, ERD y reglas de negocio invariantes.
              </p>
            </div>

            <div class="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-indigo-600 dark:text-indigo-400">${Icons.share}</span>
                <div>
                  <div class="font-bold text-xs text-slate-900 dark:text-slate-100">Triple-Mirror Sync</div>
                  <div class="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">Cross-Platform Registry</div>
                </div>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Replicador de paridad exacta entre .opencode/skills/, .github/skills/ y .agents/skills/.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
  }
  function escapeHtml5(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // project-docs/src/shared/MarkdownViewer.js
  function renderMarkdown(content = "") {
    if (!content || typeof content !== "string") return '<p class="text-slate-400 italic">Documento vac\xEDo.</p>';
    return parseMarkdownNative(content);
  }
  function extractTableOfContents(md = "") {
    const lines = md.split(/\r?\n/);
    const toc = [];
    let inCode = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("```")) {
        inCode = !inCode;
        continue;
      }
      if (inCode) continue;
      if (trimmed.startsWith("# ") || trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
        let level = 1;
        let text = "";
        if (trimmed.startsWith("### ")) {
          level = 3;
          text = trimmed.replace(/^###\s+/, "");
        } else if (trimmed.startsWith("## ")) {
          level = 2;
          text = trimmed.replace(/^##\s+/, "");
        } else if (trimmed.startsWith("# ")) {
          level = 1;
          text = trimmed.replace(/^#\s+/, "");
        }
        const cleanText = text.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
        const slug = slugify(cleanText);
        toc.push({ id: slug, level, text: cleanText });
      }
    }
    return toc;
  }
  function slugify(text = "") {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "section";
  }
  function parseMarkdownNative(md) {
    const lines = md.split(/\r?\n/);
    let html = [];
    let inCodeBlock = false;
    let codeLang = "";
    let codeBuffer = [];
    let inTable = false;
    let tableHeaderParsed = false;
    let tableRows = [];
    let tableHeaders = [];
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          const codeText = codeBuffer.join("\n");
          const langLower = (codeLang || "").toLowerCase().trim();
          if (langLower === "mermaid" || langLower === "drawio") {
            const isDrawio = langLower === "drawio";
            const diagId = "diag_" + Math.random().toString(36).substring(2, 9);
            const encodedForDrawio = encodeURIComponent(codeText);
            const drawioUrl = `https://app.diagrams.net/?splash=0#R${encodedForDrawio}`;
            html.push(`
            <div class="my-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-md overflow-hidden transition-all duration-200" id="diag-card-${diagId}">
              <div class="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-[11px] font-mono">
                <span class="flex items-center gap-1.5 font-bold ${isDrawio ? "text-amber-500" : "text-indigo-500"}">
                  ${isDrawio ? `${Icons.layout("w-3.5 h-3.5")} <span>Draw.io / mxGraph</span>` : `${Icons.layers("w-3.5 h-3.5")} <span>Diagrama Mermaid</span>`}
                </span>
                
                <div class="flex items-center gap-1.5">
                  <button type="button" 
                          data-action="expand-diagram-code" 
                          data-diag-target="${diagId}"
                          class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                          title="Ver en pantalla completa con zoom y paneo">
                    ${Icons.search("w-3 h-3")} <span>Zoom</span>
                  </button>
                  <button type="button" 
                          data-copy-mermaid="${escapeAttr3(codeText)}" 
                          class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                          title="Copiar c\xF3digo fuente del diagrama">
                    ${Icons.copy("w-3 h-3")} <span>Copiar</span>
                  </button>
                  <a href="${drawioUrl}" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     class="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-colors font-semibold flex items-center gap-1"
                     title="Abrir este diagrama para editar interactivamente en diagrams.net">
                    ${Icons.edit("w-3 h-3")} <span>Draw.io</span>
                  </a>
                </div>
              </div>

              <div class="p-6 overflow-x-auto flex justify-center items-center bg-slate-50/40 dark:bg-slate-950/40 min-h-[160px]" id="${diagId}">
                <div class="mermaid-render-target w-full flex justify-center items-center" data-mermaid-code="${escapeAttr3(codeText)}">
                  <pre class="mermaid text-xs font-mono text-slate-400">${escapeHtml6(codeText)}</pre>
                </div>
              </div>
            </div>
          `);
          } else {
            const codeLines = codeText.split("\n");
            html.push(`
            <div class="my-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden shadow-md">
              <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono text-slate-400">
                <span class="flex items-center gap-1.5 font-bold text-indigo-400">
                  ${Icons.terminal("w-3.5 h-3.5")} <span>${codeLang || "text"}</span>
                </span>
                <button type="button" data-action="copy-code-block" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-[10px] font-semibold">
                  Copiar C\xF3digo
                </button>
              </div>
              <div class="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                <pre><code>${codeLines.map((l, idx) => `<span class="inline-block w-6 select-none opacity-30 text-right mr-3">${idx + 1}</span>${escapeHtml6(l)}`).join("\n")}</code></pre>
              </div>
            </div>
          `);
          }
          codeBuffer = [];
          inCodeBlock = false;
          codeLang = "";
          continue;
        } else {
          inCodeBlock = true;
          codeLang = line.trim().replace(/^```/, "").trim();
          continue;
        }
      }
      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        const cells = line.split("|").slice(1, -1).map((c) => c.trim());
        if (cells.every((c) => /^:?-+:?$/.test(c))) {
          tableHeaderParsed = true;
          continue;
        }
        if (!inTable) {
          inTable = true;
          tableHeaderParsed = false;
          tableHeaders = [];
          tableRows = [];
        }
        if (!tableHeaderParsed) {
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        continue;
      } else if (inTable) {
        html.push(renderInteractiveTableHtml(tableHeaders, tableRows));
        inTable = false;
        tableHeaderParsed = false;
        tableHeaders = [];
        tableRows = [];
      }
      if (line.startsWith("# ")) {
        const text = line.slice(2);
        const slug = slugify(text);
        html.push(`<h1 id="${slug}" class="scroll-mt-24 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-10 mb-4 tracking-tight border-b border-slate-200 dark:border-slate-800/80 pb-3 flex items-center justify-between group">
        <span>${formatInline(text)}</span>
        <a href="#${slug}" class="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-indigo-500 text-base transition-opacity">#</a>
      </h1>`);
        continue;
      }
      if (line.startsWith("## ")) {
        const text = line.slice(3);
        const slug = slugify(text);
        html.push(`<h2 id="${slug}" class="scroll-mt-24 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight border-b border-slate-100 dark:border-slate-800/40 pb-2 flex items-center justify-between group">
        <span>${formatInline(text)}</span>
        <a href="#${slug}" class="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-indigo-500 text-sm transition-opacity">#</a>
      </h2>`);
        continue;
      }
      if (line.startsWith("### ")) {
        const text = line.slice(4);
        const slug = slugify(text);
        html.push(`<h3 id="${slug}" class="scroll-mt-24 text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2 flex items-center justify-between group">
        <span>${formatInline(text)}</span>
        <a href="#${slug}" class="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-indigo-500 text-xs transition-opacity">#</a>
      </h3>`);
        continue;
      }
      if (line.startsWith("#### ")) {
        const text = line.slice(5);
        const slug = slugify(text);
        html.push(`<h4 id="${slug}" class="scroll-mt-24 text-sm font-bold text-slate-800 dark:text-slate-200 mt-5 mb-1.5">${formatInline(text)}</h4>`);
        continue;
      }
      if (/^(\*\*\*|---|___)$/.test(line.trim())) {
        html.push('<hr class="my-8 border-slate-200 dark:border-slate-800/80" />');
        continue;
      }
      if (line.startsWith("> [!NOTE]") || line.startsWith("> [!TIP]") || line.startsWith("> [!WARNING]") || line.startsWith("> [!IMPORTANT]") || line.startsWith("> [!CAUTION]") || line.startsWith("> [!DANGER]")) {
        const alertType = line.match(/> \[!([A-Z]+)\]/)[1];
        const alertConfig = getAlertTheme(alertType);
        const rest = line.replace(/> \[![A-Z]+\]\s*/, "").trim();
        html.push(`
        <div class="my-4 p-4 rounded-2xl ${alertConfig.bg} border ${alertConfig.border} ${alertConfig.text} text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <span class="text-base shrink-0 mt-0.5">${alertConfig.icon}</span>
          <div class="leading-relaxed flex-1">
            <strong class="font-bold block mb-0.5">${alertConfig.title}</strong>
            ${formatInline(rest)}
          </div>
        </div>
      `);
        continue;
      }
      if (line.startsWith("> ")) {
        html.push(`<blockquote class="my-4 pl-4 border-l-4 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10 py-1.5 pr-3 rounded-r-xl text-slate-600 dark:text-slate-400 italic text-xs sm:text-sm leading-relaxed">${formatInline(line.slice(2))}</blockquote>`);
        continue;
      }
      if (/^[\*\-]\s/.test(line)) {
        if (!inList) {
          html.push('<ul class="my-3 space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">');
          inList = true;
        }
        const itemText = line.replace(/^[\*\-]\s/, "");
        html.push(`<li class="flex items-start gap-2.5"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2"></span><span>${formatInline(itemText)}</span></li>`);
        continue;
      } else if (inList) {
        html.push("</ul>");
        inList = false;
      }
      if (!line.trim()) {
        continue;
      }
      html.push(`<p class="my-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-[1.75em]">${formatInline(line)}</p>`);
    }
    if (inCodeBlock) {
      const codeText = codeBuffer.join("\n");
      html.push(`<div class="my-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden shadow-md"><div class="p-4 text-xs font-mono overflow-x-auto leading-relaxed"><pre><code>${escapeHtml6(codeText)}</code></pre></div></div>`);
    }
    if (inTable) {
      html.push(renderInteractiveTableHtml(tableHeaders, tableRows));
    }
    if (inList) html.push("</ul>");
    return html.join("");
  }
  function renderInteractiveTableHtml(headers, rows) {
    const tableId = "tbl_" + Math.random().toString(36).substring(2, 9);
    const showFilter = rows.length > 5;
    return `
    <div class="my-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs overflow-hidden" id="${tableId}-container">
      ${showFilter ? `
        <div class="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span class="font-mono text-[11px] text-slate-500">Filas: ${rows.length}</span>
          <input type="text" 
                 placeholder="Filtrar tabla..." 
                 oninput="filterTableRows('${tableId}', this.value)"
                 class="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
      ` : ""}
      <div class="overflow-x-auto max-h-[500px]">
        <table class="w-full text-left text-xs border-collapse" id="${tableId}">
          <thead class="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-xs text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              ${headers.map((h) => `<th class="px-4 py-3 whitespace-nowrap">${formatInline(h)}</th>`).join("")}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/50">
            ${rows.map((r) => `
              <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                ${r.map((c) => `<td class="px-4 py-3 text-slate-700 dark:text-slate-300 leading-relaxed">${formatInline(c)}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
  }
  function getAlertTheme(type) {
    switch (type) {
      case "NOTE":
        return { icon: Icons.info("w-4 h-4 text-indigo-600 dark:text-indigo-400"), title: "Nota Informativa", bg: "bg-indigo-50/80 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800/60", text: "text-indigo-950 dark:text-indigo-200" };
      case "TIP":
        return { icon: Icons.lightbulb("w-4 h-4 text-emerald-600 dark:text-emerald-400"), title: "Recomendaci\xF3n / Tip", bg: "bg-emerald-50/80 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800/60", text: "text-emerald-950 dark:text-emerald-200" };
      case "WARNING":
        return { icon: Icons.alertTriangle("w-4 h-4 text-amber-600 dark:text-amber-400"), title: "Advertencia", bg: "bg-amber-50/80 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800/60", text: "text-amber-950 dark:text-amber-200" };
      case "IMPORTANT":
        return { icon: Icons.zap("w-4 h-4 text-purple-600 dark:text-purple-400"), title: "Requerimiento Importante", bg: "bg-purple-50/80 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800/60", text: "text-purple-950 dark:text-purple-200" };
      case "CAUTION":
      case "DANGER":
        return { icon: Icons.shield("w-4 h-4 text-rose-600 dark:text-rose-400"), title: "Punto Cr\xEDtico / Riesgo", bg: "bg-rose-50/80 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800/60", text: "text-rose-950 dark:text-rose-200" };
      default:
        return { icon: Icons.info("w-4 h-4 text-slate-600 dark:text-slate-400"), title: "Nota", bg: "bg-slate-50 dark:bg-slate-900", border: "border-slate-200 dark:border-slate-800", text: "text-slate-800 dark:text-slate-200" };
    }
  }
  function formatInline(text = "") {
    return text.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-indigo-600 dark:text-indigo-400 text-[11px] border border-slate-200 dark:border-slate-700 font-semibold">$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>').replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-500 font-semibold">$1</a>');
  }
  function escapeHtml6(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function escapeAttr3(text) {
    if (!text) return "";
    return String(text).replace(/"/g, "&quot;");
  }
  function parseMarkdownToBlocks(md = "") {
    const lines = md.split(/\r?\n/);
    const blocks = [];
    let currentBlock = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed.startsWith("```")) {
        if (currentBlock && currentBlock.type === "code") {
          blocks.push(currentBlock);
          currentBlock = null;
          continue;
        }
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = {
          id: "blk_" + Math.random().toString(36).substring(2, 9),
          type: "code",
          lang: trimmed.replace(/^```/, "").trim() || "text",
          content: []
        };
        continue;
      }
      if (currentBlock && currentBlock.type === "code") {
        currentBlock.content.push(line);
        continue;
      }
      if (trimmed.startsWith("# ") || trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
        if (currentBlock) blocks.push(currentBlock);
        let level = 1;
        let text = trimmed.replace(/^#\s+/, "");
        if (trimmed.startsWith("### ")) {
          level = 3;
          text = trimmed.replace(/^###\s+/, "");
        } else if (trimmed.startsWith("## ")) {
          level = 2;
          text = trimmed.replace(/^##\s+/, "");
        }
        blocks.push({
          id: "blk_" + Math.random().toString(36).substring(2, 9),
          type: "header",
          level,
          text
        });
        currentBlock = null;
        continue;
      }
      if (trimmed.startsWith("> [!")) {
        if (currentBlock) blocks.push(currentBlock);
        const match = trimmed.match(/> \[!([A-Z]+)\]\s*(.*)/);
        blocks.push({
          id: "blk_" + Math.random().toString(36).substring(2, 9),
          type: "callout",
          kind: match ? match[1] : "NOTE",
          text: match ? match[2] : ""
        });
        currentBlock = null;
        continue;
      }
      if (trimmed.startsWith("### BR-") || (trimmed.startsWith("- **BR-") || trimmed.startsWith("**BR-"))) {
        if (currentBlock) blocks.push(currentBlock);
        const brIdMatch = trimmed.match(/BR-[A-Z]+-[0-9]+/);
        const brId = brIdMatch ? brIdMatch[0] : "BR-GEN-001";
        blocks.push({
          id: "blk_" + Math.random().toString(36).substring(2, 9),
          type: "business_rule",
          ruleId: brId,
          text: trimmed
        });
        currentBlock = null;
        continue;
      }
      if (/^(\*\*\*|---|___)$/.test(trimmed)) {
        if (currentBlock) blocks.push(currentBlock);
        blocks.push({
          id: "blk_" + Math.random().toString(36).substring(2, 9),
          type: "divider"
        });
        currentBlock = null;
        continue;
      }
      if (trimmed) {
        if (!currentBlock || currentBlock.type !== "paragraph") {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = {
            id: "blk_" + Math.random().toString(36).substring(2, 9),
            type: "paragraph",
            lines: [line]
          };
        } else {
          currentBlock.lines.push(line);
        }
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
      }
    }
    if (currentBlock) blocks.push(currentBlock);
    return blocks;
  }
  function blocksToMarkdown(blocks = []) {
    const parts = [];
    for (const b of blocks) {
      switch (b.type) {
        case "header": {
          const prefix = "#".repeat(b.level || 1);
          parts.push(`${prefix} ${b.text || ""}`);
          break;
        }
        case "callout": {
          parts.push(`> [!${b.kind || "NOTE"}]
> ${b.text || ""}`);
          break;
        }
        case "code": {
          const codeText = Array.isArray(b.content) ? b.content.join("\n") : b.content || "";
          parts.push(`\`\`\`${b.lang || "text"}
${codeText}
\`\`\``);
          break;
        }
        case "business_rule": {
          parts.push(b.text || `### ${b.ruleId}
${b.description || ""}`);
          break;
        }
        case "divider": {
          parts.push("---");
          break;
        }
        case "paragraph": {
          const text = Array.isArray(b.lines) ? b.lines.join("\n") : b.text || "";
          parts.push(text);
          break;
        }
        default:
          if (b.raw) parts.push(b.raw);
          break;
      }
    }
    return parts.join("\n\n");
  }
  if (typeof window !== "undefined") {
    window.filterTableRows = function(tableId, query) {
      const table = document.getElementById(tableId);
      if (!table) return;
      const q = (query || "").toLowerCase().trim();
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((r) => {
        const text = r.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          r.style.display = "";
        } else {
          r.style.display = "none";
        }
      });
    };
  }

  // project-docs/src/features/knowledge-base/KnowledgeBase.js
  function renderKnowledgeBase({ knowledgeIndex, projectSpec, features = [] }) {
    const kData = knowledgeIndex || getFallbackKnowledge();
    const rules = kData.business_rules || [];
    const services = kData.external_services || [];
    const standards = kData.coding_standards || {};
    const guardrails = standards.guardrails || [];
    const naming = standards.naming_conventions || {};
    const docs = kData.docs || getDefaultDocs();
    const docMetadata = kData.docMetadata || buildDocMetadataFallback(docs);
    const shelvesData = kData.shelves || buildShelvesFallback(docMetadata);
    const modulesData = kData.modulesData || buildModulesDataFallback(docMetadata);
    const docKeys = Object.keys(docs);
    const activeDocKey = docKeys.includes("c4-model.md") ? "c4-model.md" : docKeys.includes("coding-standards.md") ? "coding-standards.md" : docKeys[0] || "";
    const activeDocContent = docs[activeDocKey] || "# Documento no disponible";
    const activeDocMeta = docMetadata[activeDocKey] || {
      title: activeDocKey,
      shelf: "general",
      readingTime: 3,
      wordCount: 450,
      ruleCount: 0,
      reqCount: 0,
      adrCount: 0
    };
    const moduleNames = Array.from(/* @__PURE__ */ new Set([
      ...projectSpec?.modules?.map((m) => m.name) || [],
      ...Object.keys(modulesData),
      ...Object.values(docMetadata).filter((d) => d.moduleName).map((d) => d.moduleName),
      ...rules.map((r) => r.module)
    ])).filter(Boolean);
    const heroDocKey = docKeys.includes("c4-model.md") ? "c4-model.md" : docKeys.includes("coding-standards.md") ? "coding-standards.md" : docKeys[0] || "";
    const heroDocMeta = docMetadata[heroDocKey] || activeDocMeta;
    const masterDocKey = "MASTER-PROJECT-KNOWLEDGE.md";
    const masterDocMeta = docMetadata[masterDocKey] || {
      title: "Megadocumento Maestro Consolidado (Single-File Context Bundle)",
      wordCount: 8200,
      readingTime: 35
    };
    const activeDocToc = extractTableOfContents(activeDocContent);
    const dynamicAiPrompt = buildAiSystemPrompt({ projectSpec, kData, rules, services, guardrails, naming });
    return `
    <div class="space-y-10" id="kb-container">
      
      <!-- ============================================================== -->
      <!-- VISTA 1: BIBLIOTECA EDITORIAL (HUB POR ESTANTES)               -->
      <!-- ============================================================== -->
      <div id="kb-view-library" class="space-y-8">
        
        <!-- 1.1 Header Hero de la Biblioteca -->
        <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Docs-as-Code
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  v4.1 DeepWiki Pattern
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Anti-Bias Context
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  100% Offline Compatible
                </span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span class="text-indigo-600 dark:text-indigo-400">${Icons.book("w-7 h-7")}</span>
                <span>Base de Conocimiento de Ingenier\xEDa Soberana</span>
              </h2>
              <p class="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Repositorio can\xF3nico de arquitectura (C4/UML), requerimientos (IEEE 830/INVEST), mapa mental de funcionalidades (DeepWiki), 
                reglas de negocio (BR-*), decisiones t\xE9cnicas (ADR) y bounded contexts. Permite auditar, crear, editar y exportar documentaci\xF3n viva en Markdown (.md).
              </p>
            </div>

            <!-- Botones de Acci\xF3n Globales -->
            <div class="flex flex-wrap items-center gap-2.5">
              <button type="button" 
                      data-action="open-new-doc-modal"
                      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer">
                ${Icons.plus} <span>Nuevo Doc</span>
              </button>

              <button type="button" 
                      data-action="trigger-import-doc"
                      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                      title="Importar archivo Markdown (.md)">
                ${Icons.upload} <span>Importar</span>
              </button>
              <input type="file" id="import-doc-file-input" accept=".md,.markdown" class="hidden" />

              <button type="button" 
                      data-action="export-all-knowledge"
                      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
                      title="Exportar toda la base de conocimiento consolidada en formato Markdown (.md)">
                ${Icons.download} <span>Exportar (.md)</span>
              </button>

              <button type="button" 
                      data-action="open-ai-context-modal" 
                      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer">
                ${Icons.bot} <span>Contexto IA</span>
              </button>
            </div>
          </div>

          <!-- M\xE9tricas Din\xE1micas Reales -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div class="text-[10px] font-mono text-slate-400 uppercase">Documentos Vivos</div>
              <div class="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">${docKeys.length} indexados</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Docs-as-Code (.md)</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div class="text-[10px] font-mono text-slate-400 uppercase">Bounded Contexts</div>
              <div class="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">${moduleNames.length} m\xF3dulos</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Estrat\xE9gicos DDD</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div class="text-[10px] font-mono text-slate-400 uppercase">Reglas de Negocio</div>
              <div class="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">${rules.length} catalogadas</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Invariantes BR-*</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div class="text-[10px] font-mono text-slate-400 uppercase">Servicios Externos</div>
              <div class="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">${services.length} contratos</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Integraciones auditadas</div>
            </div>
          </div>
        </section>

        <!-- 1.2 CONMUTADOR DE PERSPECTIVA (3 Tiers de Navegaci\xF3n Editorial) -->
        <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-2 shadow-xs">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2" id="kb-perspective-nav">
            <div class="flex flex-wrap items-center gap-1.5 flex-1">
              
              <!-- Tier 1: Visi\xF3n Global -->
              <button type="button" 
                      data-kb-perspective="global"
                      class="kb-perspective-btn active flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold bg-indigo-600 text-white shadow-xs transition-all cursor-pointer">
                ${Icons.architecture("w-4 h-4")}
                <span>1. Visi\xF3n Global & Arquitectura</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white">Can\xF3nicos</span>
              </button>

              <!-- Tier 2: M\xF3dulos & Bounded Contexts -->
              <button type="button" 
                      data-kb-perspective="modules"
                      class="kb-perspective-btn flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                ${Icons.folder("w-4 h-4")}
                <span>2. M\xF3dulos & Bounded Contexts</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${moduleNames.length} Contextos</span>
              </button>

              <!-- Tier 3: Megadocumento Maestro -->
              <button type="button" 
                      data-kb-perspective="master"
                      class="kb-perspective-btn flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                ${Icons.fileText("w-4 h-4")}
                <span>3. Dossier Maestro Consolidado</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">MASTER-*.md</span>
              </button>

            </div>

            <!-- Ayuda Contextual de Perspectiva -->
            <div class="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-400 px-3 py-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Navegaci\xF3n en 3 Niveles (Global $\\to$ Modular $\\to$ Dossier)</span>
            </div>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- PANEL TIER 1: VISI\xD3N GLOBAL & ARQUITECTURA DEL SISTEMA         -->
        <!-- ============================================================== -->
        <div id="kb-perspective-panel-global" class="kb-perspective-panel space-y-8">
          
          <!-- 1.3 Hero Featured Card (Art\xEDculo Destacado de la Biblioteca: Modelo C4) -->
          ${heroDocKey ? `
            <section class="rounded-3xl border border-indigo-200/60 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-sm">
              <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div class="space-y-3 max-w-3xl">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-600 text-white shadow-xs">
                      ${Icons.star("w-3 h-3")} <span>Documento Destacado</span>
                    </span>
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      ${Icons.clock("w-3 h-3")} <span>${heroDocMeta.readingTime} min de lectura</span>
                    </span>
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      ${Icons.fileText("w-3 h-3")} <span>${heroDocMeta.wordCount} palabras</span>
                    </span>
                    ${heroDocMeta.ruleCount ? `
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        ${Icons.scale("w-3 h-3")} <span>${heroDocMeta.ruleCount} Reglas BR</span>
                      </span>
                    ` : ""}
                  </div>

                  <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    ${escapeHtml7(heroDocMeta.title || heroDocKey)}
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    ${escapeHtml7(heroDocMeta.summary || "Especificaci\xF3n formal del sistema con diagramas de contexto, contenedores y componentes.")}
                  </p>
                  <div class="font-mono text-[11px] text-slate-400">
                    Ruta can\xF3nica: <code class="text-indigo-600 dark:text-indigo-400 font-bold">${heroDocKey}</code>
                  </div>
                </div>

                <div class="flex sm:flex-col items-stretch gap-2.5 shrink-0 w-full sm:w-auto">
                  <button type="button" 
                          data-action="open-article-read"
                          data-doc-key="${escapeAttr4(heroDocKey)}"
                          class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer">
                    ${Icons.bookOpen} <span>Leer Art\xEDculo Completo</span>
                  </button>
                  <button type="button" 
                          data-action="open-article-edit"
                          data-doc-key="${escapeAttr4(heroDocKey)}"
                          class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer">
                    ${Icons.edit} <span>Editar en Vivo</span>
                  </button>
                </div>
              </div>
            </section>
          ` : ""}

          <!-- Grid de Accesos R\xE1pidos: IEEE 830 & Desglose Funcional DeepWiki -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- Tarjeta 1: Visi\xF3n del Producto IEEE 830 -->
            <section class="rounded-3xl border border-indigo-200/70 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-transparent dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-transparent p-5 backdrop-blur-xl flex flex-col justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  ${Icons.info("w-4 h-4")} <span>\xBFDe qu\xE9 trata este software?</span>
                </div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-white">Problema de Negocio & Alcance (IEEE 830)</h4>
                <p class="text-xs text-slate-600 dark:text-slate-300">
                  Definici\xF3n formal del prop\xF3sito, usuarios directos/indirectos, matriz RACI y l\xEDmites funcionales.
                </p>
              </div>
              <div class="pt-2">
                <button type="button" 
                        data-action="open-article-read"
                        data-doc-key="01-project-overview-and-business.md"
                        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer">
                  ${Icons.bookOpen("w-3.5 h-3.5")} <span>Ver Resumen IEEE 830</span>
                </button>
              </div>
            </section>

            <!-- Tarjeta 2: Desglose Funcional & Mindmap DeepWiki -->
            <section class="rounded-3xl border border-purple-200/70 dark:border-purple-900/50 bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-transparent dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-transparent p-5 backdrop-blur-xl flex flex-col justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2 text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                  ${Icons.grid("w-4 h-4")} <span>Patr\xF3n DeepWiki / OpenDeepWiki</span>
                </div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-white">Cat\xE1logo de Capacidades & Mapa Mental</h4>
                <p class="text-xs text-slate-600 dark:text-slate-300">
                  Desglose jer\xE1rquico de capacidades $\\to$ features, User Journeys y deep linking directo a c\xF3digo fuente.
                </p>
              </div>
              <div class="pt-2">
                <button type="button" 
                        data-action="open-article-read"
                        data-doc-key="03-capabilities-and-features.md"
                        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer">
                  ${Icons.bookOpen("w-3.5 h-3.5")} <span>Ver Cat\xE1logo DeepWiki</span>
                </button>
              </div>
            </section>

          </div>

          <!-- 1.4 Barra de Filtros por Estante Tem\xE1tico y Buscador con Debouncing -->
          <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-5 shadow-sm space-y-4">
            <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              <!-- P\xEDldoras de Filtro por Estante -->
              <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono" id="kb-shelf-filter-pills">
                <button type="button" 
                        data-shelf-filter="" 
                        class="kb-shelf-pill active px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold transition-all cursor-pointer shrink-0 shadow-xs">
                  Todos (${docKeys.length})
                </button>
                ${Object.values(shelvesData).map((sh) => `
                  <button type="button" 
                          data-shelf-filter="${sh.id}" 
                          class="kb-shelf-pill px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shrink-0 font-medium inline-flex items-center gap-1.5">
                    ${getShelfIconSvg(sh.id)} <span>${sh.title.split(" ")[0]}</span> <span>(${sh.docs.length})</span>
                  </button>
                `).join("")}
              </div>

              <!-- Buscador con Debouncing -->
              <div class="relative min-w-[280px]">
                <input type="text" 
                       id="kb-library-search-input" 
                       placeholder="Buscar en la biblioteca (t\xEDtulo, m\xF3dulo, BR-*)..." 
                       class="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono shadow-xs" />
                <span class="absolute left-3 top-2.5 text-slate-400 pointer-events-none text-xs">
                  ${Icons.search("w-3.5 h-3.5")}
                </span>
              </div>

            </div>
          </section>

          <!-- 1.5 Estantes Tem\xE1ticos (Shelves Grid) -->
          <div class="space-y-10" id="kb-shelves-container">
            ${Object.values(shelvesData).map((sh) => {
      if (!sh.docs || sh.docs.length === 0) return "";
      return `
                <section class="space-y-4 kb-shelf-section" data-shelf-id="${sh.id}">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div class="flex items-center gap-2.5">
                      <span class="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        ${getShelfIconSvg(sh.id, "w-5 h-5")}
                      </span>
                      <h3 class="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        ${escapeHtml7(sh.title)}
                      </h3>
                    </div>
                    <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      ${sh.docs.length} documentos
                    </span>
                  </div>

                  <!-- Cuadr\xEDcula de Tarjetas de Documentos -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    ${sh.docs.map((key) => {
        const meta = docMetadata[key] || {
          title: key,
          summary: "Documento t\xE9cnico.",
          readingTime: 2,
          ruleCount: 0,
          reqCount: 0,
          adrCount: 0
        };
        return `
                        <div class="kb-shelf-doc-card rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between group"
                             data-doc-key="${escapeAttr4(key)}"
                             data-doc-shelf="${escapeAttr4(sh.id)}"
                             data-doc-title="${escapeAttr4(meta.title)}"
                             data-doc-module="${escapeAttr4(meta.moduleName || "")}">
                          
                          <div class="space-y-3">
                            <div class="flex items-center justify-between gap-2">
                              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${meta.moduleName ? "bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"} truncate">
                                ${meta.moduleName ? `${Icons.folder("w-3 h-3")} <span>${meta.moduleName}</span>` : `${getShelfIconSvg(sh.id, "w-3 h-3")} <span>${sh.title.split(" ")[0]}</span>`}
                              </span>
                              <span class="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
                                ${Icons.clock("w-3 h-3")} <span>${meta.readingTime} min</span>
                              </span>
                            </div>

                            <div>
                              <h4 class="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                ${escapeHtml7(meta.title)}
                              </h4>
                              <div class="text-[10px] font-mono text-slate-400 truncate mt-1">
                                ${escapeHtml7(key)}
                              </div>
                            </div>

                            <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                              ${escapeHtml7(meta.summary)}
                            </p>
                          </div>

                          <div class="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                            <div class="flex items-center gap-1.5">
                              ${meta.ruleCount ? `
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800" title="${meta.ruleCount} Reglas de negocio catalogadas">
                                  ${Icons.scale("w-3 h-3")} <span>${meta.ruleCount} BR</span>
                                </span>
                              ` : ""}
                              ${meta.reqCount ? `
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" title="${meta.reqCount} Requerimientos funcionales">
                                  ${Icons.fileText("w-3 h-3")} <span>${meta.reqCount} RF</span>
                                </span>
                              ` : ""}
                              ${meta.adrCount ? `
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800" title="${meta.adrCount} Decisiones de arquitectura">
                                  ${Icons.cube("w-3 h-3")} <span>${meta.adrCount} ADR</span>
                                </span>
                              ` : ""}
                            </div>

                            <div class="flex items-center gap-1.5">
                              <button type="button" 
                                      data-action="open-article-read"
                                      data-doc-key="${escapeAttr4(key)}"
                                      class="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1">
                                ${Icons.bookOpen("w-3.5 h-3.5")} <span>Leer</span>
                              </button>
                              <button type="button" 
                                      data-action="open-article-edit"
                                      data-doc-key="${escapeAttr4(key)}"
                                      class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                      title="Editar directamente este documento">
                                ${Icons.edit("w-3.5 h-3.5")}
                              </button>
                            </div>
                          </div>

                        </div>
                      `;
      }).join("")}
                  </div>
                </section>
              `;
    }).join("")}
          </div>

        </div>

        <!-- ============================================================== -->
        <!-- PANEL TIER 2: M\xD3DULOS & BOUNDED CONTEXTS GRANULARES            -->
        <!-- ============================================================== -->
        <div id="kb-perspective-panel-modules" class="kb-perspective-panel hidden space-y-8">
          
          <!-- Introducci\xF3n a la Arquitectura por Bounded Contexts -->
          <section class="rounded-3xl border border-purple-200/70 dark:border-purple-900/50 bg-gradient-to-r from-purple-50/50 via-indigo-50/30 to-transparent dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-transparent p-6 sm:p-8 backdrop-blur-xl">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div class="space-y-2 max-w-3xl">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Domain-Driven Design (DDD)
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    5 Artefactos Especializados por M\xF3dulo
                  </span>
                </div>
                <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Explorador de Bounded Contexts Granulares
                </h3>
                <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Cada m\xF3dulo representa un subdominio estrat\xE9gico aislado con sus propias reglas invariantes, contratos transaccionales, 
                  tarjetas CRC y suite de 6 diagramas visuales en Mermaid.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-xs font-mono space-y-1 shrink-0">
                <div class="text-[10px] uppercase font-bold text-slate-400">Artefactos por M\xF3dulo</div>
                <div class="text-purple-600 dark:text-purple-400 font-bold">1. module-spec.md (CRC)</div>
                <div class="text-amber-600 dark:text-amber-400 font-bold">2. requirements-and-rules.md</div>
                <div class="text-emerald-600 dark:text-emerald-400 font-bold">3. data-and-transactions.md</div>
                <div class="text-indigo-600 dark:text-indigo-400 font-bold">4. diagrams.md (6 Diagramas)</div>
                <div class="text-rose-600 dark:text-rose-400 font-bold">5. technical-debt-refactoring.md</div>
              </div>
            </div>
          </section>

          <!-- Barra de Navegaci\xF3n por M\xF3dulo (Tabs Horizontales) -->
          <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-3 shadow-xs">
            <div class="flex items-center gap-2 overflow-x-auto pb-1" id="kb-module-tab-bar">
              ${Object.keys(modulesData).map((modId, index) => {
      const mod = modulesData[modId];
      const isActive = index === 0;
      return `
                  <button type="button" 
                          data-module-tab="${escapeAttr4(modId)}"
                          class="kb-module-tab-btn ${isActive ? "active bg-purple-600 text-white font-bold shadow-xs" : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"} px-4 py-2 rounded-2xl text-xs font-mono transition-all cursor-pointer shrink-0 inline-flex items-center gap-2">
                    ${Icons.folder("w-3.5 h-3.5")}
                    <span>${escapeHtml7(mod.title || modId)}</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/25 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}">${mod.docs?.length || 5}</span>
                  </button>
                `;
    }).join("")}
            </div>
          </section>

          <!-- Paneles de Contenido Modular -->
          <div id="kb-module-contents-container">
            ${Object.keys(modulesData).map((modId, index) => {
      const mod = modulesData[modId];
      const isHidden = index !== 0;
      const modDocs = mod.docs || [];
      const modMetaMap = mod.docMetadata || {};
      const specializedSpecs = [
        {
          filename: "module-spec.md",
          title: "Especificaci\xF3n de Alcance & Tarjetas CRC",
          desc: "Delimitaci\xF3n del bounded context, lenguaje ubicuo de dominio y matriz de tarjetas CRC (Clase, Responsabilidades y Colaboradores).",
          color: "border-purple-200 dark:border-purple-800 hover:border-purple-500",
          badge: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
          icon: Icons.shield
        },
        {
          filename: "requirements-and-rules.md",
          title: "Requerimientos & Invariantes de Negocio",
          desc: "Matriz exhaustiva de requerimientos funcionales (RF-*), reglas de negocio inviolables (BR-*), historias de usuario (HU-*) y tareas t\xE9cnicas (TI-*).",
          color: "border-amber-200 dark:border-amber-800 hover:border-amber-500",
          badge: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
          icon: Icons.scale
        },
        {
          filename: "data-and-transactions.md",
          title: "Persistencia, Entidades & Transacciones",
          desc: "Estructura de persistencia, entidades, estrategias de concurrencia optimista/pesimista, aislamiento de transacciones e invariantes ACID.",
          color: "border-emerald-200 dark:border-emerald-800 hover:border-emerald-500",
          badge: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
          icon: Icons.database
        },
        {
          filename: "diagrams.md",
          title: "Suite de 6 Diagramas Dedicados (Mermaid)",
          desc: "6 diagramas visuales generados para el m\xF3dulo: Contexto C4, Contenedores, Componentes, Diagrama de Secuencia, Diagrama de Estado y Modelo ERD.",
          color: "border-indigo-200 dark:border-indigo-800 hover:border-indigo-500",
          badge: "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300",
          icon: Icons.architecture
        },
        {
          filename: "technical-debt-refactoring.md",
          title: "Deuda T\xE9cnica & Plan de Refactorizaci\xF3n",
          desc: "Diagn\xF3stico forense de deuda t\xE9cnica, olores de c\xF3digo, brechas de pruebas unitarias/integraci\xF3n y hoja de ruta de remediaci\xF3n.",
          color: "border-rose-200 dark:border-rose-800 hover:border-rose-500",
          badge: "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300",
          icon: Icons.alertTriangle
        }
      ];
      return `
                <div id="kb-module-content-${escapeAttr4(modId)}" class="kb-module-content-panel space-y-6 ${isHidden ? "hidden" : ""}">
                  
                  <!-- Cabecera del M\xF3dulo -->
                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          ${mod.status || "COMPLETAMENTE CUBIERTO"}
                        </span>
                        <span class="text-xs font-mono text-slate-400">Ruta: <code>project-docs/knowledge/modules/${modId}/</code></span>
                      </div>
                      <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <span class="text-purple-600 dark:text-purple-400">${Icons.folder("w-6 h-6")}</span>
                        <span>${escapeHtml7(mod.title || modId)}</span>
                      </h3>
                      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                        Bounded Context auditado con 5 artefactos formales de ingenier\xEDa para garantizar contexto 100% libre de alucinaciones en agentes de IA y desarrolladores.
                      </p>
                    </div>

                    <!-- M\xE9tricas R\xE1pidas del M\xF3dulo -->
                    <div class="flex items-center gap-2 text-xs font-mono shrink-0">
                      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                        <div class="text-[10px] text-slate-400 uppercase">Documentos</div>
                        <div class="text-base font-bold text-purple-600 dark:text-purple-400">${modDocs.length}</div>
                      </div>
                      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                        <div class="text-[10px] text-slate-400 uppercase">Diagramas</div>
                        <div class="text-base font-bold text-indigo-600 dark:text-indigo-400">6</div>
                      </div>
                      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                        <div class="text-[10px] text-slate-400 uppercase">Cobertura</div>
                        <div class="text-base font-bold text-emerald-600 dark:text-emerald-400">100%</div>
                      </div>
                    </div>
                  </div>

                  <!-- Grid de los 5 Archivos Especializados -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    ${specializedSpecs.map((spec) => {
        const docKey = `modules/${modId}/${spec.filename}`;
        const meta = modMetaMap[spec.filename] || docMetadata[docKey] || {
          title: spec.title,
          summary: spec.desc,
          readingTime: 2,
          wordCount: 300,
          ruleCount: 0,
          reqCount: 0
        };
        return `
                        <div class="kb-shelf-doc-card rounded-2xl border ${spec.color} bg-white dark:bg-slate-900/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                             data-doc-key="${escapeAttr4(docKey)}"
                             data-doc-shelf="modules"
                             data-doc-title="${escapeAttr4(spec.title)}"
                             data-doc-module="${escapeAttr4(modId)}">
                          
                          <div class="space-y-3">
                            <div class="flex items-center justify-between gap-2">
                              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${spec.badge}">
                                ${spec.icon("w-3 h-3")} <span>${spec.filename}</span>
                              </span>
                              <span class="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
                                ${Icons.clock("w-3 h-3")} <span>${meta.readingTime || 2} min</span>
                              </span>
                            </div>

                            <div>
                              <h4 class="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                ${escapeHtml7(spec.title)}
                              </h4>
                              <div class="text-[10px] font-mono text-slate-400 truncate mt-1">
                                ${escapeHtml7(docKey)}
                              </div>
                            </div>

                            <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                              ${escapeHtml7(spec.desc)}
                            </p>
                          </div>

                          <div class="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                            <div class="flex items-center gap-1.5">
                              ${meta.ruleCount ? `
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                  ${Icons.scale("w-3 h-3")} <span>${meta.ruleCount} BR</span>
                                </span>
                              ` : ""}
                              ${meta.reqCount ? `
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                  ${Icons.fileText("w-3 h-3")} <span>${meta.reqCount} RF</span>
                                </span>
                              ` : ""}
                            </div>

                            <div class="flex items-center gap-1.5">
                              <button type="button" 
                                      data-action="open-article-read"
                                      data-doc-key="${escapeAttr4(docKey)}"
                                      class="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-600 hover:text-white text-purple-600 dark:text-purple-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1">
                                ${Icons.bookOpen("w-3.5 h-3.5")} <span>Leer</span>
                              </button>
                              <button type="button" 
                                      data-action="open-article-edit"
                                      data-doc-key="${escapeAttr4(docKey)}"
                                      class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                      title="Editar este archivo">
                                ${Icons.edit("w-3.5 h-3.5")}
                              </button>
                            </div>
                          </div>

                        </div>
                      `;
      }).join("")}
                  </div>

                </div>
              `;
    }).join("")}
          </div>

        </div>

        <!-- ============================================================== -->
        <!-- PANEL TIER 3: MEGADOCUMENTO MAESTRO CONSOLIDADO                -->
        <!-- ============================================================== -->
        <div id="kb-perspective-panel-master" class="kb-perspective-panel hidden space-y-8">
          
          <!-- Hero Card del Dossier Maestro -->
          <section class="rounded-3xl border border-purple-200/80 dark:border-purple-900/60 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-slate-900/5 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-sm">
            <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div class="space-y-4 max-w-3xl">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-600 text-white shadow-xs">
                    ${Icons.fileText("w-3.5 h-3.5")} <span>Single-File Context Bundle</span>
                  </span>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    ${Icons.shield("w-3.5 h-3.5")} <span>Anti-Bias Context for AI</span>
                  </span>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    ${Icons.checkCircle("w-3.5 h-3.5")} <span>Docs-as-Code Soberano</span>
                  </span>
                </div>

                <h3 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  MASTER-PROJECT-KNOWLEDGE.md
                </h3>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Compendio unificado de ingenier\xEDa inversa que consolida en un \xFAnico archivo la visi\xF3n de negocio (IEEE 830), 
                  arquitectura AS-IS (Screaming Architecture), modelado C4, tarjetas CRC, requerimientos INVEST, diccionario de datos con ERD, 
                  invariantes BR-*, matriz de servicios externos y trazabilidad RTM. Dise\xF1ado para alimentar a modelos LLM con contexto 100% libre 
                  de alucinaciones en un solo prompt.
                </p>

                <!-- Grid de M\xE9tricas del Megadocumento -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
                  <div class="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <div class="text-[10px] text-slate-400 uppercase">Extensi\xF3n Total</div>
                    <div class="text-base font-bold text-purple-600 dark:text-purple-400 mt-0.5">~${masterDocMeta.wordCount || 8200} palabras</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <div class="text-[10px] text-slate-400 uppercase">Cap\xEDtulos</div>
                    <div class="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">9 Cap\xEDtulos</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <div class="text-[10px] text-slate-400 uppercase">Diagramas</div>
                    <div class="text-base font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">12 Diagramas</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <div class="text-[10px] text-slate-400 uppercase">Contextos DDD</div>
                    <div class="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">${moduleNames.length} Bounded Contexts</div>
                  </div>
                </div>
              </div>

              <!-- Botones de Acci\xF3n del Megadocumento -->
              <div class="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 shrink-0 w-full lg:w-auto">
                <button type="button" 
                        data-action="open-article-read"
                        data-doc-key="${escapeAttr4(masterDocKey)}"
                        class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all cursor-pointer">
                  ${Icons.bookOpen} <span>Leer Megadocumento Completo</span>
                </button>

                <button type="button" 
                        data-action="copy-master-doc"
                        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer">
                  ${Icons.copy} <span>Copiar Markdown Completo</span>
                </button>

                <button type="button" 
                        data-action="download-master-doc"
                        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer">
                  ${Icons.download} <span>Descargar .md</span>
                </button>
              </div>
            </div>
          </section>

          <!-- \xCDndice de Cap\xEDtulos del Megadocumento Maestro -->
          <section class="space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h4 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  ${Icons.fileText}
                </span>
                <span>Estructura & Cap\xEDtulos del Dossier Maestro</span>
              </h4>
              <span class="text-xs font-mono text-slate-400">9 Cap\xEDtulos Estructurados</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${[
      { num: "01", title: "Resumen Ejecutivo & Problema de Negocio (IEEE 830)", desc: "Definici\xF3n formal del problema, usuarios del sistema, objetivos cuantificables y matriz RACI." },
      { num: "02", title: "Arquitectura General & Screaming Architecture", desc: "Topolog\xEDa AS-IS, patrones arquitect\xF3nicos, estilo hexagonal y flujo de datos." },
      { num: "03", title: "Modelado C4 & Diagramas Globales (Mermaid)", desc: "Contexto C1, Contenedores C2, Componentes C3, Diagramas de Secuencia y Clases de Dominio." },
      { num: "04", title: "Bounded Contexts & Tarjetas CRC (DDD T\xE1ctico)", desc: "Lenguaje ubicuo de negocio, responsabilidades por bounded context y colaboradores." },
      { num: "05", title: "Requerimientos Funcionales & No Funcionales (INVEST)", desc: "Matriz RF-*, historias de usuario y requerimientos no funcionales (rendimiento, seguridad, offline)." },
      { num: "06", title: "Diccionario de Datos & Modelo Entidad-Relaci\xF3n (ERD)", desc: "Modelo relacional, entidades, llaves compuestas, \xEDndices y restricciones transaccionales." },
      { num: "07", title: "Cat\xE1logo de Invariantes & Reglas de Negocio (BR-*)", desc: "Invariantes de dominio de estricto cumplimiento para evitar alucinaciones." },
      { num: "08", title: "Servicios Externos & Contratos de Integraci\xF3n", desc: "Protocolos de red, variables de entorno, mecanismos de autenticaci\xF3n y contingencia failover." },
      { num: "09", title: "Matriz de Trazabilidad RTM & Guardrails Anti-Sesgo", desc: "Trazabilidad Requerimiento $\\leftrightarrow$ C\xF3digo $\\leftrightarrow$ Tests y directrices de c\xF3digo." }
    ].map((ch) => `
                <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 space-y-2.5 hover:border-purple-400 dark:hover:border-purple-600 transition-all flex flex-col justify-between">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                        Cap\xEDtulo ${ch.num}
                      </span>
                      <span class="text-[10px] font-mono text-slate-400">Can\xF3nico</span>
                    </div>
                    <h5 class="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                      ${escapeHtml7(ch.title)}
                    </h5>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      ${escapeHtml7(ch.desc)}
                    </p>
                  </div>

                  <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" 
                            data-action="open-article-read"
                            data-doc-key="${escapeAttr4(masterDocKey)}"
                            class="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center gap-1 cursor-pointer">
                      <span>Ir al dossier</span> ${Icons.arrowRight("w-3 h-3")}
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          </section>

        </div>

      </div>

      <!-- ============================================================== -->
      <!-- VISTA 2: LECTOR & EDITOR EDITORIAL (ARTICLE MODE)              -->
      <!-- ============================================================== -->
      <div id="kb-view-article" class="hidden space-y-6">
        
        <!-- 2.1 Breadcrumb de Navegaci\xF3n & Barra de Herramientas Flotante -->
        <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 shadow-sm sticky top-20 z-20 transition-all">
          <div class="flex flex-wrap items-center justify-between gap-4">
            
            <!-- Breadcrumbs -->
            <div class="flex items-center gap-2 text-xs font-mono">
              <button type="button" 
                      data-action="back-to-library"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold transition-all cursor-pointer">
                ${Icons.arrowLeft} <span>Biblioteca</span>
              </button>
              <span class="text-slate-300 dark:text-slate-700">/</span>
              <span id="article-shelf-badge" class="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                ${activeDocMeta.shelf || "Can\xF3nico"}
              </span>
              <span class="text-slate-300 dark:text-slate-700">/</span>
              <span id="doc-active-path" class="text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 truncate max-w-xs sm:max-w-md">
                ${activeDocKey}
              </span>
            </div>

            <!-- Acciones del Documento -->
            <div class="flex items-center gap-2">
              <span id="article-reading-time-badge" class="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500">
                ${Icons.clock("w-3.5 h-3.5")} <span>${activeDocMeta.readingTime} min</span>
              </span>

              <!-- Bot\xF3n Conmutar Modo Edici\xF3n / Lectura -->
              <button type="button" 
                      id="btn-toggle-doc-editor" 
                      class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                      title="Alternar entre Lector Editorial y Editor Dual">
                <span id="btn-toggle-doc-icon">${Icons.edit}</span>
                <span id="btn-toggle-doc-text">Modo Editor</span>
              </button>

              <!-- Bot\xF3n Copiar Markdown -->
              <button type="button" 
                      id="copy-active-doc-btn" 
                      class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Copiar contenido Markdown completo">
                ${Icons.copy}
              </button>

              <!-- Bot\xF3n Descargar Archivo .md -->
              <button type="button" 
                      data-action="download-active-doc" 
                      class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Descargar este archivo .md a tu equipo">
                ${Icons.download}
              </button>

              <!-- Bot\xF3n Eliminar Documento -->
              <button type="button" 
                      data-action="delete-active-doc" 
                      class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                      title="Eliminar este documento de la Base de Conocimiento">
                ${Icons.trash}
              </button>
            </div>

          </div>
        </section>

        <!-- 2.2 MODO LECTOR EDITORIAL (Columna centrada 780px + TOC flotante) -->
        <div id="doc-reader-view-container" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Contenido Principal del Art\xEDculo (Columna de Lectura) -->
          <div class="lg:col-span-9 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-8 sm:p-12 shadow-sm min-h-[600px]">
            <article id="doc-active-body" class="prose dark:prose-invert max-w-3xl mx-auto text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
              ${renderMarkdown(activeDocContent)}
            </article>
          </div>

          <!-- Barra Lateral Flotante: Tabla de Contenidos (TOC) On-This-Page -->
          <div class="hidden lg:block lg:col-span-3 sticky top-36 space-y-4">
            <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 p-4 backdrop-blur-md">
              <div class="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                ${Icons.fileText} <span>En esta p\xE1gina</span>
              </div>
              <div id="doc-active-toc" class="max-h-[460px] overflow-y-auto pr-1">
                ${renderTableOfContentsHtml(activeDocToc)}
              </div>
            </div>

            <!-- Meta Box -->
            <div class="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-[11px] font-mono text-slate-500 space-y-1.5">
              <div class="flex items-center justify-between">
                <span>Palabras:</span>
                <strong id="article-meta-words" class="text-slate-800 dark:text-slate-200">${activeDocMeta.wordCount || 0}</strong>
              </div>
              <div class="flex items-center justify-between">
                <span>Invariantes BR:</span>
                <strong id="article-meta-br" class="text-amber-600 dark:text-amber-400">${activeDocMeta.ruleCount || 0}</strong>
              </div>
              <div class="flex items-center justify-between">
                <span>Requerimientos RF:</span>
                <strong id="article-meta-rf" class="text-emerald-600 dark:text-emerald-400">${activeDocMeta.reqCount || 0}</strong>
              </div>
            </div>
          </div>

        </div>

        <!-- 2.3 MODO EDITOR DUAL (Markdown vs Bloques Visuales con Scroll Sincronizado) -->
        <div id="doc-editor-view-container" class="hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-6 sm:p-8 shadow-sm space-y-6">
          
          <!-- Barra de Control del Editor Dual -->
          <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 border border-slate-200 dark:border-slate-700">
                <button type="button" 
                        id="btn-editor-mode-md" 
                        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-indigo-600 text-white shadow-xs cursor-pointer transition-all">
                  ${Icons.code("w-3.5 h-3.5")} <span>Modo Markdown</span>
                </button>
                <button type="button" 
                        id="btn-editor-mode-blocks" 
                        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-all">
                  ${Icons.grid("w-3.5 h-3.5")} <span>Modo Bloques Visuales</span>
                </button>
              </div>

              <span id="editor-sync-indicator" class="text-xs text-slate-500 font-mono hidden sm:inline">
                Sincronizaci\xF3n activa (Docs-as-Code)
              </span>
            </div>

            <!-- Botones Guardar / Cancelar -->
            <div class="flex items-center gap-2">
              <button type="button" 
                      id="btn-cancel-doc-edit" 
                      class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="button" 
                      id="btn-save-doc-edit" 
                      class="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5">
                ${Icons.save} <span>Guardar Cambios</span>
              </button>
            </div>
          </div>

          <!-- PANEL 1: MODO MARKDOWN CON SCROLL SINCRONIZADO -->
          <div id="editor-pane-markdown" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div class="space-y-2">
              <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>C\xF3digo Fuente Markdown (.md)</span>
                <span>Atajos: Alertas GitHub, Tablas, Mermaid</span>
              </div>
              <textarea id="doc-editor-textarea" 
                        rows="24" 
                        class="w-full p-4 font-mono text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed h-[560px] overflow-y-auto">${escapeHtml7(activeDocContent)}</textarea>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>Previsualizaci\xF3n Renderizada en Vivo</span>
                <span class="text-emerald-500 font-semibold">\u25CF Scroll Sincronizado</span>
              </div>
              <div id="doc-editor-live-preview" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 overflow-y-auto h-[560px] prose dark:prose-invert max-w-none text-xs">
                ${renderMarkdown(activeDocContent)}
              </div>
            </div>

          </div>

          <!-- PANEL 2: MODO BLOQUES VISUALES (ESTILO CONTEXTFORGE) -->
          <div id="editor-pane-blocks" class="hidden space-y-4">
            
            <!-- Barra para Agregar Bloques Nuevos -->
            <div class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono">
              <span class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                ${Icons.grid} <span>A\xF1adir Bloque Visual:</span>
              </span>
              <div class="flex flex-wrap items-center gap-1.5">
                <button type="button" data-add-block="header" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-pointer font-semibold">
                  ${Icons.plus("w-3 h-3")} <span>Encabezado</span>
                </button>
                <button type="button" data-add-block="paragraph" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-pointer font-semibold">
                  ${Icons.plus("w-3 h-3")} <span>P\xE1rrafo</span>
                </button>
                <button type="button" data-add-block="business_rule" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition-all cursor-pointer font-semibold">
                  ${Icons.plus("w-3 h-3")} <span>Regla BR</span>
                </button>
                <button type="button" data-add-block="callout" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 hover:text-cyan-600 transition-all cursor-pointer font-semibold">
                  ${Icons.plus("w-3 h-3")} <span>Alerta/Callout</span>
                </button>
                <button type="button" data-add-block="code" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:text-purple-600 transition-all cursor-pointer font-semibold">
                  ${Icons.plus("w-3 h-3")} <span>Diagrama/C\xF3digo</span>
                </button>
                <button type="button" data-add-block="divider" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-400 transition-all cursor-pointer font-semibold">
                  ${Icons.plus("w-3 h-3")} <span>Separador</span>
                </button>
              </div>
            </div>

            <!-- Lista de Bloques Visuales Editables -->
            <div id="doc-editor-blocks-container" class="space-y-4 max-h-[580px] overflow-y-auto pr-1">
              <!-- Renderizado din\xE1micamente con parseMarkdownToBlocks -->
            </div>

          </div>

        </div>

      </div>

      <!-- ============================================================== -->
      <!-- 3. CAT\xC1LOGO DIN\xC1MICO DE REGLAS DE NEGOCIO (INVARIANTES BR-*)   -->
      <!-- ============================================================== -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                ${Icons.scale}
              </span>
              <span>Cat\xE1logo de Reglas de Negocio (Invariantes de Dominio)</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Invariantes de estricto cumplimiento para evitar alucinaciones, fallos contables y vulnerabilidades
            </p>
          </div>

          <!-- Selector de Filtro de M\xF3dulo Din\xE1mico -->
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-400 font-mono text-[11px]">Filtrar por M\xF3dulo:</span>
            <select id="kb-rules-module-filter" 
                    class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="">Todos los M\xF3dulos (${rules.length})</option>
              ${moduleNames.map((m) => `
                <option value="${escapeAttr4(m)}">${m}</option>
              `).join("")}
            </select>
          </div>
        </div>

        ${rules.length > 0 ? `
          <div class="space-y-3" id="kb-rules-list">
            ${rules.map((rule) => {
      const isCritical = rule.severity === "Cr\xEDtica" || rule.severity === "Critica" || rule.severity === "Alta";
      const sevBadge = isCritical ? "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800" : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      return `
                <div data-rule-module="${escapeAttr4(rule.module || "general")}" 
                     class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all space-y-2">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/60">
                        ${rule.id}
                      </span>
                      <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        [${rule.module || "general"}]
                      </span>
                      <h4 class="font-bold text-xs text-slate-900 dark:text-slate-100">
                        ${escapeHtml7(rule.title)}
                      </h4>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${sevBadge}">
                      ${rule.severity || "Normal"}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-1">
                    ${escapeHtml7(rule.description)}
                  </p>
                </div>
              `;
    }).join("")}
          </div>
        ` : `
          <div class="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <div class="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              ${Icons.scale("w-5 h-5")}
            </div>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-300">No hay reglas de negocio registradas a\xFAn</div>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              Ejecuta la skill <code class="font-mono text-indigo-500">/project-knowledge</code> para extraer autom\xE1ticamente las reglas e invariantes de tu proyecto.
            </p>
          </div>
        `}
      </section>

      <!-- ============================================================== -->
      <!-- 4. MATRIZ DE SERVICIOS EXTERNOS & CONTRATOS                   -->
      <!-- ============================================================== -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              ${Icons.server}
            </span>
            <span>Matriz de Servicios Externos & Protocolos</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Contratos, protocolos de red, esquemas de autenticaci\xF3n y pol\xEDticas de contingencia
          </p>
        </div>

        ${services.length > 0 ? `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${services.map((svc) => `
              <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-slate-900 dark:text-slate-100">${escapeHtml7(svc.name)}</span>
                  <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 dark:cyan-950 text-cyan-700 dark:text-cyan-300 font-semibold">
                    ${escapeHtml7(svc.type)}
                  </span>
                </div>
                <div class="space-y-1 text-[11px] font-mono">
                  <div class="text-slate-500 dark:text-slate-400">
                    Protocolo: <span class="text-slate-800 dark:text-slate-200 font-semibold">${escapeHtml7(svc.protocol)}</span>
                  </div>
                  <div class="text-slate-500 dark:text-slate-400">
                    Autenticaci\xF3n: <span class="text-slate-800 dark:text-slate-200 font-semibold">${escapeHtml7(svc.auth)}</span>
                  </div>
                  <div class="text-slate-500 dark:text-slate-400">
                    Variable: <code class="text-indigo-600 dark:text-indigo-400">${escapeHtml7(svc.env_var)}</code>
                  </div>
                </div>
                <div class="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-600 dark:text-slate-400">
                  <strong class="text-slate-700 dark:text-slate-300">Failover:</strong> ${escapeHtml7(svc.failover)}
                </div>
              </div>
            `).join("")}
          </div>
        ` : `
          <div class="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <div class="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
              ${Icons.network("w-5 h-5")}
            </div>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-300">Sin integraciones externas documentadas</div>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              Si tu sistema consume APIs externas, bases de datos o brokers de mensajer\xEDa, documenta sus contratos para auditar su contingencia.
            </p>
          </div>
        `}
      </section>

      <!-- ============================================================== -->
      <!-- 5. GUARDRAILS ANTI-SESGO & DIRECTRICES DE C\xD3DIGO               -->
      <!-- ============================================================== -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              ${Icons.code}
            </span>
            <span>Directrices Anti-Sesgo & Convenciones de Ingenier\xEDa</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reglas de oro para asegurar que agentes de IA y desarrolladores respeten la arquitectura del proyecto
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Guardrails Anti-Alucinaci\xF3n -->
          <div class="p-5 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/15 space-y-3">
            <h4 class="text-xs font-bold font-mono text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              ${Icons.shield} <span>Guardrails de No-Alucinaci\xF3n (Inviolables)</span>
            </h4>
            <ul class="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              ${(guardrails.length > 0 ? guardrails : [
      "Prohibido instalar paquetes o bibliotecas redundantes no can\xF3nicas.",
      "Toda regla de negocio BR-* debe implementarse con tests automatizados.",
      "Inversi\xF3n de dependencias obligatoria en controladores y servicios."
    ]).map((g) => `
                <li class="flex items-start gap-2">
                  <span class="text-rose-500 font-bold shrink-0 mt-0.5">&times;</span>
                  <span>${escapeHtml7(g)}</span>
                </li>
              `).join("")}
            </ul>
          </div>

          <!-- Convenciones de Nomenclatura -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3">
            <h4 class="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              ${Icons.tag} <span>Convenciones de Nomenclatura & Control de Versiones</span>
            </h4>
            <div class="space-y-2 text-xs font-mono">
              <div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400">Archivos:</span>
                <span class="text-slate-800 dark:text-slate-200 font-semibold">${naming.files || "kebab-case"}</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400">Clases / Tipos:</span>
                <span class="text-slate-800 dark:text-slate-200 font-semibold">${naming.classes || "PascalCase"}</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400">Ramas Git:</span>
                <code class="text-indigo-600 dark:text-indigo-400 font-bold">{type}/INT-{id}/{name} (\u226480c)</code>
              </div>
              <div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400">Commits:</span>
                <code class="text-indigo-600 dark:text-indigo-400 font-bold">feat(scope): desc / fix(...)</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- MODAL: CREAR NUEVO DOCUMENTO                                   -->
      <!-- ============================================================== -->
      <div id="new-doc-modal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm hidden items-center justify-center p-4">
        <div class="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              ${Icons.fileText} <span>Crear Nuevo Documento T\xE9cnico</span>
            </h3>
            <button type="button" data-action="close-new-doc-modal" class="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer">
              ${Icons.close("w-3.5 h-3.5")}
            </button>
          </div>
          
          <form id="new-doc-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">M\xF3dulo o Categor\xEDa:</label>
              <input type="text" id="new-doc-module" placeholder="general, backend, billing, infra..." value="general" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none" required />
            </div>

            <div>
              <label class="block font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">Nombre del Archivo (.md):</label>
              <input type="text" id="new-doc-filename" placeholder="mi-especificacion.md" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none" required />
            </div>

            <div>
              <label class="block font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">Contenido Markdown Inicial:</label>
              <textarea id="new-doc-content" rows="8" placeholder="# T\xEDtulo del Documento&#10;&#10;Descripci\xF3n y requerimientos..." class="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 resize-none focus:ring-1 focus:ring-indigo-500 focus:outline-none" required></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button type="button" data-action="close-new-doc-modal" class="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer">
                Cancelar
              </button>
              <button type="submit" class="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md transition-colors cursor-pointer">
                Crear Documento
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL: PROMPT BUNDLER DIN\xC1MICO PARA IA (SYSTEM PROMPT)          -->
      <!-- ============================================================== -->
      <div id="ai-context-modal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm hidden items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              ${Icons.bot} <span>Contexto Can\xF3nico para alimentar a la IA (System Prompt)</span>
            </h3>
            <button type="button" data-action="close-ai-context-modal" class="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer">
              ${Icons.close("w-3.5 h-3.5")}
            </button>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400">
            Copia estas instrucciones generadas en vivo desde los metadatos reales del arn\xE9s para inicializar cualquier modelo (Claude, Gemini, ChatGPT, Codex) sin sesgo:
          </p>
          <div class="relative">
            <textarea id="ai-context-prompt-text" readonly rows="13" class="w-full p-3.5 font-mono text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 resize-none focus:outline-none leading-relaxed">${escapeHtml7(dynamicAiPrompt)}</textarea>
          </div>
          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" 
                    id="copy-context-btn" 
                    class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer">
              Copiar al Portapapeles
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL: EXPANDIR DIAGRAMAS A PANTALLA COMPLETA                   -->
      <!-- ============================================================== -->
      <div id="diagram-modal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden items-center justify-center p-4">
        <div class="w-full max-w-6xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-indigo-600 dark:text-indigo-400">${Icons.architecture}</span>
              <h3 id="diagram-modal-title" class="font-bold text-sm text-slate-900 dark:text-white">Diagrama Ampliado</h3>
            </div>
            <button type="button" data-action="close-diagram-modal" class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer">
              ${Icons.close("w-3.5 h-3.5")}
            </button>
          </div>
          <div id="diagram-modal-content" class="p-6 overflow-auto flex-1 flex justify-center items-center bg-slate-50 dark:bg-slate-950">
          </div>
        </div>
      </div>

    </div>
  `;
  }
  function getShelfIconSvg(shelfId, cls = "w-4 h-4") {
    switch (shelfId) {
      case "architecture":
        return Icons.architecture(cls);
      case "business_rules":
        return Icons.scale(cls);
      case "requirements":
        return Icons.fileText(cls);
      case "adrs":
        return Icons.cube(cls);
      case "standards":
        return Icons.shield(cls);
      case "modules":
        return Icons.folder(cls);
      default:
        return Icons.book(cls);
    }
  }
  function renderTableOfContentsHtml(toc = []) {
    if (!toc || toc.length === 0) {
      return `<div class="text-[11px] text-slate-400 italic py-2">Sin encabezados en este documento.</div>`;
    }
    return `
    <nav class="space-y-1 text-xs font-mono">
      ${toc.map((item) => `
        <a href="#${item.id}" 
           class="block py-1 px-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate text-slate-600 dark:text-slate-400 ${item.level === 1 ? "font-bold text-slate-900 dark:text-slate-100" : item.level === 2 ? "pl-3" : "pl-5 text-[11px]"}"
           title="${escapeAttr4(item.text)}">
          ${escapeHtml7(item.text)}
        </a>
      `).join("")}
    </nav>
  `;
  }
  function buildAiSystemPrompt({ projectSpec, kData, rules = [], services = [], guardrails = [], naming = {} }) {
    const pName = projectSpec?.project?.name || projectSpec?.name || "Sistema de Ingenier\xEDa Soberana";
    const archStyle = projectSpec?.architecture?.style || "Clean Architecture (Hexagonal)";
    const patterns = (projectSpec?.architecture?.patterns || []).join(", ");
    const stack = projectSpec?.tech_stack ? Object.entries(projectSpec.tech_stack).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v?.name || v}`).join(" | ") : "Agn\xF3stico";
    const rulesText = rules.slice(0, 10).map((r) => `- ${r.id} (${r.module || "general"}): ${r.title}. ${r.description}`).join("\n");
    const servicesText = services.map((s) => `- ${s.name} (${s.type}): Protocolo ${s.protocol}, Auth: ${s.auth}, Var: ${s.env_var}`).join("\n");
    const guardrailsText = guardrails.map((g) => `- [GUARDRAIL] ${g}`).join("\n");
    return `# Contexto Can\xF3nico del Proyecto \u2014 ${pName}
Arquitectura: ${archStyle} ${patterns ? `(${patterns})` : ""}
Stack Tecnol\xF3gico: ${stack}

## Reglas de Negocio Clave (Invariantes Obligatorias):
${rulesText || "- Sin reglas de negocio registradas a\xFAn."}

## Integraciones y Servicios Externos:
${servicesText || "- Sin servicios externos registrados a\xFAn."}

## Guardrails Anti-Sesgo & Est\xE1ndares:
${guardrailsText || "- No inventar librer\xEDas redundantes.\n- Respetar convenci\xF3n de ramas {type}/INT-{id}/{name} (\u226480c)."}

## Convenciones de Nomenclatura:
- Archivos: ${naming.files || "kebab-case"}
- Clases / Tipos: ${naming.classes || "PascalCase"}
- Ramas Git: {type}/INT-{id}/{name} (\u226480c)
- Commits: Conventional Commits (feat, fix, docs, refactor)
`;
  }
  function escapeHtml7(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function escapeAttr4(text) {
    if (!text) return "";
    return String(text).replace(/"/g, "&quot;");
  }
  function getFallbackKnowledge() {
    if (typeof window !== "undefined" && window.__FALLBACK_DATA__?.knowledgeIndex) {
      return window.__FALLBACK_DATA__.knowledgeIndex;
    }
    return {
      diagrams: [],
      business_rules: [],
      external_services: [],
      coding_standards: { guardrails: [], naming_conventions: {} },
      docs: getDefaultDocs()
    };
  }
  function buildDocMetadataFallback(docs) {
    const meta = {};
    for (const [k, c] of Object.entries(docs)) {
      const words = c.trim().split(/\s+/).length;
      meta[k] = {
        key: k,
        title: k.replace(/\.md$/, "").replace(/[-_]/g, " "),
        summary: c.slice(0, 140) + "...",
        shelf: k.startsWith("modules/") ? "modules" : "architecture",
        readingTime: Math.max(1, Math.ceil(words / 200)),
        wordCount: words,
        ruleCount: (c.match(/BR-[A-Z]+-[0-9]+/g) || []).length,
        reqCount: (c.match(/RF-[A-Z]+-[0-9]+/g) || []).length,
        adrCount: (c.match(/ADR-[0-9]+/g) || []).length,
        moduleName: k.startsWith("modules/") ? k.split("/")[1] : null
      };
    }
    return meta;
  }
  function buildShelvesFallback(docMetadata) {
    const shelves = {
      architecture: { id: "architecture", title: "Arquitectura & Modelado C4", iconName: "architecture", docs: [] },
      business_rules: { id: "business_rules", title: "Reglas de Negocio & Dominio", iconName: "business_rules", docs: [] },
      requirements: { id: "requirements", title: "Requerimientos & Metodolog\xEDa \xC1gil", iconName: "requirements", docs: [] },
      adrs: { id: "adrs", title: "Decisiones de Arquitectura (ADRs)", iconName: "adrs", docs: [] },
      standards: { id: "standards", title: "Est\xE1ndares, Capacidades & Servicios", iconName: "standards", docs: [] },
      modules: { id: "modules", title: "M\xF3dulos & Bounded Contexts", iconName: "modules", docs: [] }
    };
    for (const [k, m] of Object.entries(docMetadata)) {
      const s = m.shelf && shelves[m.shelf] ? m.shelf : k.startsWith("modules/") ? "modules" : "architecture";
      shelves[s].docs.push(k);
    }
    return shelves;
  }
  function buildModulesDataFallback(docMetadata) {
    const modules = {};
    for (const [k, m] of Object.entries(docMetadata)) {
      if (k.startsWith("modules/")) {
        const parts = k.split("/");
        const modId = parts[1];
        const filename = parts.slice(2).join("/");
        if (!modules[modId]) {
          modules[modId] = {
            id: modId,
            name: modId,
            title: modId.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            status: "COMPLETAMENTE CUBIERTO",
            docs: [],
            docMetadata: {}
          };
        }
        modules[modId].docs.push(k);
        modules[modId].docMetadata[filename] = m;
      }
    }
    return modules;
  }
  function getDefaultDocs() {
    return {
      "c4-model.md": "# Modelo C4 \u2014 Arquitectura de Sistema y Contenedores\n\n> [!NOTE]\n> Especificaci\xF3n de contexto y contenedores del sistema.\n\n## Componentes\n- API Gateway\n- Microservicios de Dominio\n- Bases de datos transaccionales",
      "coding-standards.md": "# Est\xE1ndares de Codificaci\xF3n & Guardrails Anti-Sesgo\n\n> [!NOTE]\n> Este documento define las directrices obligatorias para desarrolladores y agentes de IA.\n\n## Convenciones\n- **Ramas**: `{type}/INT-{id}/{name}` (\u226480c)\n- **Commits**: `feat(scope): desc` o `fix(scope): desc`\n\n## Guardrails Estrictos\n1. No instalar librer\xEDas redundantes.\n2. Inversi\xF3n de dependencias estricta en controladores."
    };
  }

  // project-docs/src/features/plane-layout/PlaneSidebar.js
  function renderPlaneSidebar({
    currentView = "issues",
    activeWorkspace = "Harness Engineering",
    activeProject = "Arn\xE9s de Ingenier\xEDa SDD",
    issueCount = 0,
    cycleCount = 0,
    moduleCount = 0,
    pageCount = 0,
    isCollapsed = false,
    onNavigate = () => {
    }
  }) {
    return `
    <aside id="plane-sidebar" class="${isCollapsed ? "w-16" : "w-64"} bg-zinc-950 border-r border-zinc-800/80 flex flex-col shrink-0 transition-all duration-200 select-none h-screen sticky top-0 z-30">
      <!-- Workspace Switcher Header -->
      <div class="h-14 px-4 border-b border-zinc-800/80 flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
            HE
          </div>
          ${!isCollapsed ? `
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-semibold text-zinc-100 truncate tracking-tight">${activeWorkspace}</span>
              <span class="text-[10px] text-zinc-400 truncate">Plane Edition</span>
            </div>
          ` : ""}
        </div>
        ${!isCollapsed ? `
          <button id="toggle-sidebar-collapse" class="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded transition-colors" title="Colapsar barra lateral">
            ${Icons.chevronLeft("w-4 h-4")}
          </button>
        ` : `
          <button id="toggle-sidebar-collapse" class="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded transition-colors" title="Expandir barra lateral">
            ${Icons.chevronRight("w-4 h-4")}
          </button>
        `}
      </div>

      <!-- Project Selector Pill -->
      <div class="px-3 py-3 border-b border-zinc-800/50">
        <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800/80 text-zinc-200">
          <div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
          ${!isCollapsed ? `
            <span class="text-xs font-medium truncate flex-1">${activeProject}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">SDD</span>
          ` : ""}
        </div>
      </div>

      <!-- Main Navigation Menu -->
      <nav class="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        <div class="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase ${isCollapsed ? "text-center" : ""}">
          ${!isCollapsed ? "Gesti\xF3n de Proyecto" : "\u2022\u2022\u2022"}
        </div>

        <!-- Issues (Work Items) -->
        <button data-plane-nav="issues" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === "issues" ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}">
          ${Icons.kanban("w-4 h-4 shrink-0")}
          ${!isCollapsed ? `
            <span class="flex-1 text-left">Tareas (Issues)</span>
            <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-800/80 text-zinc-300 font-mono">${issueCount}</span>
          ` : ""}
        </button>

        <!-- Cycles (Sprints) -->
        <button data-plane-nav="cycles" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === "cycles" ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}">
          ${Icons.cycle("w-4 h-4 shrink-0")}
          ${!isCollapsed ? `
            <span class="flex-1 text-left">Ciclos (Cycles)</span>
            <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-800/80 text-zinc-300 font-mono">${cycleCount}</span>
          ` : ""}
        </button>

        <!-- Modules (Epics) -->
        <button data-plane-nav="modules" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === "modules" ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}">
          ${Icons.moduleIcon("w-4 h-4 shrink-0")}
          ${!isCollapsed ? `
            <span class="flex-1 text-left">M\xF3dulos (Epics)</span>
            <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-800/80 text-zinc-300 font-mono">${moduleCount}</span>
          ` : ""}
        </button>

        <!-- Pages (Docs & Knowledge) -->
        <button data-plane-nav="pages" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === "pages" ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}">
          ${Icons.page("w-4 h-4 shrink-0")}
          ${!isCollapsed ? `
            <span class="flex-1 text-left">P\xE1ginas (Docs / IA)</span>
            <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-800/80 text-zinc-300 font-mono">${pageCount}</span>
          ` : ""}
        </button>

        <!-- Analytics -->
        <button data-plane-nav="analytics" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === "analytics" ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}">
          ${Icons.activity("w-4 h-4 shrink-0")}
          ${!isCollapsed ? `
            <span class="flex-1 text-left">M\xE9tricas & Burn-down</span>
          ` : ""}
        </button>

        <div class="pt-4 px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase ${isCollapsed ? "text-center" : ""}">
          ${!isCollapsed ? "Vistas Heredadas" : "\u2022\u2022\u2022"}
        </div>

        <!-- 3D Space View -->
        <button data-plane-nav="space3d" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === "space3d" ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}">
          ${Icons.cube("w-4 h-4 shrink-0")}
          ${!isCollapsed ? `<span class="flex-1 text-left">Constelaci\xF3n 3D</span>` : ""}
        </button>

        <!-- Dependency Graph -->
        <button data-plane-nav="depgraph" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === "depgraph" ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}">
          ${Icons.gitTree("w-4 h-4 shrink-0")}
          ${!isCollapsed ? `<span class="flex-1 text-left">Grafo de Dependencias</span>` : ""}
        </button>

        <!-- Tablero Cl\xE1sico -->
        <a href="#features" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors" title="Ver tablero en modo cl\xE1sico con pesta\xF1as">
          ${Icons.table("w-4 h-4 shrink-0")}
          ${!isCollapsed ? `<span class="flex-1 text-left">Tablero Cl\xE1sico</span>` : ""}
        </a>
      </nav>

      <!-- Footer: Agentes & SQLite State -->
      <div class="p-3 border-t border-zinc-800/80 bg-zinc-950/80 space-y-2">
        ${!isCollapsed ? `
          <div class="flex items-center justify-between text-[11px] text-zinc-400">
            <span class="flex items-center gap-1.5 font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SQLite Relacional
            </span>
            <span class="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono">WAL</span>
          </div>
          <div class="text-[10px] text-zinc-400 flex items-center justify-between">
            <span>Dual Sync: Markdown</span>
            <span class="text-emerald-400 font-mono">100% OK</span>
          </div>
        ` : `
          <div class="flex justify-center" title="SQLite Conectado">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        `}
      </div>
    </aside>
  `;
  }

  // project-docs/src/features/plane-layout/PlaneTopBar.js
  function renderPlaneTopBar({
    workspaceName = "Harness Engineering",
    projectName = "Arn\xE9s SDD",
    viewTitle = "Tareas (Issues)",
    theme = "dark",
    activeSpec = null,
    onOpenOmnibox = () => {
    },
    onSync = () => {
    },
    onToggleTheme = () => {
    }
  }) {
    return `
    <header id="plane-topbar" class="h-14 px-6 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-20">
      <!-- Breadcrumbs -->
      <div class="flex items-center gap-2 text-xs text-zinc-400 overflow-hidden">
        <span class="hover:text-zinc-200 transition-colors cursor-pointer truncate font-medium">${workspaceName}</span>
        <span class="text-zinc-600">/</span>
        <span class="hover:text-zinc-200 transition-colors cursor-pointer truncate">${projectName}</span>
        <span class="text-zinc-600">/</span>
        <span class="text-zinc-100 font-semibold truncate">${viewTitle}</span>
        ${activeSpec && activeSpec.name ? `
          <span class="text-zinc-600">/</span>
          <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono truncate">
            Activo: ${activeSpec.name}
          </span>
        ` : ""}
      </div>

      <!-- Actions & Omnibox Trigger -->
      <div class="flex items-center gap-2.5">
        <!-- Global Search / Omnibox Trigger (Ctrl+K) -->
        <button id="plane-omnibox-trigger" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors shadow-sm">
          ${Icons.search("w-3.5 h-3.5 text-zinc-400")}
          <span class="hidden sm:inline">Buscar tareas, docs, reglas...</span>
          <kbd class="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-[10px] font-mono text-zinc-300">
            Ctrl+K
          </kbd>
        </button>

        <!-- Sync SQLite Button -->
        <button id="plane-sync-trigger" class="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors" title="Sincronizar base de datos SQLite y archivos Markdown">
          ${Icons.refresh("w-4 h-4")}
        </button>

        <!-- Theme Toggle -->
        <button id="plane-theme-toggle" class="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors" title="Cambiar tema">
          ${theme === "dark" ? Icons.sun("w-4 h-4 text-amber-400") : Icons.moon("w-4 h-4 text-zinc-300")}
        </button>
      </div>
    </header>
  `;
  }

  // project-docs/src/features/plane-layout/PlaneControlsBar.js
  function renderPlaneControlsBar({
    currentViewMode = "list",
    // 'list' | 'board' | 'calendar' | 'spreadsheet'
    filterState = "all",
    filterPriority = "all",
    filterAssignee = "all",
    groupBy = "state",
    // 'state' | 'priority' | 'assignee'
    orderBy = "sequence",
    // 'sequence' | 'priority' | 'title'
    searchQuery = "",
    totalIssues = 0,
    filteredIssues = 0
  }) {
    return `
    <div id="plane-controls-bar" class="px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
      <!-- Left: View Mode Pills -->
      <div class="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
        <!-- List View -->
        <button data-view-mode="list" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${currentViewMode === "list" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-200"}">
          ${Icons.table("w-3.5 h-3.5")}
          <span>Lista</span>
        </button>

        <!-- Board (Kanban) View -->
        <button data-view-mode="board" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${currentViewMode === "board" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-200"}">
          ${Icons.kanban("w-3.5 h-3.5")}
          <span>Tablero (Kanban)</span>
        </button>

        <!-- Calendar View -->
        <button data-view-mode="calendar" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${currentViewMode === "calendar" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-200"}">
          ${Icons.calendar("w-3.5 h-3.5")}
          <span>Calendario</span>
        </button>

        <!-- Spreadsheet View -->
        <button data-view-mode="spreadsheet" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${currentViewMode === "spreadsheet" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-200"}">
          ${Icons.grid("w-3.5 h-3.5")}
          <span>Hoja de C\xE1lculo</span>
        </button>
      </div>

      <!-- Right: Filters, Search & Grouping -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Live Filter Input -->
        <div class="relative">
          <input
            id="plane-issue-search"
            type="text"
            placeholder="Filtrar tareas..."
            value="${searchQuery}"
            class="w-40 sm:w-48 pl-7 pr-3 py-1 rounded-md bg-zinc-900/90 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-indigo-500 focus:w-56 transition-all"
          />
          <span class="absolute left-2.5 top-1.5 text-zinc-500 pointer-events-none">
            ${Icons.search("w-3.5 h-3.5")}
          </span>
        </div>

        <!-- Group By Selector -->
        <div class="flex items-center gap-1.5 text-zinc-400 bg-zinc-900/60 px-2 py-1 rounded-md border border-zinc-800/80">
          <span class="text-[11px] text-zinc-400">Agrupar:</span>
          <select id="plane-group-by" class="bg-transparent text-zinc-200 text-xs focus:outline-none cursor-pointer">
            <option value="state" ${groupBy === "state" ? "selected" : ""}>Estado</option>
            <option value="priority" ${groupBy === "priority" ? "selected" : ""}>Prioridad</option>
            <option value="assignee" ${groupBy === "assignee" ? "selected" : ""}>Agente</option>
          </select>
        </div>

        <!-- Filter State Selector -->
        <select id="plane-filter-state" class="bg-zinc-900 text-zinc-200 text-xs px-2.5 py-1 rounded-md border border-zinc-800 focus:outline-none cursor-pointer">
          <option value="all" ${filterState === "all" ? "selected" : ""}>Todos los Estados</option>
          <option value="state-backlog" ${filterState === "state-backlog" ? "selected" : ""}>Backlog</option>
          <option value="state-todo" ${filterState === "state-todo" ? "selected" : ""}>Todo</option>
          <option value="state-in-progress" ${filterState === "state-in-progress" ? "selected" : ""}>In Progress</option>
          <option value="state-in-review" ${filterState === "state-in-review" ? "selected" : ""}>In Review</option>
          <option value="state-done" ${filterState === "state-done" ? "selected" : ""}>Done</option>
        </select>

        <!-- Count Indicator -->
        <span class="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[11px]">
          ${filteredIssues} de ${totalIssues}
        </span>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/plane-issues/IssueListView.js
  function getPriorityBadge(priority) {
    switch ((priority || "").toLowerCase()) {
      case "urgent":
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">${Icons.priorityUrgent("w-3 h-3")} Urgente</span>`;
      case "high":
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">${Icons.priorityHigh("w-3 h-3")} Alta</span>`;
      case "medium":
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">${Icons.priorityMedium("w-3 h-3")} Media</span>`;
      case "low":
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">${Icons.priorityLow("w-3 h-3")} Baja</span>`;
      default:
        return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-normal text-zinc-400">Ninguna</span>`;
    }
  }
  function getAssigneeBadge(role) {
    const r = (role || "leader").toLowerCase();
    let bg = "bg-zinc-800 text-zinc-300";
    if (r.includes("lead")) bg = "bg-purple-900/40 text-purple-300 border border-purple-700/50";
    if (r.includes("impl")) bg = "bg-blue-900/40 text-blue-300 border border-blue-700/50";
    if (r.includes("review") || r.includes("qa")) bg = "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50";
    if (r.includes("author") || r.includes("spec")) bg = "bg-amber-900/40 text-amber-300 border border-amber-700/50";
    return `
    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${bg}">
      ${Icons.bot("w-3 h-3 shrink-0")}
      <span>${role || "leader"}</span>
    </span>
  `;
  }
  function renderIssueListView({
    issues = [],
    states = [],
    groupBy = "state",
    onSelectIssue = () => {
    }
  }) {
    if (!issues || issues.length === 0) {
      return `
      <div class="p-12 text-center text-zinc-400">
        <div class="inline-flex p-3 rounded-full bg-zinc-900 border border-zinc-800 mb-3 text-zinc-400">
          ${Icons.kanban("w-6 h-6")}
        </div>
        <h3 class="text-sm font-medium text-zinc-200">No hay tareas que coincidan con los filtros</h3>
        <p class="text-xs text-zinc-400 mt-1">Modifica los filtros o a\xF1ade nuevas tareas al proyecto.</p>
      </div>
    `;
    }
    const groups = {};
    if (groupBy === "state") {
      for (const s of states) {
        groups[s.id] = { id: s.id, name: s.name, color: s.color, items: [] };
      }
      for (const issue of issues) {
        if (!groups[issue.state_id]) {
          groups[issue.state_id] = { id: issue.state_id, name: issue.state_name || "Sin Estado", color: "#71717a", items: [] };
        }
        groups[issue.state_id].items.push(issue);
      }
    } else if (groupBy === "priority") {
      const pKeys = ["urgent", "high", "medium", "low", "none"];
      const pNames = { urgent: "Urgente", high: "Alta", medium: "Media", low: "Baja", none: "Sin Prioridad" };
      const pColors = { urgent: "#f43f5e", high: "#f59e0b", medium: "#3b82f6", low: "#10b981", none: "#71717a" };
      for (const pk of pKeys) {
        groups[pk] = { id: pk, name: pNames[pk], color: pColors[pk], items: [] };
      }
      for (const issue of issues) {
        const p = (issue.priority || "none").toLowerCase();
        if (!groups[p]) groups[p] = { id: p, name: p, color: "#71717a", items: [] };
        groups[p].items.push(issue);
      }
    } else if (groupBy === "assignee") {
      for (const issue of issues) {
        const a = issue.assignee_role || "Sin Asignar";
        if (!groups[a]) groups[a] = { id: a, name: a, color: "#8b5cf6", items: [] };
        groups[a].items.push(issue);
      }
    }
    let html = `<div class="p-6 space-y-6">`;
    for (const groupKey of Object.keys(groups)) {
      const group = groups[groupKey];
      if (group.items.length === 0 && groupBy !== "state") continue;
      html += `
      <div class="border border-zinc-800/80 rounded-xl bg-zinc-950/60 overflow-hidden shadow-sm">
        <!-- Group Header -->
        <div class="px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${group.color}"></span>
            <span class="text-xs font-semibold text-zinc-200 tracking-tight">${group.name}</span>
            <span class="px-2 py-0.2 rounded-full bg-zinc-800 text-[11px] font-mono text-zinc-400">
              ${group.items.length}
            </span>
          </div>
        </div>

        <!-- Issue Rows -->
        <div class="divide-y divide-zinc-800/50">
          ${group.items.length === 0 ? `
            <div class="px-4 py-3 text-xs text-zinc-400 italic">No hay tareas en esta categor\xEDa.</div>
          ` : group.items.map((issue) => {
        const subtotal = issue.subtasks ? issue.subtasks.length : 0;
        const completed = issue.subtasks ? issue.subtasks.filter((s) => s.status === "done" || s.status === "passed").length : 0;
        const percent = subtotal > 0 ? Math.round(completed / subtotal * 100) : issue.state_id === "state-done" ? 100 : 0;
        return `
              <div
                data-issue-id="${issue.id}"
                class="plane-issue-row px-4 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-zinc-900/60 transition-colors cursor-pointer group"
              >
                <!-- Left: State dot, Key & Title -->
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${issue.state_color || group.color}" title="${issue.state_name}"></span>
                  <span class="text-xs font-mono font-medium text-zinc-400 group-hover:text-indigo-400 shrink-0 transition-colors">
                    ${issue.id}
                  </span>
                  <span class="text-xs font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
                    ${issue.title}
                  </span>
                </div>

                <!-- Right: Metadata Badges -->
                <div class="flex items-center gap-3 shrink-0">
                  <!-- Subtasks Progress -->
                  ${subtotal > 0 ? `
                    <div class="flex items-center gap-2 text-[11px] text-zinc-400">
                      <div class="w-14 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div class="h-full bg-emerald-500 rounded-full" style="width: ${percent}%"></div>
                      </div>
                      <span class="font-mono text-[10px] text-zinc-400">${completed}/${subtotal}</span>
                    </div>
                  ` : ""}

                  <!-- Priority Badge -->
                  ${getPriorityBadge(issue.priority)}

                  <!-- Assignee Avatar / Role -->
                  ${getAssigneeBadge(issue.assignee_role)}

                  <!-- Module Tag -->
                  ${issue.module_name ? `
                    <span class="hidden md:inline-block px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 truncate max-w-[120px]">
                      ${issue.module_name}
                    </span>
                  ` : ""}

                  <!-- Cycle Tag -->
                  ${issue.cycle_name ? `
                    <span class="hidden lg:inline-block px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 truncate max-w-[120px]">
                      ${issue.cycle_name.split(":")[0]}
                    </span>
                  ` : ""}

                  ${Icons.chevronRight("w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors")}
                </div>
              </div>
            `;
      }).join("")}
        </div>
      </div>
    `;
    }
    html += `</div>`;
    return html;
  }

  // project-docs/src/features/plane-issues/IssueBoardView.js
  function getPriorityBadge2(priority) {
    switch ((priority || "").toLowerCase()) {
      case "urgent":
        return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">${Icons.priorityUrgent("w-3 h-3")} Urgente</span>`;
      case "high":
        return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">${Icons.priorityHigh("w-3 h-3")} Alta</span>`;
      case "medium":
        return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">${Icons.priorityMedium("w-3 h-3")} Media</span>`;
      case "low":
        return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">${Icons.priorityLow("w-3 h-3")} Baja</span>`;
      default:
        return "";
    }
  }
  function renderIssueBoardView({
    issues = [],
    states = [],
    onSelectIssue = () => {
    },
    onMoveState = () => {
    }
  }) {
    const issuesByState = {};
    for (const s of states) {
      issuesByState[s.id] = [];
    }
    for (const issue of issues) {
      if (!issuesByState[issue.state_id]) {
        issuesByState[issue.state_id] = [];
      }
      issuesByState[issue.state_id].push(issue);
    }
    return `
    <div class="p-6 overflow-x-auto min-h-[calc(100vh-140px)]">
      <div class="flex items-start gap-4 min-w-[1280px]">
        ${states.map((state, stateIndex) => {
      const colIssues = issuesByState[state.id] || [];
      return `
            <div
              data-state-column="${state.id}"
              class="w-80 shrink-0 flex flex-col rounded-xl bg-zinc-950/70 border border-zinc-800/80 max-h-[calc(100vh-160px)] shadow-sm"
            >
              <!-- Column Header -->
              <div class="p-3 border-b border-zinc-800/80 flex items-center justify-between gap-2 bg-zinc-900/60 rounded-t-xl">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${state.color}"></span>
                  <span class="text-xs font-semibold text-zinc-200 tracking-tight">${state.name}</span>
                  <span class="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-400">
                    ${colIssues.length}
                  </span>
                </div>
              </div>

              <!-- Cards Container -->
              <div class="flex-1 p-2 space-y-2.5 overflow-y-auto">
                ${colIssues.length === 0 ? `
                  <div class="p-6 border border-dashed border-zinc-800/60 rounded-lg text-center text-xs text-zinc-400 italic">
                    Sin tareas
                  </div>
                ` : colIssues.map((issue) => {
        const subtotal = issue.subtasks ? issue.subtasks.length : 0;
        const completed = issue.subtasks ? issue.subtasks.filter((s) => s.status === "done" || s.status === "passed").length : 0;
        const percent = subtotal > 0 ? Math.round(completed / subtotal * 100) : issue.state_id === "state-done" ? 100 : 0;
        const prevState = stateIndex > 0 ? states[stateIndex - 1] : null;
        const nextState = stateIndex < states.length - 1 ? states[stateIndex + 1] : null;
        return `
                    <div
                      data-issue-id="${issue.id}"
                      class="plane-board-card p-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm group space-y-2.5"
                    >
                      <!-- Card Header: ID & Priority -->
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-[11px] font-mono font-medium text-zinc-400 group-hover:text-indigo-400 transition-colors">
                          ${issue.id}
                        </span>
                        <div class="flex items-center gap-1.5">
                          ${getPriorityBadge2(issue.priority)}
                        </div>
                      </div>

                      <!-- Title -->
                      <h4 class="text-xs font-medium text-zinc-100 group-hover:text-white line-clamp-2 leading-relaxed">
                        ${issue.title}
                      </h4>

                      <!-- Subtasks Mini-Bar -->
                      ${subtotal > 0 ? `
                        <div class="space-y-1">
                          <div class="flex items-center justify-between text-[10px] text-zinc-400">
                            <span>Subtareas</span>
                            <span class="font-mono">${completed}/${subtotal} (${percent}%)</span>
                          </div>
                          <div class="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div class="h-full bg-emerald-500 rounded-full" style="width: ${percent}%"></div>
                          </div>
                        </div>
                      ` : ""}

                      <!-- Footer: Assignee, Cycle & Transition Buttons -->
                      <div class="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2 text-[11px]">
                        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-300 font-medium">
                          ${Icons.bot("w-2.5 h-2.5")}
                          <span>${issue.assignee_role || "leader"}</span>
                        </span>

                        <!-- Quick Move State Buttons -->
                        <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          ${prevState ? `
                            <button
                              data-action="move-state"
                              data-issue-id="${issue.id}"
                              data-target-state="${prevState.id}"
                              class="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                              title="Mover a ${prevState.name}"
                            >
                              ${Icons.chevronLeft("w-3 h-3")}
                            </button>
                          ` : ""}
                          ${nextState ? `
                            <button
                              data-action="move-state"
                              data-issue-id="${issue.id}"
                              data-target-state="${nextState.id}"
                              class="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                              title="Mover a ${nextState.name}"
                            >
                              ${Icons.chevronRight("w-3 h-3")}
                            </button>
                          ` : ""}
                        </div>
                      </div>
                    </div>
                  `;
      }).join("")}
              </div>
            </div>
          `;
    }).join("")}
      </div>
    </div>
  `;
  }

  // project-docs/src/features/plane-issues/IssueCalendarView.js
  function renderIssueCalendarView({
    issues = [],
    cycles = [],
    onSelectIssue = () => {
    }
  }) {
    return `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-zinc-100 tracking-tight">Cronograma Temporal de Ciclos & Entregas</h2>
          <p class="text-xs text-zinc-400 mt-0.5">Seguimiento de sprints y ventanas de ejecuci\xF3n de tareas por agentes.</p>
        </div>
      </div>

      <!-- Cycles Timeline Cards -->
      <div class="space-y-4">
        ${cycles.map((cycle) => {
      const cycleIssues = issues.filter((i) => i.cycle_id === cycle.id);
      const total = cycleIssues.length;
      const done = cycleIssues.filter((i) => i.state_id === "state-done").length;
      const percent = total > 0 ? Math.round(done / total * 100) : 0;
      const isActive = cycle.status === "active";
      return `
            <div class="border ${isActive ? "border-indigo-500/40 bg-indigo-950/10" : "border-zinc-800/80 bg-zinc-950/60"} rounded-xl p-5 space-y-4 shadow-sm">
              <!-- Cycle Header -->
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg ${isActive ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-900 text-zinc-400"} border border-zinc-800">
                    ${Icons.calendar("w-4 h-4")}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-xs font-semibold text-zinc-100">${cycle.name}</h3>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${isActive ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}">
                        ${cycle.status.toUpperCase()}
                      </span>
                    </div>
                    <p class="text-[11px] text-zinc-400 mt-0.5">${cycle.description || "Sin descripci\xF3n"}</p>
                  </div>
                </div>

                <div class="text-right">
                  <span class="text-xs font-mono font-medium text-zinc-300">${cycle.start_date} al ${cycle.end_date}</span>
                  <div class="text-[10px] text-zinc-400 mt-0.5">${done} de ${total} completadas (${percent}%)</div>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
              </div>

              <!-- Scheduled Issues in this Cycle -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                ${cycleIssues.map((issue) => `
                  <div
                    data-issue-id="${issue.id}"
                    class="plane-calendar-card p-2.5 rounded-lg bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all flex items-center justify-between gap-2"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${issue.state_color || "#71717a"}"></span>
                      <span class="text-[11px] font-mono font-medium text-zinc-400 shrink-0">${issue.id}</span>
                      <span class="text-xs text-zinc-200 truncate">${issue.title}</span>
                    </div>
                    <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 shrink-0">
                      ${issue.assignee_role}
                    </span>
                  </div>
                `).join("")}
              </div>
            </div>
          `;
    }).join("")}
      </div>
    </div>
  `;
  }

  // project-docs/src/features/plane-issues/IssueSpreadsheetView.js
  function renderIssueSpreadsheetView({
    issues = [],
    onSelectIssue = () => {
    }
  }) {
    return `
    <div class="p-6">
      <div class="border border-zinc-800/80 rounded-xl bg-zinc-950/70 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-zinc-900/90 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 select-none">
                <th class="py-3 px-4 w-24">ID</th>
                <th class="py-3 px-4 min-w-[260px]">T\xEDtulo de Tarea</th>
                <th class="py-3 px-4 w-32">Estado</th>
                <th class="py-3 px-4 w-28">Prioridad</th>
                <th class="py-3 px-4 w-32">Agente</th>
                <th class="py-3 px-4 w-40">M\xF3dulo</th>
                <th class="py-3 px-4 w-36">Ciclo</th>
                <th class="py-3 px-4 w-28">Subtareas</th>
                <th class="py-3 px-4 min-w-[200px]">Rama Git</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/50">
              ${issues.map((issue) => {
      const subtotal = issue.subtasks ? issue.subtasks.length : 0;
      const completed = issue.subtasks ? issue.subtasks.filter((s) => s.status === "done" || s.status === "passed").length : 0;
      return `
                  <tr
                    data-issue-id="${issue.id}"
                    class="plane-spreadsheet-row hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                  >
                    <!-- ID -->
                    <td class="py-2.5 px-4 font-mono font-medium text-zinc-400 group-hover:text-indigo-400">
                      ${issue.id}
                    </td>

                    <!-- Title -->
                    <td class="py-2.5 px-4 font-medium text-zinc-200 group-hover:text-white truncate max-w-xs">
                      ${issue.title}
                    </td>

                    <!-- State -->
                    <td class="py-2.5 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium" style="background-color: ${issue.state_color}20; color: ${issue.state_color}; border: 1px solid ${issue.state_color}40;">
                        <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${issue.state_color}"></span>
                        ${issue.state_name}
                      </span>
                    </td>

                    <!-- Priority -->
                    <td class="py-2.5 px-4">
                      <span class="text-[11px] font-medium text-zinc-300 capitalize">
                        ${issue.priority || "none"}
                      </span>
                    </td>

                    <!-- Assignee -->
                    <td class="py-2.5 px-4">
                      <span class="inline-flex items-center gap-1 text-[11px] text-zinc-300">
                        ${Icons.bot("w-3 h-3 text-zinc-500")}
                        <span>${issue.assignee_role || "leader"}</span>
                      </span>
                    </td>

                    <!-- Module -->
                    <td class="py-2.5 px-4 text-zinc-400 truncate">
                      ${issue.module_name || "Harness Core"}
                    </td>

                    <!-- Cycle -->
                    <td class="py-2.5 px-4 text-zinc-400 truncate">
                      ${issue.cycle_name ? issue.cycle_name.split(":")[0] : "-"}
                    </td>

                    <!-- Subtasks -->
                    <td class="py-2.5 px-4 font-mono text-[11px] text-zinc-300">
                      ${completed}/${subtotal}
                    </td>

                    <!-- Branch -->
                    <td class="py-2.5 px-4 font-mono text-[10px] text-zinc-400 truncate max-w-[200px]" title="${issue.branch || ""}">
                      ${issue.branch || "-"}
                    </td>
                  </tr>
                `;
    }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/plane-issues/IssueDetailModal.js
  function renderIssueDetailModal({
    issue = null,
    states = [],
    cycles = [],
    modules = [],
    onClose = () => {
    },
    onUpdateState = () => {
    },
    onUpdatePriority = () => {
    }
  }) {
    if (!issue) return "";
    const subtotal = issue.subtasks ? issue.subtasks.length : 0;
    const completed = issue.subtasks ? issue.subtasks.filter((s) => s.status === "done" || s.status === "passed").length : 0;
    const percent = subtotal > 0 ? Math.round(completed / subtotal * 100) : 0;
    return `
    <div id="plane-issue-modal-backdrop" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      <div id="plane-issue-modal-card" class="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-4 bg-zinc-900/50">
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-zinc-800 text-indigo-400 border border-zinc-700/60">
              ${issue.id}
            </span>
            <span class="text-zinc-500">/</span>
            <span class="text-xs text-zinc-400 font-medium truncate max-w-sm">
              ${issue.module_name || "Harness"}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button id="plane-modal-close" class="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              ${Icons.close("w-4 h-4")}
            </button>
          </div>
        </div>

        <!-- Modal Body (Two Columns: Main Details + Metadata Sidebar) -->
        <div class="flex-1 flex flex-col lg:flex-row overflow-y-auto">
          <!-- Main Content (Left) -->
          <div class="flex-1 p-6 space-y-6 lg:border-r border-zinc-800 overflow-y-auto">
            <!-- Title -->
            <div>
              <h2 class="text-lg font-bold text-zinc-100 tracking-tight leading-snug">
                ${issue.title}
              </h2>
            </div>

            <!-- User Story Callout -->
            ${issue.user_story_i_want ? `
              <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs">
                <div class="font-semibold text-zinc-300 flex items-center gap-1.5">
                  ${Icons.lightbulb("w-3.5 h-3.5 text-amber-400")}
                  <span>Historia de Usuario (User Story)</span>
                </div>
                <div class="text-zinc-400 pl-5 space-y-0.5">
                  <p><strong class="text-zinc-300">Como:</strong> ${issue.user_story_as_a || "Desarrollador"}</p>
                  <p><strong class="text-zinc-300">Quiero:</strong> ${issue.user_story_i_want}</p>
                  <p><strong class="text-zinc-300">Para:</strong> ${issue.user_story_so_that}</p>
                </div>
              </div>
            ` : ""}

            <!-- Description / Specification -->
            <div class="space-y-2">
              <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Descripci\xF3n & Alcance</h3>
              <div class="text-xs text-zinc-300 leading-relaxed bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/80">
                ${issue.description || "Sin descripci\xF3n detallada."}
              </div>
            </div>

            <!-- Acceptance Criteria -->
            ${issue.acceptance && issue.acceptance.length > 0 ? `
              <div class="space-y-2">
                <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Criterios de Aceptaci\xF3n (EARS)</h3>
                <div class="space-y-2">
                  ${issue.acceptance.map((crit, idx) => `
                    <div class="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60 text-xs text-zinc-300">
                      <span class="p-0.5 rounded text-emerald-400 mt-0.5">${Icons.check("w-3.5 h-3.5")}</span>
                      <span>${crit}</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            ` : ""}

            <!-- Subtasks Section (Jira DEV & QA) -->
            ${issue.subtasks && issue.subtasks.length > 0 ? `
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Subtareas Jira DEV / QA</h3>
                  <span class="text-xs font-mono text-zinc-400">${completed} de ${subtotal} (${percent}%)</span>
                </div>

                <div class="space-y-2">
                  ${issue.subtasks.map((sub) => {
      const isPassed = sub.status === "done" || sub.status === "passed";
      const isQa = sub.type === "qa";
      return `
                      <div class="p-3 rounded-xl border ${isPassed ? "border-emerald-500/20 bg-emerald-950/10" : "border-zinc-800 bg-zinc-900/40"} flex items-start justify-between gap-3 text-xs">
                        <div class="flex items-start gap-2.5">
                          <span class="p-0.5 rounded ${isPassed ? "text-emerald-400" : "text-zinc-500"} mt-0.5">
                            ${isPassed ? Icons.checkCircle("w-4 h-4") : Icons.clock("w-4 h-4")}
                          </span>
                          <div>
                            <div class="flex items-center gap-2">
                              <span class="font-mono text-[11px] font-semibold text-zinc-300">${sub.id}</span>
                              <span class="text-[10px] px-1.5 py-0.2 rounded font-medium ${isQa ? "bg-purple-900/40 text-purple-300" : "bg-blue-900/40 text-blue-300"}">
                                ${isQa ? "QA Subtask" : "DEV Subtask"}
                              </span>
                            </div>
                            <p class="text-zinc-200 mt-1">${sub.title}</p>
                          </div>
                        </div>

                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-medium ${isPassed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"}">
                          ${sub.status.toUpperCase()}
                        </span>
                      </div>
                    `;
    }).join("")}
                </div>
              </div>
            ` : ""}

            <!-- Evidence Section if completed -->
            ${issue.evidence_summary ? `
              <div class="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/20 space-y-1 text-xs">
                <span class="font-semibold text-emerald-400 flex items-center gap-1.5">
                  ${Icons.shield("w-3.5 h-3.5")} Resumen de Cierre & Verificaci\xF3n
                </span>
                <p class="text-zinc-300 mt-1">${issue.evidence_summary}</p>
              </div>
            ` : ""}
          </div>

          <!-- Metadata Sidebar (Right) -->
          <div class="w-full lg:w-72 p-6 bg-zinc-950/90 space-y-5 text-xs shrink-0">
            <!-- State Selector -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Estado (Workflow)</label>
              <select
                id="modal-state-select"
                data-issue-id="${issue.id}"
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              >
                ${states.map((s) => `
                  <option value="${s.id}" ${s.id === issue.state_id ? "selected" : ""}>
                    ${s.name}
                  </option>
                `).join("")}
              </select>
            </div>

            <!-- Priority Selector -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Prioridad</label>
              <select
                id="modal-priority-select"
                data-issue-id="${issue.id}"
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors capitalize"
              >
                <option value="urgent" ${issue.priority === "urgent" ? "selected" : ""}>Urgente</option>
                <option value="high" ${issue.priority === "high" ? "selected" : ""}>Alta</option>
                <option value="medium" ${issue.priority === "medium" ? "selected" : ""}>Media</option>
                <option value="low" ${issue.priority === "low" ? "selected" : ""}>Baja</option>
                <option value="none" ${issue.priority === "none" ? "selected" : ""}>Ninguna</option>
              </select>
            </div>

            <!-- Assignee -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Agente Asignado</label>
              <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                ${Icons.bot("w-4 h-4 text-indigo-400")}
                <span class="font-medium">${issue.assignee_role || "leader"}</span>
              </div>
            </div>

            <!-- Cycle (Sprint) -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Ciclo (Sprint)</label>
              <div class="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs truncate">
                ${issue.cycle_name || "Sin ciclo"}
              </div>
            </div>

            <!-- Module (Epic) -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">M\xF3dulo (Epic)</label>
              <div class="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs truncate">
                ${issue.module_name || "Harness Core"}
              </div>
            </div>

            <!-- Branch -->
            ${issue.branch ? `
              <div class="space-y-1.5">
                <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Rama Git (INT-*)</label>
                <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300 break-all select-all">
                  ${issue.branch}
                </div>
              </div>
            ` : ""}

            <!-- Spec Folder -->
            ${issue.spec_folder ? `
              <div class="space-y-1.5">
                <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Especificaci\xF3n Formal</label>
                <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-indigo-400 break-all truncate">
                  ${issue.spec_folder}
                </div>
              </div>
            ` : ""}
          </div>
        </div>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/plane-cycles/CyclesView.js
  function renderCyclesView({
    cycles = [],
    issues = [],
    onSelectIssue = () => {
    }
  }) {
    const activeCycle = cycles.find((c) => c.status === "active") || cycles[cycles.length - 1] || {};
    const activeIssues = issues.filter((i) => i.cycle_id === activeCycle.id);
    const total = activeIssues.length;
    const done = activeIssues.filter((i) => i.state_id === "state-done").length;
    const inProgress = activeIssues.filter((i) => i.state_id === "state-in-progress" || i.state_id === "state-in-review").length;
    const backlog = total - done - inProgress;
    const percent = total > 0 ? Math.round(done / total * 100) : 0;
    const points = [
      { label: "D\xEDa 1", remaining: total, ideal: total },
      { label: "D\xEDa 4", remaining: Math.max(0, total - Math.round(done * 0.3)), ideal: Math.round(total * 0.8) },
      { label: "D\xEDa 7", remaining: Math.max(0, total - Math.round(done * 0.6)), ideal: Math.round(total * 0.6) },
      { label: "D\xEDa 10", remaining: Math.max(0, total - done), ideal: Math.round(total * 0.4) },
      { label: "D\xEDa 14", remaining: Math.max(0, total - done), ideal: 0 }
    ];
    const svgWidth = 600;
    const svgHeight = 160;
    const padding = 30;
    const maxVal = Math.max(total, 5);
    const getX = (idx) => padding + idx * ((svgWidth - padding * 2) / (points.length - 1));
    const getY = (val) => svgHeight - padding - val / maxVal * (svgHeight - padding * 2);
    const idealPath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx)} ${getY(p.ideal)}`).join(" ");
    const realPath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx)} ${getY(p.remaining)}`).join(" ");
    return `
    <div class="p-6 space-y-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            ${Icons.cycle("w-5 h-5 text-indigo-400")}
            <span>Ciclos de Desarrollo (Sprints Plane)</span>
          </h1>
          <p class="text-xs text-zinc-400 mt-0.5">Seguimiento temporal de iteraciones \xE1giles, burn-down y velocidad de entrega.</p>
        </div>
      </div>

      <!-- Active Cycle Hero Card -->
      <div class="border border-indigo-500/30 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900/60 to-indigo-950/20 p-6 space-y-6 shadow-xl">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 class="text-base font-bold text-white tracking-tight">${activeCycle.name || "Ciclo Activo"}</h2>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-semibold">
                ACTIVO
              </span>
            </div>
            <p class="text-xs text-zinc-400 max-w-xl">${activeCycle.description || ""}</p>
          </div>

          <div class="flex items-center gap-6">
            <div class="text-right">
              <span class="text-[11px] text-zinc-400 uppercase font-semibold">Rango del Ciclo</span>
              <div class="text-xs font-mono font-bold text-zinc-200 mt-0.5">${activeCycle.start_date} al ${activeCycle.end_date}</div>
            </div>
            <div class="text-right">
              <span class="text-[11px] text-zinc-400 uppercase font-semibold">Progreso</span>
              <div class="text-xs font-mono font-bold text-emerald-400 mt-0.5">${percent}%</div>
            </div>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center space-y-1">
            <span class="text-[11px] text-zinc-400">Total Tareas</span>
            <div class="text-lg font-bold text-zinc-100 font-mono">${total}</div>
          </div>
          <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center space-y-1">
            <span class="text-[11px] text-emerald-400">Completadas</span>
            <div class="text-lg font-bold text-emerald-400 font-mono">${done}</div>
          </div>
          <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center space-y-1">
            <span class="text-[11px] text-amber-400">En Progreso</span>
            <div class="text-lg font-bold text-amber-400 font-mono">${inProgress}</div>
          </div>
          <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center space-y-1">
            <span class="text-[11px] text-zinc-400">Pendientes</span>
            <div class="text-lg font-bold text-zinc-400 font-mono">${backlog}</div>
          </div>
        </div>

        <!-- Interactive SVG Burn-down Chart -->
        <div class="space-y-2 pt-2">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span class="font-medium text-zinc-300">Gr\xE1fico de Burn-down de Tareas</span>
            <div class="flex items-center gap-4 text-[11px]">
              <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-zinc-600 border-dashed"></span> Ideal</span>
              <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-indigo-400"></span> Real</span>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 overflow-x-auto">
            <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-40 max-w-full">
              <!-- Grid lines -->
              <line x1="${padding}" y1="${getY(0)}" x2="${svgWidth - padding}" y2="${getY(0)}" stroke="#27272a" stroke-width="1"/>
              <line x1="${padding}" y1="${getY(maxVal / 2)}" x2="${svgWidth - padding}" y2="${getY(maxVal / 2)}" stroke="#27272a" stroke-width="1" stroke-dasharray="2 2"/>
              <line x1="${padding}" y1="${getY(maxVal)}" x2="${svgWidth - padding}" y2="${getY(maxVal)}" stroke="#27272a" stroke-width="1"/>

              <!-- Ideal Line (Dashed) -->
              <path d="${idealPath}" fill="none" stroke="#52525b" stroke-width="2" stroke-dasharray="4 4"/>

              <!-- Real Line -->
              <path d="${realPath}" fill="none" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round"/>

              <!-- Points -->
              ${points.map((p, idx) => `
                <circle cx="${getX(idx)}" cy="${getY(p.remaining)}" r="4" fill="#818cf8" stroke="#1e1b4b" stroke-width="2"/>
                <text x="${getX(idx)}" y="${svgHeight - 8}" font-size="9" fill="#71717a" text-anchor="middle" font-family="monospace">${p.label}</text>
              `).join("")}
            </svg>
          </div>
        </div>
      </div>

      <!-- All Cycles Accordion -->
      <div class="space-y-4">
        <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Historial y Pr\xF3ximos Ciclos</h3>

        <div class="space-y-3">
          ${cycles.map((c) => {
      const cIssues = issues.filter((i) => i.cycle_id === c.id);
      const cTotal = cIssues.length;
      const cDone = cIssues.filter((i) => i.state_id === "state-done").length;
      const cPercent = cTotal > 0 ? Math.round(cDone / cTotal * 100) : 0;
      return `
              <div class="border border-zinc-800/80 rounded-xl bg-zinc-950/60 p-4 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                      ${Icons.cycle("w-4 h-4")}
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-zinc-200">${c.name}</h4>
                      <p class="text-[11px] text-zinc-400">${c.description || ""}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-4 text-xs font-mono">
                    <span class="text-zinc-400">${c.start_date} al ${c.end_date}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${c.status === "completed" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : c.status === "active" ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "bg-zinc-800 text-zinc-400"}">
                      ${c.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>${cDone} de ${cTotal} tareas completadas</span>
                    <span>${cPercent}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                    <div class="h-full bg-emerald-500 rounded-full" style="width: ${cPercent}%"></div>
                  </div>
                </div>
              </div>
            `;
    }).join("")}
        </div>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/plane-modules/ModulesView.js
  function renderModulesView({
    modules = [],
    issues = [],
    onSelectIssue = () => {
    }
  }) {
    return `
    <div class="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
          ${Icons.moduleIcon("w-5 h-5 text-indigo-400")}
          <span>M\xF3dulos de Arquitectura & Bounded Contexts (Plane Modules)</span>
        </h1>
        <p class="text-xs text-zinc-400 mt-0.5">Agrupaci\xF3n modular de requerimientos y epics de arquitectura asignados a roles especializados.</p>
      </div>

      <!-- Module Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${modules.map((mod) => {
      const modIssues = issues.filter((i) => i.module_id === mod.id);
      const total = modIssues.length;
      const done = modIssues.filter((i) => i.state_id === "state-done").length;
      const inProgress = modIssues.filter((i) => i.state_id === "state-in-progress" || i.state_id === "state-in-review").length;
      const percent = total > 0 ? Math.round(done / total * 100) : 0;
      const isDone = done === total && total > 0;
      return `
            <div class="border border-zinc-800/80 rounded-2xl bg-zinc-950/70 p-5 space-y-4 hover:border-zinc-700/80 transition-all shadow-sm">
              <!-- Module Header -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400">
                    ${Icons.cube("w-5 h-5")}
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-zinc-100 tracking-tight">${mod.name}</h3>
                    <p class="text-[11px] text-zinc-400 line-clamp-1">${mod.description || ""}</p>
                  </div>
                </div>

                <span class="px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${isDone ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"}">
                  ${isDone ? "COMPLETADO" : "EN DESARROLLO"}
                </span>
              </div>

              <!-- Lead Role & Counts -->
              <div class="flex items-center justify-between text-xs pt-1">
                <div class="flex items-center gap-1.5 text-zinc-400">
                  <span>L\xEDder T\xE9cnico:</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] font-medium">
                    ${Icons.bot("w-3 h-3 text-indigo-400")}
                    <span>${mod.lead_role || "leader"}</span>
                  </span>
                </div>

                <div class="font-mono text-xs text-zinc-300">
                  <span class="text-emerald-400 font-bold">${done}</span> de ${total} completadas
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="space-y-1">
                <div class="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                  <div class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
                </div>
                <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Progreso acumulado</span>
                  <span>${percent}%</span>
                </div>
              </div>

              <!-- Issues Mini List -->
              <div class="pt-2 border-t border-zinc-800/60 space-y-1.5 max-h-48 overflow-y-auto">
                ${modIssues.map((issue) => `
                  <div
                    data-issue-id="${issue.id}"
                    class="plane-module-issue px-2.5 py-1.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/40 hover:border-zinc-700/60 cursor-pointer flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${issue.state_color || "#71717a"}"></span>
                      <span class="font-mono font-medium text-zinc-400 text-[11px]">${issue.id}</span>
                      <span class="text-zinc-200 truncate">${issue.title}</span>
                    </div>
                    <span class="text-[10px] text-zinc-400 font-medium shrink-0 capitalize">
                      ${issue.priority || "none"}
                    </span>
                  </div>
                `).join("")}
              </div>
            </div>
          `;
    }).join("")}
      </div>
    </div>
  `;
  }

  // project-docs/src/features/plane-pages/PlanePagesView.js
  function renderPlanePagesView({
    pages = [],
    activePageId = null,
    activePageContent = "",
    searchQuery = "",
    editorMode = "reader",
    // 'reader' | 'editor'
    onSelectPage = () => {
    },
    onSaveMarkdown = () => {
    }
  }) {
    const activePage = pages.find((p) => p.id === activePageId) || pages[0] || {};
    const currentContent = activePageContent || activePage.content_markdown || "";
    const filteredPages = pages.filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.file_path && p.file_path.toLowerCase().includes(q);
    });
    const shelves = {
      architecture: { name: "Arquitectura & Modelado C4", pages: [] },
      business_rules: { name: "Reglas de Negocio & Invariantes", pages: [] },
      requirements: { name: "Requerimientos & User Stories", pages: [] },
      adrs: { name: "Decisiones de Arquitectura (ADRs)", pages: [] },
      standards: { name: "Est\xE1ndares & Servicios", pages: [] },
      modules: { name: "M\xF3dulos & Bounded Contexts", pages: [] },
      specs: { name: "Especificaciones T\xE9cnicas (Specs)", pages: [] }
    };
    for (const p of filteredPages) {
      const s = p.shelf || "standards";
      if (shelves[s]) {
        shelves[s].pages.push(p);
      } else {
        shelves.standards.pages.push(p);
      }
    }
    const toc = extractTableOfContents(currentContent);
    return `
    <div class="h-[calc(100vh-112px)] flex flex-col md:flex-row overflow-hidden bg-zinc-950">
      <!-- Left Sidebar: Pages Tree -->
      <aside class="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950/70 flex flex-col shrink-0">
        <!-- Search box -->
        <div class="p-3 border-b border-zinc-800/80">
          <div class="relative">
            <input
              id="plane-page-search"
              type="text"
              placeholder="Buscar documentos..."
              value="${searchQuery}"
              class="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <span class="absolute left-2.5 top-2 text-zinc-500 pointer-events-none">
              ${Icons.search("w-3.5 h-3.5")}
            </span>
          </div>
        </div>

        <!-- Shelf & Pages Tree List -->
        <div class="flex-1 p-2 space-y-3 overflow-y-auto">
          ${Object.keys(shelves).map((sKey) => {
      const shelf = shelves[sKey];
      if (shelf.pages.length === 0) return "";
      return `
              <div class="space-y-1">
                <div class="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>${shelf.name}</span>
                  <span class="font-mono text-[9px] text-zinc-400">${shelf.pages.length}</span>
                </div>

                <div class="space-y-0.5">
                  ${shelf.pages.map((page) => {
        const isSelected = page.id === activePage.id;
        return `
                      <button
                        data-page-id="${page.id}"
                        class="plane-page-item w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left truncate ${isSelected ? "bg-indigo-600/15 text-indigo-300 font-medium border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"}"
                        title="${page.title}"
                      >
                        ${Icons.fileText("w-3.5 h-3.5 shrink-0 text-zinc-400")}
                        <span class="truncate">${page.title}</span>
                      </button>
                    `;
      }).join("")}
                </div>
              </div>
            `;
    }).join("")}
        </div>
      </aside>

      <!-- Main Pane: Page Reader / Editor -->
      <main class="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        <!-- Top Toolbar -->
        <div class="h-12 px-6 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-3 truncate text-xs">
            <span class="font-mono text-zinc-400 truncate max-w-xs">${activePage.file_path || ""}</span>
            <span class="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
              ${activePage.word_count || 0} palabras \xB7 ${activePage.reading_time_min || 1} min
            </span>
          </div>

          <!-- Mode Toggle & Save Button -->
          <div class="flex items-center gap-2">
            <div class="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
              <button id="toggle-reader-mode" class="px-2.5 py-1 rounded font-medium transition-colors ${editorMode === "reader" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-200"}">
                Lectura
              </button>
              <button id="toggle-editor-mode" class="px-2.5 py-1 rounded font-medium transition-colors ${editorMode === "editor" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-200"}">
                Editor Markdown
              </button>
            </div>

            ${editorMode === "editor" ? `
              <button id="plane-save-page" data-page-id="${activePage.id}" class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm">
                ${Icons.save("w-3.5 h-3.5")}
                <span>Guardar en SQLite & Disco</span>
              </button>
            ` : ""}
          </div>
        </div>

        <!-- Document Content Area -->
        <div class="flex-1 flex overflow-hidden">
          <!-- Reader / Editor Container -->
          <div class="flex-1 p-6 md:p-8 overflow-y-auto">
            ${editorMode === "editor" ? `
              <div class="h-full flex flex-col space-y-2">
                <textarea
                  id="plane-page-editor-textarea"
                  class="flex-1 w-full bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Escribe el contenido Markdown aqu\xED..."
                >${currentContent}</textarea>
                <div class="text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Al guardar se actualiza la base de datos SQLite y el archivo .md original en disco para los agentes de IA.</span>
                  <span class="font-mono text-emerald-400">Markdown Nativo</span>
                </div>
              </div>
            ` : `
              <div class="max-w-4xl mx-auto space-y-6">
                <div>
                  <h1 class="text-2xl font-bold text-zinc-100 tracking-tight">${activePage.title}</h1>
                  <p class="text-xs text-zinc-400 mt-1">${activePage.summary || ""}</p>
                </div>

                <div class="prose prose-invert max-w-none text-xs text-zinc-300 leading-relaxed">
                  ${renderMarkdown(currentContent)}
                </div>
              </div>
            `}
          </div>

          <!-- Table of Contents Sidebar (Reader Mode) -->
          ${editorMode === "reader" && toc && toc.length > 0 ? `
            <div class="hidden xl:block w-64 p-6 border-l border-zinc-800/80 overflow-y-auto shrink-0 text-xs">
              <span class="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">En este documento</span>
              <nav class="mt-3 space-y-1">
                ${toc.map((item) => `
                  <a
                    href="#${item.id}"
                    class="block py-1 text-zinc-400 hover:text-indigo-400 transition-colors truncate"
                    style="padding-left: ${(item.level - 1) * 8}px"
                  >
                    ${item.text}
                  </a>
                `).join("")}
              </nav>
            </div>
          ` : ""}
        </div>
      </main>
    </div>
  `;
  }

  // project-docs/src/features/plane-analytics/AnalyticsView.js
  function renderAnalyticsView({
    issues = [],
    states = [],
    cycles = [],
    modules = []
  }) {
    const total = issues.length;
    const done = issues.filter((i) => i.state_id === "state-done").length;
    const inProgress = issues.filter((i) => i.state_id === "state-in-progress" || i.state_id === "state-in-review").length;
    const backlog = total - done - inProgress;
    const completionRate = total > 0 ? Math.round(done / total * 100) : 0;
    const agentWorkload = {};
    for (const issue of issues) {
      const a = issue.assignee_role || "leader";
      if (!agentWorkload[a]) agentWorkload[a] = { total: 0, done: 0 };
      agentWorkload[a].total++;
      if (issue.state_id === "state-done") agentWorkload[a].done++;
    }
    const priorityCount = { urgent: 0, high: 0, medium: 0, low: 0, none: 0 };
    for (const issue of issues) {
      const p = (issue.priority || "none").toLowerCase();
      if (priorityCount[p] !== void 0) priorityCount[p]++;
      else priorityCount.none++;
    }
    return `
    <div class="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
          ${Icons.activity("w-5 h-5 text-indigo-400")}
          <span>Anal\xEDtica, M\xE9tricas & Rendimiento del Arn\xE9s</span>
        </h1>
        <p class="text-xs text-zinc-400 mt-0.5">Indicadores de velocidad de entrega, balance de carga multi-agente y distribuci\xF3n de requerimientos.</p>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
          <div class="flex items-center justify-between text-zinc-400 text-xs">
            <span>Tasa de Completitud</span>
            ${Icons.checkCircle("w-4 h-4 text-emerald-400")}
          </div>
          <div class="text-2xl font-bold font-mono text-zinc-100">${completionRate}%</div>
          <p class="text-[11px] text-zinc-400">${done} de ${total} requerimientos cerrados</p>
        </div>

        <div class="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
          <div class="flex items-center justify-between text-zinc-400 text-xs">
            <span>En Ejecuci\xF3n Activa</span>
            ${Icons.clock("w-4 h-4 text-amber-400")}
          </div>
          <div class="text-2xl font-bold font-mono text-amber-400">${inProgress}</div>
          <p class="text-[11px] text-zinc-400">Tareas en progreso o en revisi\xF3n</p>
        </div>

        <div class="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
          <div class="flex items-center justify-between text-zinc-400 text-xs">
            <span>Ratio de Pruebas QA</span>
            ${Icons.shield("w-4 h-4 text-emerald-400")}
          </div>
          <div class="text-2xl font-bold font-mono text-emerald-400">100%</div>
          <p class="text-[11px] text-zinc-400">9 niveles de verificaci\xF3n superados</p>
        </div>

        <div class="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
          <div class="flex items-center justify-between text-zinc-400 text-xs">
            <span>Persistencia SQLite</span>
            ${Icons.database("w-4 h-4 text-indigo-400")}
          </div>
          <div class="text-2xl font-bold font-mono text-indigo-400">WAL</div>
          <p class="text-[11px] text-zinc-400">Dual Sync Markdown activo</p>
        </div>
      </div>

      <!-- Agent Workload Breakdown -->
      <div class="border border-zinc-800/80 rounded-2xl bg-zinc-950/70 p-6 space-y-4">
        <h3 class="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Carga de Trabajo por Rol de Agente</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          ${Object.keys(agentWorkload).map((agentKey) => {
      const data = agentWorkload[agentKey];
      const p = data.total > 0 ? Math.round(data.done / data.total * 100) : 0;
      return `
              <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center gap-1.5 font-medium text-xs text-zinc-200">
                    ${Icons.bot("w-3.5 h-3.5 text-indigo-400")}
                    <span class="capitalize">${agentKey}</span>
                  </span>
                  <span class="font-mono text-xs font-bold text-zinc-300">${data.done}/${data.total}</span>
                </div>
                <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div class="h-full bg-indigo-500 rounded-full" style="width: ${p}%"></div>
                </div>
                <div class="text-[10px] text-zinc-400 text-right font-mono">${p}% completado</div>
              </div>
            `;
    }).join("")}
        </div>
      </div>

      <!-- Priority Distribution -->
      <div class="border border-zinc-800/80 rounded-2xl bg-zinc-950/70 p-6 space-y-4">
        <h3 class="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Distribuci\xF3n por Prioridad de Tarea</h3>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span class="text-[11px] text-rose-400 font-semibold">Urgente</span>
            <div class="text-xl font-bold font-mono text-rose-300 mt-1">${priorityCount.urgent}</div>
          </div>
          <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span class="text-[11px] text-amber-400 font-semibold">Alta</span>
            <div class="text-xl font-bold font-mono text-amber-300 mt-1">${priorityCount.high}</div>
          </div>
          <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span class="text-[11px] text-blue-400 font-semibold">Media</span>
            <div class="text-xl font-bold font-mono text-blue-300 mt-1">${priorityCount.medium}</div>
          </div>
          <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span class="text-[11px] text-emerald-400 font-semibold">Baja</span>
            <div class="text-xl font-bold font-mono text-emerald-300 mt-1">${priorityCount.low}</div>
          </div>
          <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span class="text-[11px] text-zinc-400 font-semibold">Ninguna</span>
            <div class="text-xl font-bold font-mono text-zinc-300 mt-1">${priorityCount.none}</div>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/plane-layout/PlaneLayout.js
  function renderPlaneLayout({
    planeData = {},
    currentView = "issues",
    currentViewMode = "list",
    filterState = "all",
    filterPriority = "all",
    filterAssignee = "all",
    groupBy = "state",
    orderBy = "sequence",
    searchQuery = "",
    pageSearchQuery = "",
    activePageId = null,
    activePageContent = "",
    selectedIssueId = null,
    isSidebarCollapsed = false,
    theme = "dark",
    pageEditorMode = "reader",
    activeSpec = null,
    legacyContentHtml = ""
  }) {
    const issues = planeData.issues || [];
    const states = planeData.states || [];
    const cycles = planeData.cycles || [];
    const modules = planeData.modules || [];
    const pages = planeData.pages || [];
    const workspace = planeData.workspace || { name: "Harness Engineering Workspace" };
    const project = planeData.project || { name: "Arn\xE9s SDD Multi-Agente" };
    const filteredIssues = issues.filter((issue) => {
      if (filterState !== "all" && issue.state_id !== filterState) return false;
      if (filterPriority !== "all" && (issue.priority || "none").toLowerCase() !== filterPriority.toLowerCase()) return false;
      if (filterAssignee !== "all" && (issue.assignee_role || "").toLowerCase() !== filterAssignee.toLowerCase()) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (issue.title || "").toLowerCase().includes(q);
        const matchId = (issue.id || "").toLowerCase().includes(q);
        const matchDesc = (issue.description || "").toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchDesc) return false;
      }
      return true;
    });
    let viewTitle = "Tareas (Issues)";
    if (currentView === "cycles") viewTitle = "Ciclos (Sprints)";
    if (currentView === "modules") viewTitle = "M\xF3dulos (Epics)";
    if (currentView === "pages") viewTitle = "P\xE1ginas (Docs / IA)";
    if (currentView === "analytics") viewTitle = "M\xE9tricas & Burn-down";
    if (currentView === "space3d") viewTitle = "Constelaci\xF3n 3D";
    if (currentView === "depgraph") viewTitle = "Grafo de Dependencias";
    let mainContentHtml = "";
    if (currentView === "issues") {
      const controlsHtml = renderPlaneControlsBar({
        currentViewMode,
        filterState,
        filterPriority,
        filterAssignee,
        groupBy,
        orderBy,
        searchQuery,
        totalIssues: issues.length,
        filteredIssues: filteredIssues.length
      });
      let viewComponentHtml = "";
      if (currentViewMode === "list") {
        viewComponentHtml = renderIssueListView({ issues: filteredIssues, states, groupBy });
      } else if (currentViewMode === "board") {
        viewComponentHtml = renderIssueBoardView({ issues: filteredIssues, states });
      } else if (currentViewMode === "calendar") {
        viewComponentHtml = renderIssueCalendarView({ issues: filteredIssues, cycles });
      } else if (currentViewMode === "spreadsheet") {
        viewComponentHtml = renderIssueSpreadsheetView({ issues: filteredIssues });
      }
      mainContentHtml = `
      ${controlsHtml}
      <div class="flex-1 overflow-y-auto">
        ${viewComponentHtml}
      </div>
    `;
    } else if (currentView === "cycles") {
      mainContentHtml = `
      <div class="flex-1 overflow-y-auto">
        ${renderCyclesView({ cycles, issues })}
      </div>
    `;
    } else if (currentView === "modules") {
      mainContentHtml = `
      <div class="flex-1 overflow-y-auto">
        ${renderModulesView({ modules, issues })}
      </div>
    `;
    } else if (currentView === "pages") {
      mainContentHtml = renderPlanePagesView({
        pages,
        activePageId,
        activePageContent,
        searchQuery: pageSearchQuery,
        editorMode: pageEditorMode
      });
    } else if (currentView === "analytics") {
      mainContentHtml = `
      <div class="flex-1 overflow-y-auto">
        ${renderAnalyticsView({ issues, states, cycles, modules })}
      </div>
    `;
    } else if (currentView === "space3d" || currentView === "depgraph") {
      mainContentHtml = `
      <div class="flex-1 overflow-y-auto p-6">
        ${legacyContentHtml}
      </div>
    `;
    }
    let modalHtml = "";
    if (selectedIssueId) {
      const selectedIssue = issues.find((i) => i.id === selectedIssueId);
      if (selectedIssue) {
        modalHtml = renderIssueDetailModal({
          issue: selectedIssue,
          states,
          cycles,
          modules
        });
      }
    }
    return `
    <div class="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans antialiased">
      <!-- Left Sidebar -->
      ${renderPlaneSidebar({
      currentView,
      activeWorkspace: workspace.name,
      activeProject: project.name,
      issueCount: issues.length,
      cycleCount: cycles.length,
      moduleCount: modules.length,
      pageCount: pages.length,
      isCollapsed: isSidebarCollapsed
    })}

      <!-- Main Column -->
      <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <!-- TopBar -->
        ${renderPlaneTopBar({
      workspaceName: workspace.name,
      projectName: project.name,
      viewTitle,
      theme,
      activeSpec
    })}

        <!-- Main Dynamic View Container -->
        <main id="plane-main-view" class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          ${mainContentHtml}
        </main>
      </div>

      <!-- Modals Layer -->
      ${modalHtml}
    </div>
  `;
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
      this.kbSearchDebounceTimer = null;
      this.omniboxDebounceTimer = null;
      this.autoSyncController = null;
      this.lastSyncTime = /* @__PURE__ */ new Date();
      this.currentActiveDocKey = "c4-model.md";
      this.editorMode = "markdown";
      this.currentBlocks = [];
      this.omniboxResults = [];
      this.activeOmniboxIndex = -1;
      this.isScrollingFromEditor = false;
      this.isScrollingFromPreview = false;
      this.scrollResetTimer = null;
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
      if (typeof window !== "undefined" && window.location?.protocol === "file:") {
        return;
      }
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
        const planeData = await api.fetchPlaneData({ bypassCache: true });
        this.envInfo = await detectEnvironment(data);
        this.lastSyncTime = /* @__PURE__ */ new Date();
        store.setData(data);
        store.setState({ planeData });
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
      if (tabId.startsWith("plane")) {
        const planeSubView = tabId.replace("plane-", "").replace("plane", "") || "issues";
        store.setState({ layoutMode: "plane", planeView: planeSubView });
      } else {
        store.setState({ layoutMode: "legacy" });
      }
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
      const activeAgent = this.envInfo?.activeAgent || { name: "Google Antigravity", iconName: "zap" };
      const stackInfo = this.envInfo?.stack || { name: "Multi-Stack Agnostico" };
      const isLocalFile = typeof window !== "undefined" && window.location?.protocol === "file:";
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
      if (state.layoutMode === "plane") {
        let legacyHtml = "";
        if (state.planeView === "space3d") {
          legacyHtml = `<div id="three-container" class="w-full h-[650px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden"></div>`;
        } else if (state.planeView === "depgraph") {
          legacyHtml = renderDependencyGraph({ features: state.features });
        }
        this.root.innerHTML = renderPlaneLayout({
          planeData: state.planeData || {},
          currentView: state.planeView || "issues",
          currentViewMode: state.planeViewMode || "list",
          filterState: state.planeFilterState || "all",
          filterPriority: state.planeFilterPriority || "all",
          filterAssignee: state.planeFilterAssignee || "all",
          groupBy: state.planeGroupBy || "state",
          orderBy: state.planeOrderBy || "sequence",
          searchQuery: state.planeSearchQuery || "",
          pageSearchQuery: state.planePageSearchQuery || "",
          activePageId: state.planeActivePageId,
          activePageContent: state.planeActivePageContent,
          selectedIssueId: state.planeSelectedIssueId,
          isSidebarCollapsed: state.isSidebarCollapsed || false,
          theme: state.theme,
          pageEditorMode: state.planePageEditorMode || "reader",
          activeSpec: state.currentSpec?.active_feature || state.currentSpec,
          legacyContentHtml: legacyHtml
        });
        if (state.planeView === "space3d") {
          const threeTarget = document.getElementById("three-container");
          if (threeTarget) {
            this.spaceView3D.mount(threeTarget, {
              features: state.features,
              onSelect: (f) => store.setSelectedFeature(f)
            });
          }
        } else if (state.planeView === "depgraph") {
          this.bindGraphHoverEvents();
        } else if (state.planeView === "pages") {
          this.initMermaidDiagrams();
        }
        this.isAppMounted = true;
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
                  <h1 class="text-sm font-bold tracking-tight text-slate-900 dark:text-white">${escapeHtml8(state.project)}</h1>
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

            <!-- Chips de Agente, Omnibox, Stack y Auto-Sync -->
            <div class="hidden lg:flex items-center gap-2 text-xs">
              
              <!-- Omnibox Trigger Button (Ctrl+K) -->
              <button type="button" 
                      data-action="open-omnibox"
                      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shadow-xs"
                      title="B\xFAsqueda global omnibox (Ctrl+K)">
                <span class="inline-flex items-center gap-1.5">${Icons.search("w-3.5 h-3.5")} <span>Buscar...</span></span>
                <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">Ctrl K</kbd>
              </button>

              <!-- Badge de Auto-Sync Reactivo -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${isLocalFile ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300" : "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300"} shadow-xs"
                   title="${isLocalFile ? "Modo local file://. Usa abrir-tablero.bat para auto-sync HTTP." : "Auto-Sync activo: detecta cambios en feature_list.json y progres/ en vivo"}">
                <span id="sync-status-dot" class="w-2 h-2 rounded-full ${isLocalFile ? "bg-amber-500" : "bg-emerald-500 animate-pulse"} transition-all"></span>
                <span id="sync-last-time" class="font-mono text-[11px] font-semibold">${isLocalFile ? "file:// local" : "En vivo"}</span>
              </div>

              <!-- Agente Detectado -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 shadow-xs"
                   title="Agentes compatibles homologados: Google Antigravity, Open Code, GitHub Copilot, Claude Code, Codex">
                <span class="text-indigo-600 dark:text-indigo-400 flex items-center">${Icons[activeAgent.iconName || "zap"] ? Icons[activeAgent.iconName || "zap"]("w-4 h-4") : Icons.zap("w-4 h-4")}</span>
                <span class="font-medium">${activeAgent.name}</span>
              </div>

              <!-- Stack Detectado -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs"
                   title="Stack tecnol\xF3gico detectado por technical-audit">
                <span class="text-slate-400">Stack:</span>
                <span class="font-semibold">${escapeHtml8(stackInfo.name)}</span>
              </div>
            </div>

            <!-- Controles: Modo Claro/Oscuro y Refrescar -->
            <div class="flex items-center gap-2">
              <!-- Bot\xF3n Ir a Modo Plane -->
              <a href="#plane" 
                 class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-sm cursor-pointer select-none"
                 title="Ir a la interfaz completa de gesti\xF3n Plane (Makeplane) con SQLite">
                ${Icons.kanban("w-3.5 h-3.5")}
                <span class="hidden sm:inline">Modo Plane</span>
              </a>

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
            ${renderTabButton({ id: "knowledge", label: "Base de Conocimiento", icon: Icons.book, active: this.activeTab === "knowledge", badge: String(Object.keys(state.knowledgeIndex?.docs || {}).length || 22) })}
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

        <!-- Modal de Detalle de Feature -->
        <div id="modal-container">
          ${renderModal(state.selectedFeature)}
        </div>

        <!-- MODAL OMNIBOX GLOBAL SEARCH (Ctrl+K / Cmd+K) -->
        <div id="omnibox-modal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden items-start justify-center pt-16 sm:pt-24 px-4">
          <div class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <span class="text-slate-400 text-sm flex items-center">${Icons.search("w-4 h-4")}</span>
              <input type="text" 
                     id="omnibox-input" 
                     placeholder="Buscar tareas (INT-*), docs, reglas (BR-*), m\xF3dulos..." 
                     class="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 text-sm font-mono placeholder-slate-400" 
                     autocomplete="off" />
              <kbd class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">ESC</kbd>
            </div>
            <div id="omnibox-results" class="p-3 overflow-y-auto space-y-3 flex-1 text-xs font-mono max-h-[460px]">
              <!-- Resultados generados en vivo -->
            </div>
            <div class="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Navegar: <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border">\u2191</kbd> <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border">\u2193</kbd></span>
              <span>Seleccionar: <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border">Enter</kbd></span>
              <span>Cerrar: <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border">ESC</kbd></span>
            </div>
          </div>
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
        case "knowledge":
          return renderKnowledgeBase({
            knowledgeIndex: state.knowledgeIndex,
            projectSpec: state.projectSpec,
            features: state.features
          });
        case "architecture":
          return renderArchitectureDocs({
            projectSpec: state.projectSpec,
            knowledgeIndex: state.knowledgeIndex,
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
      if (this.activeTab === "architecture" || this.activeTab === "knowledge") {
        this.initMermaidDiagrams();
      }
      if (this.activeTab === "knowledge") {
        this.setupSynchronizedScroll();
      }
    }
    setupSynchronizedScroll() {
      const textarea = document.getElementById("doc-editor-textarea");
      const preview = document.getElementById("doc-editor-live-preview");
      if (!textarea || !preview) return;
      textarea.onscroll = () => {
        if (this.isScrollingFromPreview) return;
        this.isScrollingFromEditor = true;
        const scrollMaxTextarea = textarea.scrollHeight - textarea.clientHeight;
        const scrollMaxPreview = preview.scrollHeight - preview.clientHeight;
        if (scrollMaxTextarea > 0 && scrollMaxPreview > 0) {
          const ratio = textarea.scrollTop / scrollMaxTextarea;
          preview.scrollTop = ratio * scrollMaxPreview;
        }
        clearTimeout(this.scrollResetTimer);
        this.scrollResetTimer = setTimeout(() => {
          this.isScrollingFromEditor = false;
        }, 60);
      };
      preview.onscroll = () => {
        if (this.isScrollingFromEditor) return;
        this.isScrollingFromPreview = true;
        const scrollMaxTextarea = textarea.scrollHeight - textarea.clientHeight;
        const scrollMaxPreview = preview.scrollHeight - preview.clientHeight;
        if (scrollMaxTextarea > 0 && scrollMaxPreview > 0) {
          const ratio = preview.scrollTop / scrollMaxPreview;
          textarea.scrollTop = ratio * scrollMaxTextarea;
        }
        clearTimeout(this.scrollResetTimer);
        this.scrollResetTimer = setTimeout(() => {
          this.isScrollingFromPreview = false;
        }, 60);
      };
    }
    async initMermaidDiagrams(retryCount = 0) {
      if (typeof window === "undefined") return;
      if (!window.mermaid) {
        if (retryCount < 10) {
          setTimeout(() => this.initMermaidDiagrams(retryCount + 1), 200);
        }
        return;
      }
      try {
        const isDark = document.documentElement.classList.contains("dark");
        window.mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "neutral",
          themeVariables: {
            darkMode: isDark,
            background: "transparent",
            primaryColor: "#6366f1",
            primaryTextColor: isDark ? "#f8fafc" : "#0f172a",
            primaryBorderColor: "#818cf8",
            lineColor: "#38bdf8",
            secondaryColor: "#3b82f6",
            tertiaryColor: "#1e293b"
          },
          securityLevel: "loose",
          fontFamily: "system-ui, -apple-system, sans-serif"
        });
        const targets = document.querySelectorAll(".mermaid-render-target[data-mermaid-code]");
        for (const target of targets) {
          const rawCode = target.getAttribute("data-mermaid-code");
          if (!rawCode) continue;
          if (target.querySelector("svg") && target.getAttribute("data-rendered-code") === rawCode) {
            continue;
          }
          const uniqueId = "mmd_" + Math.random().toString(36).substring(2, 9);
          try {
            const { svg } = await window.mermaid.render(uniqueId, rawCode);
            target.innerHTML = svg;
            target.setAttribute("data-rendered-code", rawCode);
            const svgEl = target.querySelector("svg");
            if (svgEl) {
              svgEl.style.maxWidth = "100%";
              svgEl.style.height = "auto";
            }
          } catch (renderErr) {
            console.warn("Mermaid render error for target:", renderErr);
            target.innerHTML = `
            <div class="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 max-w-lg text-center space-y-2">
              <div class="font-bold flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400">
                ${Icons.alertTriangle("w-4 h-4")} <span>Diagrama en edici\xF3n de sintaxis</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                ${escapeHtml8(renderErr.message || "Error de parsing en Mermaid")}
              </p>
              <pre class="text-[10px] font-mono text-left bg-slate-900 text-indigo-300 p-2.5 rounded-xl overflow-x-auto max-h-36">${escapeHtml8(rawCode)}</pre>
            </div>
          `;
            const strayError = document.getElementById("d" + uniqueId);
            if (strayError) strayError.remove();
          }
        }
        const preMermaids = document.querySelectorAll('pre.mermaid:not([data-processed="true"])');
        for (const pre of preMermaids) {
          pre.setAttribute("data-processed", "true");
          const code = pre.textContent.trim();
          const uniqueId = "mmd_pre_" + Math.random().toString(36).substring(2, 9);
          try {
            const { svg } = await window.mermaid.render(uniqueId, code);
            const wrapper = document.createElement("div");
            wrapper.className = "w-full flex justify-center items-center py-2";
            wrapper.innerHTML = svg;
            const svgEl = wrapper.querySelector("svg");
            if (svgEl) {
              svgEl.style.maxWidth = "100%";
              svgEl.style.height = "auto";
            }
            pre.replaceWith(wrapper);
          } catch (err) {
            console.warn("Mermaid pre render error:", err);
            const strayError = document.getElementById("d" + uniqueId);
            if (strayError) strayError.remove();
          }
        }
      } catch (err) {
        console.warn("Error Mermaid general initialization:", err);
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
    // Abre el visor de artículo con el documento indicado
    openArticleView(docKey, openInEditor = false) {
      this.currentActiveDocKey = docKey;
      const state = store.getState();
      const docs = state.knowledgeIndex?.docs || {};
      const meta = state.knowledgeIndex?.docMetadata?.[docKey] || {
        title: docKey,
        shelf: "general",
        readingTime: 3,
        wordCount: 400
      };
      const content = docs[docKey] || "# Documento no disponible";
      const libView = document.getElementById("kb-view-library");
      const artView = document.getElementById("kb-view-article");
      const pathEl = document.getElementById("doc-active-path");
      const shelfBadge = document.getElementById("article-shelf-badge");
      const readingTimeBadge = document.getElementById("article-reading-time-badge");
      const bodyEl = document.getElementById("doc-active-body");
      const tocEl = document.getElementById("doc-active-toc");
      const wordsEl = document.getElementById("article-meta-words");
      const brEl = document.getElementById("article-meta-br");
      const rfEl = document.getElementById("article-meta-rf");
      const readerContainer = document.getElementById("doc-reader-view-container");
      const editorContainer = document.getElementById("doc-editor-view-container");
      const btnText = document.getElementById("btn-toggle-doc-text");
      const btnIcon = document.getElementById("btn-toggle-doc-icon");
      const textarea = document.getElementById("doc-editor-textarea");
      const livePreview = document.getElementById("doc-editor-live-preview");
      if (pathEl) pathEl.textContent = docKey;
      if (shelfBadge) shelfBadge.textContent = meta.shelf || "Can\xF3nico";
      if (readingTimeBadge) readingTimeBadge.innerHTML = `<span class="inline-flex items-center gap-1">${Icons.clock("w-3 h-3")} <span>${meta.readingTime || 3} min</span></span>`;
      if (wordsEl) wordsEl.textContent = meta.wordCount || 0;
      if (brEl) brEl.textContent = meta.ruleCount || 0;
      if (rfEl) rfEl.textContent = meta.reqCount || 0;
      if (bodyEl) bodyEl.innerHTML = renderMarkdown(content);
      if (tocEl) {
        const toc = extractTableOfContents(content);
        tocEl.innerHTML = renderTocHtml(toc);
      }
      if (textarea) textarea.value = content;
      if (livePreview) livePreview.innerHTML = renderMarkdown(content);
      if (openInEditor) {
        readerContainer?.classList.add("hidden");
        editorContainer?.classList.remove("hidden");
        if (btnText) btnText.textContent = "Modo Lectura";
        if (btnIcon) btnIcon.innerHTML = Icons.eye("w-3.5 h-3.5");
        this.setupSynchronizedScroll();
      } else {
        editorContainer?.classList.add("hidden");
        readerContainer?.classList.remove("hidden");
        if (btnText) btnText.textContent = "Modo Editor";
        if (btnIcon) btnIcon.innerHTML = Icons.edit("w-3.5 h-3.5");
      }
      libView?.classList.add("hidden");
      artView?.classList.remove("hidden");
      this.initMermaidDiagrams();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Abre el Omnibox Global Search
    openOmnibox() {
      const modal = document.getElementById("omnibox-modal");
      const input = document.getElementById("omnibox-input");
      if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        if (input) {
          input.value = "";
          input.focus();
          this.renderOmniboxResults("");
        }
      }
    }
    closeOmnibox() {
      const modal = document.getElementById("omnibox-modal");
      if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      }
    }
    renderOmniboxResults(query = "") {
      const resultsContainer = document.getElementById("omnibox-results");
      if (!resultsContainer) return;
      const q = (query || "").toLowerCase().trim();
      const state = store.getState();
      const features = state.features || [];
      const docs = state.knowledgeIndex?.docMetadata || {};
      const rules = state.knowledgeIndex?.business_rules || [];
      const modules = store.getAvailableModules() || [];
      const matchedFeatures = features.filter(
        (f) => !q || f.title.toLowerCase().includes(q) || f.name.toLowerCase().includes(q) || f.module.toLowerCase().includes(q) || `int-${f.id}`.includes(q)
      ).slice(0, 5);
      const matchedDocs = Object.values(docs).filter(
        (d) => !q || d.key.toLowerCase().includes(q) || d.title && d.title.toLowerCase().includes(q) || d.summary && d.summary.toLowerCase().includes(q)
      ).slice(0, 5);
      const matchedRules = rules.filter(
        (r) => !q || r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      ).slice(0, 5);
      const matchedModules = modules.filter(
        (m) => !q || m.toLowerCase().includes(q)
      ).slice(0, 4);
      let html = "";
      if (matchedFeatures.length > 0) {
        html += `
        <div class="space-y-1">
          <div class="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 flex items-center gap-1">${Icons.fileText("w-3 h-3")} <span>Tareas & Specs</span></div>
          ${matchedFeatures.map((f, i) => `
            <div class="omnibox-item p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex items-center justify-between transition-colors"
                 data-omnibox-type="feature"
                 data-feature-id="${f.id}">
              <div class="flex items-center gap-2 truncate">
                <span class="font-bold text-indigo-500">[INT-${f.id}]</span>
                <span class="truncate">${escapeHtml8(f.title)}</span>
              </div>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">${f.status}</span>
            </div>
          `).join("")}
        </div>
      `;
      }
      if (matchedDocs.length > 0) {
        html += `
        <div class="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div class="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 flex items-center gap-1">${Icons.book("w-3 h-3")} <span>Base de Conocimiento</span></div>
          ${matchedDocs.map((d) => `
            <div class="omnibox-item p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex items-center justify-between transition-colors"
                 data-omnibox-type="doc"
                 data-doc-key="${escapeAttr5(d.key)}">
              <div class="flex items-center gap-2 truncate">
                <span class="text-indigo-600 dark:text-indigo-400">${Icons.fileText("w-3.5 h-3.5")}</span>
                <span class="font-bold truncate">${escapeHtml8(d.title)}</span>
                <span class="text-[10px] text-slate-400 font-mono truncate">(${escapeHtml8(d.key)})</span>
              </div>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono inline-flex items-center gap-1">${Icons.clock("w-3 h-3")} <span>${d.readingTime || 2}m</span></span>
            </div>
          `).join("")}
        </div>
      `;
      }
      if (matchedRules.length > 0) {
        html += `
        <div class="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div class="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 flex items-center gap-1">${Icons.scale("w-3 h-3")} <span>Reglas de Negocio (BR-*)</span></div>
          ${matchedRules.map((r) => `
            <div class="omnibox-item p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer flex items-center justify-between transition-colors"
                 data-omnibox-type="rule"
                 data-rule-id="${escapeAttr5(r.id)}"
                 data-rule-module="${escapeAttr5(r.module || "")}">
              <div class="flex items-center gap-2 truncate">
                <span class="font-bold text-amber-500">${r.id}</span>
                <span class="truncate">${escapeHtml8(r.title)}</span>
              </div>
              <span class="text-[10px] font-mono text-slate-400">[${r.module || "general"}]</span>
            </div>
          `).join("")}
        </div>
      `;
      }
      if (!matchedFeatures.length && !matchedDocs.length && !matchedRules.length) {
        html = `<div class="p-6 text-center text-slate-400">No se encontraron resultados para "${escapeHtml8(q)}"</div>`;
      }
      resultsContainer.innerHTML = html;
    }
    // Renderiza los bloques interactivos en el editor de bloques visuales
    renderVisualBlocks(blocks = []) {
      const container = document.getElementById("doc-editor-blocks-container");
      if (!container) return;
      if (!blocks || blocks.length === 0) {
        container.innerHTML = `
        <div class="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 text-xs">
          Sin bloques de contenido a\xFAn. A\xF1ade uno con la barra superior de acciones.
        </div>
      `;
        return;
      }
      container.innerHTML = blocks.map((b, idx) => {
        const typeLabel = getBlockTypeLabel(b.type);
        return `
        <div class="visual-block-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3"
             data-block-id="${b.id}"
             data-block-index="${idx}">
          <div class="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                ${typeLabel}
              </span>
              <span class="text-slate-400 text-[10px]">Bloque #${idx + 1}</span>
            </div>
            <div class="flex items-center gap-1">
              <button type="button" data-block-action="move-up" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer text-xs" title="Mover arriba" ${idx === 0 ? 'disabled style="opacity:0.3"' : ""}>${Icons.chevronUp("w-3.5 h-3.5")}</button>
              <button type="button" data-block-action="move-down" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer text-xs" title="Mover abajo" ${idx === blocks.length - 1 ? 'disabled style="opacity:0.3"' : ""}>${Icons.chevronDown("w-3.5 h-3.5")}</button>
              <button type="button" data-block-action="delete" class="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 cursor-pointer text-xs" title="Eliminar bloque">${Icons.trash("w-3.5 h-3.5")}</button>
            </div>
          </div>
          ${this.renderBlockInputControls(b)}
        </div>
      `;
      }).join("");
    }
    renderBlockInputControls(b) {
      switch (b.type) {
        case "header":
          return `
          <div class="flex items-center gap-2">
            <select class="block-input-header-level px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono">
              <option value="1" ${b.level === 1 ? "selected" : ""}>H1 (#)</option>
              <option value="2" ${b.level === 2 ? "selected" : ""}>H2 (##)</option>
              <option value="3" ${b.level === 3 ? "selected" : ""}>H3 (###)</option>
            </select>
            <input type="text" class="block-input-header-text flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-slate-100" value="${escapeAttr5(b.text || "")}" placeholder="T\xEDtulo del encabezado" />
          </div>
        `;
        case "paragraph":
          return `
          <textarea class="block-input-paragraph-text w-full p-3 font-sans text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 resize-y leading-relaxed" rows="3" placeholder="P\xE1rrafo o contenido descriptivo...">${escapeHtml8(Array.isArray(b.lines) ? b.lines.join("\n") : b.text || "")}</textarea>
        `;
        case "callout":
          return `
          <div class="space-y-2">
            <select class="block-input-callout-kind px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold">
              <option value="NOTE" ${b.kind === "NOTE" ? "selected" : ""}>NOTE (Nota informativa)</option>
              <option value="TIP" ${b.kind === "TIP" ? "selected" : ""}>TIP (Consejo/Buenas pr\xE1cticas)</option>
              <option value="IMPORTANT" ${b.kind === "IMPORTANT" ? "selected" : ""}>IMPORTANT (Importante)</option>
              <option value="WARNING" ${b.kind === "WARNING" ? "selected" : ""}>WARNING (Advertencia)</option>
              <option value="CAUTION" ${b.kind === "CAUTION" ? "selected" : ""}>CAUTION (Precauci\xF3n)</option>
              <option value="DANGER" ${b.kind === "DANGER" ? "selected" : ""}>DANGER (Riesgo Cr\xEDtico)</option>
            </select>
            <textarea class="block-input-callout-text w-full p-2.5 font-sans text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 resize-y" rows="2" placeholder="Mensaje de la alerta...">${escapeHtml8(b.text || "")}</textarea>
          </div>
        `;
        case "business_rule":
          return `
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="text" class="block-input-rule-id w-36 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-amber-600 dark:text-amber-400" value="${escapeAttr5(b.ruleId || "BR-GEN-001")}" placeholder="BR-XXX-001" />
              <input type="text" class="block-input-rule-title flex-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 font-semibold" value="${escapeAttr5(b.title || "")}" placeholder="T\xEDtulo de la regla de negocio" />
            </div>
            <textarea class="block-input-rule-desc w-full p-2.5 font-sans text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 resize-y" rows="2" placeholder="Descripci\xF3n detallada de la invariante...">${escapeHtml8(b.text || b.description || "")}</textarea>
          </div>
        `;
        case "code":
          return `
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono text-slate-400">Lenguaje:</span>
              <select class="block-input-code-lang px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                <option value="mermaid" ${b.lang === "mermaid" ? "selected" : ""}>mermaid</option>
                <option value="drawio" ${b.lang === "drawio" ? "selected" : ""}>drawio</option>
                <option value="csharp" ${b.lang === "csharp" ? "selected" : ""}>csharp (.NET)</option>
                <option value="javascript" ${b.lang === "javascript" ? "selected" : ""}>javascript</option>
                <option value="typescript" ${b.lang === "typescript" ? "selected" : ""}>typescript</option>
                <option value="json" ${b.lang === "json" ? "selected" : ""}>json</option>
                <option value="sql" ${b.lang === "sql" ? "selected" : ""}>sql</option>
                <option value="bash" ${b.lang === "bash" ? "selected" : ""}>bash</option>
                <option value="yaml" ${b.lang === "yaml" ? "selected" : ""}>yaml</option>
              </select>
            </div>
            <textarea class="block-input-code-content w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-indigo-300 resize-y" rows="6" placeholder="C\xF3digo o sintaxis del diagrama...">${escapeHtml8(Array.isArray(b.content) ? b.content.join("\n") : b.content || "")}</textarea>
          </div>
        `;
        case "divider":
          return `
          <div class="py-2 text-center text-xs font-mono text-slate-400 flex items-center gap-2">
            <div class="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <span>--- Separador de Secci\xF3n ---</span>
            <div class="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>
        `;
        default:
          return `
          <textarea class="block-input-raw-text w-full p-2.5 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950" rows="3">${escapeHtml8(b.raw || "")}</textarea>
        `;
      }
    }
    // Extrae y sincroniza bloques visuales desde el DOM
    syncBlocksFromDom() {
      const cards = document.querySelectorAll(".visual-block-card");
      const newBlocks = [];
      cards.forEach((card) => {
        const bId = card.getAttribute("data-block-id");
        const origBlock = this.currentBlocks.find((b) => b.id === bId) || {};
        const type = origBlock.type || "paragraph";
        if (type === "header") {
          const level = parseInt(card.querySelector(".block-input-header-level")?.value || "1", 10);
          const text = card.querySelector(".block-input-header-text")?.value || "";
          newBlocks.push({ ...origBlock, level, text });
        } else if (type === "paragraph") {
          const text = card.querySelector(".block-input-paragraph-text")?.value || "";
          newBlocks.push({ ...origBlock, lines: text.split("\n") });
        } else if (type === "callout") {
          const kind = card.querySelector(".block-input-callout-kind")?.value || "NOTE";
          const text = card.querySelector(".block-input-callout-text")?.value || "";
          newBlocks.push({ ...origBlock, kind, text });
        } else if (type === "business_rule") {
          const ruleId = card.querySelector(".block-input-rule-id")?.value || "BR-GEN-001";
          const title = card.querySelector(".block-input-rule-title")?.value || "";
          const text = card.querySelector(".block-input-rule-desc")?.value || "";
          newBlocks.push({ ...origBlock, ruleId, title, text });
        } else if (type === "code") {
          const lang = card.querySelector(".block-input-code-lang")?.value || "mermaid";
          const content = card.querySelector(".block-input-code-content")?.value || "";
          newBlocks.push({ ...origBlock, lang, content: content.split("\n") });
        } else if (type === "divider") {
          newBlocks.push({ ...origBlock, type: "divider" });
        }
      });
      this.currentBlocks = newBlocks;
      const serializedMd = blocksToMarkdown(this.currentBlocks);
      const textarea = document.getElementById("doc-editor-textarea");
      const preview = document.getElementById("doc-editor-live-preview");
      if (textarea) textarea.value = serializedMd;
      if (preview) preview.innerHTML = renderMarkdown(serializedMd);
    }
    bindGlobalEvents() {
      document.addEventListener("click", (e) => {
        const planeNavBtn = e.target.closest("[data-plane-nav]");
        if (planeNavBtn) {
          const view = planeNavBtn.getAttribute("data-plane-nav");
          store.setState({ planeView: view });
          return;
        }
        const planeViewModeBtn = e.target.closest("[data-view-mode]");
        if (planeViewModeBtn) {
          const mode = planeViewModeBtn.getAttribute("data-view-mode");
          store.setState({ planeViewMode: mode });
          return;
        }
        const moveStateBtn = e.target.closest('[data-action="move-state"]');
        if (moveStateBtn) {
          const issueId = moveStateBtn.getAttribute("data-issue-id");
          const targetState = moveStateBtn.getAttribute("data-target-state");
          api.updatePlaneIssue(issueId, { state_id: targetState }).then(() => {
            const planeData = store.getState().planeData;
            const issue = (planeData.issues || []).find((i) => i.id === issueId);
            const stateObj = (planeData.states || []).find((s) => s.id === targetState);
            if (issue && stateObj) {
              issue.state_id = targetState;
              issue.state_name = stateObj.name;
              issue.state_color = stateObj.color;
              store.setState({ planeData: { ...planeData } });
            }
          });
          return;
        }
        const issueItem = e.target.closest("[data-issue-id]");
        if (issueItem && !e.target.closest('[data-action="move-state"]') && !e.target.closest("select")) {
          const issueId = issueItem.getAttribute("data-issue-id");
          store.setState({ planeSelectedIssueId: issueId });
          return;
        }
        if (e.target.closest("#plane-modal-close") || e.target.id === "plane-issue-modal-backdrop") {
          store.setState({ planeSelectedIssueId: null });
          return;
        }
        const pageItem = e.target.closest(".plane-page-item");
        if (pageItem) {
          const pageId = pageItem.getAttribute("data-page-id");
          const page = (store.getState().planeData?.pages || []).find((p) => p.id === pageId);
          store.setState({
            planeActivePageId: pageId,
            planeActivePageContent: page ? page.content_markdown : ""
          });
          return;
        }
        if (e.target.closest("#toggle-reader-mode")) {
          store.setState({ planePageEditorMode: "reader" });
          return;
        }
        if (e.target.closest("#toggle-editor-mode")) {
          store.setState({ planePageEditorMode: "editor" });
          return;
        }
        const savePageBtn = e.target.closest("#plane-save-page");
        if (savePageBtn) {
          const pageId = savePageBtn.getAttribute("data-page-id");
          const textarea = document.getElementById("plane-page-editor-textarea");
          const newContent = textarea ? textarea.value : "";
          api.updatePlanePage(pageId, newContent).then(() => {
            const planeData = store.getState().planeData;
            const page = (planeData.pages || []).find((p) => p.id === pageId);
            if (page) {
              page.content_markdown = newContent;
              page.word_count = newContent.trim().split(/\s+/).filter(Boolean).length;
              page.reading_time_min = Math.max(1, Math.ceil(page.word_count / 200));
              store.setState({
                planeData: { ...planeData },
                planeActivePageContent: newContent
              });
            }
            const origHtml = savePageBtn.innerHTML;
            savePageBtn.innerHTML = `<span>Guardado con \xE9xito</span>`;
            setTimeout(() => {
              if (savePageBtn) savePageBtn.innerHTML = origHtml;
            }, 2e3);
          });
          return;
        }
        if (e.target.closest("#toggle-sidebar-collapse")) {
          store.setState({ isSidebarCollapsed: !store.getState().isSidebarCollapsed });
          return;
        }
        if (e.target.closest("#plane-omnibox-trigger")) {
          this.openOmnibox();
          return;
        }
        if (e.target.closest("#plane-sync-trigger")) {
          this.refreshData();
          return;
        }
        if (e.target.closest("#plane-theme-toggle")) {
          store.toggleTheme();
          return;
        }
        const themeBtn = e.target.closest('[data-action="toggle-theme"]');
        if (themeBtn) {
          store.toggleTheme();
          setTimeout(() => this.initMermaidDiagrams(), 50);
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
        const openOmniboxBtn = e.target.closest('[data-action="open-omnibox"]');
        if (openOmniboxBtn) {
          this.openOmnibox();
          return;
        }
        const omniboxItem = e.target.closest(".omnibox-item");
        if (omniboxItem) {
          const type = omniboxItem.getAttribute("data-omnibox-type");
          this.closeOmnibox();
          if (type === "feature") {
            const id = parseInt(omniboxItem.getAttribute("data-feature-id"), 10);
            const feature = store.getState().features.find((f) => f.id === id);
            if (feature) store.setSelectedFeature(feature);
          } else if (type === "doc") {
            const docKey = omniboxItem.getAttribute("data-doc-key");
            router.navigate("knowledge");
            setTimeout(() => this.openArticleView(docKey, false), 50);
          } else if (type === "rule") {
            router.navigate("knowledge");
            setTimeout(() => {
              const rulesEl = document.getElementById("kb-rules-list");
              if (rulesEl) rulesEl.scrollIntoView({ behavior: "smooth" });
            }, 80);
          }
          return;
        }
        if (e.target.id === "omnibox-modal") {
          this.closeOmnibox();
          return;
        }
        const backToLibBtn = e.target.closest('[data-action="back-to-library"]');
        if (backToLibBtn) {
          document.getElementById("kb-view-article")?.classList.add("hidden");
          document.getElementById("kb-view-library")?.classList.remove("hidden");
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        const openReadBtn = e.target.closest('[data-action="open-article-read"]');
        if (openReadBtn) {
          const docKey = openReadBtn.getAttribute("data-doc-key");
          if (docKey) this.openArticleView(docKey, false);
          return;
        }
        const openEditBtn = e.target.closest('[data-action="open-article-edit"]');
        if (openEditBtn) {
          const docKey = openEditBtn.getAttribute("data-doc-key");
          if (docKey) this.openArticleView(docKey, true);
          return;
        }
        const shelfPill = e.target.closest(".kb-shelf-pill");
        if (shelfPill) {
          const targetShelf = shelfPill.getAttribute("data-shelf-filter");
          document.querySelectorAll(".kb-shelf-pill").forEach((p) => {
            p.classList.remove("active", "bg-indigo-600", "text-white", "font-bold", "shadow-xs");
            p.classList.add("bg-slate-100", "dark:bg-slate-800", "text-slate-600", "dark:text-slate-400");
          });
          shelfPill.classList.add("active", "bg-indigo-600", "text-white", "font-bold", "shadow-xs");
          shelfPill.classList.remove("bg-slate-100", "dark:bg-slate-800", "text-slate-600", "dark:text-slate-400");
          document.querySelectorAll(".kb-shelf-section").forEach((sec) => {
            const sId = sec.getAttribute("data-shelf-id");
            if (!targetShelf || sId === targetShelf) {
              sec.classList.remove("hidden");
            } else {
              sec.classList.add("hidden");
            }
          });
          return;
        }
        const perspectiveBtn = e.target.closest("[data-kb-perspective]");
        if (perspectiveBtn) {
          const targetPersp = perspectiveBtn.getAttribute("data-kb-perspective");
          document.querySelectorAll(".kb-perspective-btn").forEach((btn) => {
            btn.classList.remove("active", "bg-indigo-600", "text-white", "font-bold", "shadow-xs");
            btn.classList.add("text-slate-600", "dark:text-slate-400", "font-medium");
          });
          perspectiveBtn.classList.add("active", "bg-indigo-600", "text-white", "font-bold", "shadow-xs");
          perspectiveBtn.classList.remove("text-slate-600", "dark:text-slate-400", "font-medium");
          document.querySelectorAll(".kb-perspective-panel").forEach((panel) => {
            panel.classList.add("hidden");
          });
          const targetPanel = document.getElementById(`kb-perspective-panel-${targetPersp}`);
          if (targetPanel) {
            targetPanel.classList.remove("hidden");
          }
          return;
        }
        const moduleTabBtn = e.target.closest("[data-module-tab]");
        if (moduleTabBtn) {
          const targetMod = moduleTabBtn.getAttribute("data-module-tab");
          document.querySelectorAll(".kb-module-tab-btn").forEach((btn) => {
            btn.classList.remove("active", "bg-purple-600", "text-white", "font-bold", "shadow-xs");
            btn.classList.add("bg-slate-100", "dark:bg-slate-800", "text-slate-600", "dark:text-slate-300", "font-medium");
          });
          moduleTabBtn.classList.add("active", "bg-purple-600", "text-white", "font-bold", "shadow-xs");
          moduleTabBtn.classList.remove("bg-slate-100", "dark:bg-slate-800", "text-slate-600", "dark:text-slate-300", "font-medium");
          document.querySelectorAll(".kb-module-content-panel").forEach((panel) => {
            panel.classList.add("hidden");
          });
          const targetContent = document.getElementById(`kb-module-content-${targetMod}`);
          if (targetContent) {
            targetContent.classList.remove("hidden");
          }
          return;
        }
        const copyMasterBtn = e.target.closest('[data-action="copy-master-doc"]');
        if (copyMasterBtn) {
          const masterContent = store.getState().knowledgeIndex?.docs?.["MASTER-PROJECT-KNOWLEDGE.md"] || "";
          if (masterContent && navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(masterContent).then(() => {
              const origHtml = copyMasterBtn.innerHTML;
              copyMasterBtn.innerHTML = `<span class="inline-flex items-center gap-1">${Icons.checkCircle("w-3.5 h-3.5")} <span>\xA1Dossier Copiado!</span></span>`;
              setTimeout(() => {
                copyMasterBtn.innerHTML = origHtml;
              }, 2200);
            }).catch(() => {
              store.showNotification("Error al copiar el dossier maestro", "warning");
            });
          }
          return;
        }
        const downloadMasterBtn = e.target.closest('[data-action="download-master-doc"]');
        if (downloadMasterBtn) {
          const masterContent = store.getState().knowledgeIndex?.docs?.["MASTER-PROJECT-KNOWLEDGE.md"] || "";
          if (masterContent) {
            const blob = new Blob([masterContent], { type: "text/markdown;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "MASTER-PROJECT-KNOWLEDGE.md";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
          return;
        }
        const toggleEditorBtn = e.target.closest("#btn-toggle-doc-editor");
        if (toggleEditorBtn) {
          const readerContainer = document.getElementById("doc-reader-view-container");
          const editorContainer = document.getElementById("doc-editor-view-container");
          const btnText = document.getElementById("btn-toggle-doc-text");
          const btnIcon = document.getElementById("btn-toggle-doc-icon");
          const textarea = document.getElementById("doc-editor-textarea");
          const preview = document.getElementById("doc-editor-live-preview");
          const pathEl = document.getElementById("doc-active-path");
          if (readerContainer && editorContainer) {
            const isEditorHidden = editorContainer.classList.contains("hidden");
            if (isEditorHidden) {
              const docKey = pathEl ? pathEl.textContent.trim() : "";
              const docs = store.getState().knowledgeIndex?.docs || {};
              const content = docs[docKey] || "";
              if (textarea) textarea.value = content;
              if (preview) preview.innerHTML = renderMarkdown(content);
              editorContainer.classList.remove("hidden");
              readerContainer.classList.add("hidden");
              if (btnText) btnText.textContent = "Modo Lectura";
              if (btnIcon) btnIcon.innerHTML = Icons.eye("w-3.5 h-3.5");
              this.setupSynchronizedScroll();
            } else {
              editorContainer.classList.add("hidden");
              readerContainer.classList.remove("hidden");
              if (btnText) btnText.textContent = "Modo Editor";
              if (btnIcon) btnIcon.innerHTML = Icons.edit("w-3.5 h-3.5");
            }
          }
          return;
        }
        const btnModeMd = e.target.closest("#btn-editor-mode-md");
        if (btnModeMd) {
          this.editorMode = "markdown";
          btnModeMd.classList.add("bg-indigo-600", "text-white");
          btnModeMd.classList.remove("text-slate-600", "dark:text-slate-400");
          const btnModeBlocks2 = document.getElementById("btn-editor-mode-blocks");
          btnModeBlocks2?.classList.remove("bg-indigo-600", "text-white");
          btnModeBlocks2?.classList.add("text-slate-600", "dark:text-slate-400");
          document.getElementById("editor-pane-markdown")?.classList.remove("hidden");
          document.getElementById("editor-pane-blocks")?.classList.add("hidden");
          this.setupSynchronizedScroll();
          return;
        }
        const btnModeBlocks = e.target.closest("#btn-editor-mode-blocks");
        if (btnModeBlocks) {
          this.editorMode = "blocks";
          btnModeBlocks.classList.add("bg-indigo-600", "text-white");
          btnModeBlocks.classList.remove("text-slate-600", "dark:text-slate-400");
          const btnModeMd2 = document.getElementById("btn-editor-mode-md");
          btnModeMd2?.classList.remove("bg-indigo-600", "text-white");
          btnModeMd2?.classList.add("text-slate-600", "dark:text-slate-400");
          document.getElementById("editor-pane-markdown")?.classList.add("hidden");
          document.getElementById("editor-pane-blocks")?.classList.remove("hidden");
          const textarea = document.getElementById("doc-editor-textarea");
          const currentMd = textarea ? textarea.value : "";
          this.currentBlocks = parseMarkdownToBlocks(currentMd);
          this.renderVisualBlocks(this.currentBlocks);
          return;
        }
        const addBlockBtn = e.target.closest("[data-add-block]");
        if (addBlockBtn) {
          const type = addBlockBtn.getAttribute("data-add-block");
          const newBlock = {
            id: "blk_" + Math.random().toString(36).substring(2, 9),
            type
          };
          if (type === "header") {
            newBlock.level = 2;
            newBlock.text = "Nuevo Encabezado";
          } else if (type === "paragraph") {
            newBlock.lines = ["Escribe aqu\xED tu contenido descriptivo..."];
          } else if (type === "callout") {
            newBlock.kind = "NOTE";
            newBlock.text = "Nota importante para desarrolladores o IA.";
          } else if (type === "business_rule") {
            newBlock.ruleId = "BR-NEW-001";
            newBlock.title = "Nueva Regla";
            newBlock.text = "Invariante de cumplimiento estricto.";
          } else if (type === "code") {
            newBlock.lang = "mermaid";
            newBlock.content = ["flowchart TD\n  A[Inicio] --> B[Fin]"];
          }
          this.currentBlocks.push(newBlock);
          this.renderVisualBlocks(this.currentBlocks);
          const serialized = blocksToMarkdown(this.currentBlocks);
          const textarea = document.getElementById("doc-editor-textarea");
          if (textarea) textarea.value = serialized;
          return;
        }
        const blockActionBtn = e.target.closest("[data-block-action]");
        if (blockActionBtn) {
          const card = blockActionBtn.closest(".visual-block-card");
          const bId = card?.getAttribute("data-block-id");
          const action = blockActionBtn.getAttribute("data-block-action");
          const idx = this.currentBlocks.findIndex((b) => b.id === bId);
          if (idx !== -1) {
            if (action === "move-up" && idx > 0) {
              const temp = this.currentBlocks[idx - 1];
              this.currentBlocks[idx - 1] = this.currentBlocks[idx];
              this.currentBlocks[idx] = temp;
            } else if (action === "move-down" && idx < this.currentBlocks.length - 1) {
              const temp = this.currentBlocks[idx + 1];
              this.currentBlocks[idx + 1] = this.currentBlocks[idx];
              this.currentBlocks[idx] = temp;
            } else if (action === "delete") {
              this.currentBlocks.splice(idx, 1);
            }
            this.renderVisualBlocks(this.currentBlocks);
            const serialized = blocksToMarkdown(this.currentBlocks);
            const textarea = document.getElementById("doc-editor-textarea");
            if (textarea) textarea.value = serialized;
          }
          return;
        }
        const saveEditBtn = e.target.closest("#btn-save-doc-edit");
        if (saveEditBtn) {
          const pathEl = document.getElementById("doc-active-path");
          const docKey = pathEl ? pathEl.textContent.trim() : "";
          const textarea = document.getElementById("doc-editor-textarea");
          const newContent = textarea ? textarea.value : "";
          if (docKey) {
            store.saveDoc(docKey, newContent);
            const bodyEl = document.getElementById("doc-active-body");
            if (bodyEl) bodyEl.innerHTML = renderMarkdown(newContent);
            const tocEl = document.getElementById("doc-active-toc");
            if (tocEl) tocEl.innerHTML = renderTocHtml(extractTableOfContents(newContent));
            document.getElementById("doc-editor-view-container")?.classList.add("hidden");
            document.getElementById("doc-reader-view-container")?.classList.remove("hidden");
            const btnText = document.getElementById("btn-toggle-doc-text");
            const btnIcon = document.getElementById("btn-toggle-doc-icon");
            if (btnText) btnText.textContent = "Modo Editor";
            if (btnIcon) btnIcon.innerHTML = Icons.edit("w-3.5 h-3.5");
            this.initMermaidDiagrams();
          }
          return;
        }
        const cancelEditBtn = e.target.closest("#btn-cancel-doc-edit");
        if (cancelEditBtn) {
          document.getElementById("doc-editor-view-container")?.classList.add("hidden");
          document.getElementById("doc-reader-view-container")?.classList.remove("hidden");
          const btnText = document.getElementById("btn-toggle-doc-text");
          const btnIcon = document.getElementById("btn-toggle-doc-icon");
          if (btnText) btnText.textContent = "Modo Editor";
          if (btnIcon) btnIcon.innerHTML = Icons.edit("w-3.5 h-3.5");
          return;
        }
        const copyDocBtn = e.target.closest("#copy-active-doc-btn");
        if (copyDocBtn) {
          const pathEl = document.getElementById("doc-active-path");
          const docKey = pathEl ? pathEl.textContent.trim() : "";
          const content = store.getState().knowledgeIndex?.docs?.[docKey] || "";
          if (content && navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(content).then(() => {
              const orig = copyDocBtn.innerHTML;
              copyDocBtn.innerHTML = Icons.checkCircle("w-3.5 h-3.5");
              setTimeout(() => {
                copyDocBtn.innerHTML = orig;
              }, 2e3);
            });
          }
          return;
        }
        const downloadDocBtn = e.target.closest('[data-action="download-active-doc"]');
        if (downloadDocBtn) {
          const pathEl = document.getElementById("doc-active-path");
          const docKey = pathEl ? pathEl.textContent.trim() : "";
          const content = store.getState().knowledgeIndex?.docs?.[docKey] || "";
          const filename = docKey.split("/").pop() || "document.md";
          const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        }
        const deleteDocBtn = e.target.closest('[data-action="delete-active-doc"]');
        if (deleteDocBtn) {
          const pathEl = document.getElementById("doc-active-path");
          const docKey = pathEl ? pathEl.textContent.trim() : "";
          if (docKey && confirm(`\xBFEst\xE1s seguro de que deseas eliminar "${docKey}" de la Base de Conocimiento?`)) {
            store.deleteDoc(docKey);
            document.getElementById("kb-view-article")?.classList.add("hidden");
            document.getElementById("kb-view-library")?.classList.remove("hidden");
          }
          return;
        }
        const openAiModalBtn = e.target.closest('[data-action="open-ai-context-modal"]');
        if (openAiModalBtn) {
          const modal = document.getElementById("ai-context-modal");
          if (modal) {
            modal.classList.remove("hidden");
            modal.classList.add("flex");
          }
          return;
        }
        const closeAiModalBtn = e.target.closest('[data-action="close-ai-context-modal"]');
        if (closeAiModalBtn || e.target.id === "ai-context-modal") {
          const modal = document.getElementById("ai-context-modal");
          if (modal) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
          }
          return;
        }
        const copyContextBtn = e.target.closest("#copy-context-btn");
        if (copyContextBtn) {
          const textarea = document.getElementById("ai-context-prompt-text");
          if (textarea && navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(textarea.value).then(() => {
              const origHtml = copyContextBtn.innerHTML;
              copyContextBtn.innerHTML = `<span class="inline-flex items-center gap-1">${Icons.checkCircle("w-3.5 h-3.5")} <span>\xA1Copiado!</span></span>`;
              setTimeout(() => {
                copyContextBtn.innerHTML = origHtml;
              }, 2e3);
            }).catch(() => {
            });
          }
          return;
        }
        const openNewDocBtn = e.target.closest('[data-action="open-new-doc-modal"]');
        if (openNewDocBtn) {
          const modal = document.getElementById("new-doc-modal");
          if (modal) {
            modal.classList.remove("hidden");
            modal.classList.add("flex");
            const modInput = document.getElementById("new-doc-module");
            if (modInput) modInput.focus();
          }
          return;
        }
        const closeNewDocBtn = e.target.closest('[data-action="close-new-doc-modal"]');
        if (closeNewDocBtn || e.target.id === "new-doc-modal") {
          const modal = document.getElementById("new-doc-modal");
          if (modal) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
          }
          return;
        }
        const exportKnowledgeBtn = e.target.closest('[data-action="export-all-knowledge"]');
        if (exportKnowledgeBtn) {
          const kData = store.getState().knowledgeIndex;
          const docs = kData?.docs || {};
          let mdExport = docs["MASTER-PROJECT-KNOWLEDGE.md"];
          if (!mdExport) {
            const pName = store.getState().project || "Sistema de Ingenier\xEDa Soberana";
            mdExport = `# Base de Conocimiento Soberana \u2014 ${pName}

`;
            mdExport += `> Compendio exportado autom\xE1ticamente en formato Markdown (.md) bajo el est\xE1ndar Docs-as-Code.

`;
            for (const [key, content] of Object.entries(docs)) {
              mdExport += `

---

<!-- SECCI\xD3N: ${key} -->

${content}
`;
            }
          }
          const blob = new Blob([mdExport], { type: "text/markdown;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const safeName = (store.getState().project || "knowledge-base").toLowerCase().replace(/[^a-z0-9_-]/g, "-");
          a.download = `MASTER-${safeName}.md`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          store.showNotification("Base de conocimiento exportada con \xE9xito en Markdown (.md)", "success");
          return;
        }
        const triggerImportBtn = e.target.closest('[data-action="trigger-import-doc"]');
        if (triggerImportBtn) {
          const fileInput = document.getElementById("import-doc-file-input");
          if (fileInput) fileInput.click();
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
          if (!isNaN(page) && page > 0) store.setPage(page);
          return;
        }
        const resetFiltersBtn = e.target.closest('[data-action="reset-filters"]');
        if (resetFiltersBtn) {
          const searchInput = document.getElementById("feature-search-input");
          if (searchInput) searchInput.value = "";
          store.resetFilters();
          return;
        }
        const archTabBtn = e.target.closest("[data-arch-tab]");
        if (archTabBtn) {
          const targetTab = archTabBtn.getAttribute("data-arch-tab");
          const navContainer = archTabBtn.closest("#arch-diagram-nav") || document.getElementById("arch-diagram-nav");
          if (navContainer) {
            navContainer.querySelectorAll(".arch-tab-btn").forEach((btn) => {
              btn.classList.remove("active", "bg-indigo-600", "text-white", "font-semibold");
              btn.classList.add("text-slate-600", "dark:text-slate-400");
            });
            archTabBtn.classList.add("active", "bg-indigo-600", "text-white", "font-semibold");
            archTabBtn.classList.remove("text-slate-600", "dark:text-slate-400");
          }
          const panels = document.querySelectorAll(".diagram-panel");
          panels.forEach((p) => {
            p.classList.add("hidden");
            p.classList.remove("block");
          });
          const activePanel = document.getElementById(`diagram-panel-${targetTab}`);
          if (activePanel) {
            activePanel.classList.remove("hidden");
            activePanel.classList.add("block");
            this.initMermaidDiagrams();
          }
          return;
        }
        const copyMermaidBtn = e.target.closest("[data-copy-mermaid]");
        if (copyMermaidBtn) {
          const code = copyMermaidBtn.getAttribute("data-copy-mermaid");
          if (code && navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => {
              store.showNotification("C\xF3digo Mermaid copiado al portapapeles", "success");
            }).catch(() => {
              store.showNotification("No se pudo acceder al portapapeles", "warning");
            });
          }
          return;
        }
        const copyActiveBtn = e.target.closest("#copy-active-mermaid-btn");
        if (copyActiveBtn) {
          const activePanel = document.querySelector(".diagram-panel:not(.hidden)");
          const target = activePanel?.querySelector(".mermaid-render-target[data-mermaid-code]");
          const code = target?.getAttribute("data-mermaid-code");
          if (code && navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => {
              store.showNotification("C\xF3digo del diagrama copiado al portapapeles", "success");
            }).catch(() => {
              store.showNotification("No se pudo acceder al portapapeles", "warning");
            });
          } else {
            store.showNotification("No hay c\xF3digo de diagrama activo para copiar", "info");
          }
          return;
        }
        const diagToggle = e.target.closest("[data-diagram-toggle]");
        if (diagToggle) {
          const viewMode = diagToggle.getAttribute("data-diagram-toggle");
          const diagId = diagToggle.getAttribute("data-diagram-id");
          const card = document.getElementById(`mermaid-card-${diagId}`);
          if (card) {
            card.querySelectorAll(".diagram-view-btn").forEach((b) => {
              b.classList.remove("active", "bg-white", "dark:bg-slate-900", "text-slate-900", "dark:text-white", "shadow-xs");
              b.classList.add("text-slate-600", "dark:text-slate-400");
            });
            diagToggle.classList.add("active", "bg-white", "dark:bg-slate-900", "text-slate-900", "dark:text-white", "shadow-xs");
            diagToggle.classList.remove("text-slate-600", "dark:text-slate-400");
            const visualEl = document.getElementById(`diagram-view-visual-${diagId}`);
            const codeEl = document.getElementById(`diagram-view-code-${diagId}`);
            if (viewMode === "visual") {
              visualEl?.classList.remove("hidden");
              codeEl?.classList.add("hidden");
              this.initMermaidDiagrams();
            } else {
              visualEl?.classList.add("hidden");
              codeEl?.classList.remove("hidden");
            }
          }
          return;
        }
        const expandBtn = e.target.closest('[data-action="expand-diagram"]');
        if (expandBtn) {
          const diagId = expandBtn.getAttribute("data-diagram-id");
          const visualTarget = document.getElementById(`mermaid-target-${diagId}`);
          const modal = document.getElementById("diagram-modal");
          const modalContent = document.getElementById("diagram-modal-content");
          const modalTitle = document.getElementById("diagram-modal-title");
          const cardTitle = document.querySelector(`#mermaid-card-${diagId} h4`);
          if (modal && modalContent && visualTarget) {
            modalTitle.textContent = cardTitle ? cardTitle.textContent : "Diagrama Ampliado";
            modalContent.innerHTML = visualTarget.innerHTML;
            modal.classList.remove("hidden");
            modal.classList.add("flex");
          }
          return;
        }
        const closeDiagModal = e.target.closest('[data-action="close-diagram-modal"]');
        if (closeDiagModal || e.target.id === "diagram-modal") {
          const modal = document.getElementById("diagram-modal");
          if (modal) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
          }
          return;
        }
      });
      document.addEventListener("input", (e) => {
        if (e.target.id === "plane-issue-search") {
          clearTimeout(this.searchDebounceTimer);
          const val = e.target.value;
          this.searchDebounceTimer = setTimeout(() => {
            store.setState({ planeSearchQuery: val });
          }, 200);
          return;
        } else if (e.target.id === "plane-page-search") {
          clearTimeout(this.kbSearchDebounceTimer);
          const val = e.target.value;
          this.kbSearchDebounceTimer = setTimeout(() => {
            store.setState({ planePageSearchQuery: val });
          }, 200);
          return;
        }
        if (e.target.id === "feature-search-input") {
          clearTimeout(this.searchDebounceTimer);
          const val = e.target.value;
          this.searchDebounceTimer = setTimeout(() => {
            store.setFilter("search", val);
          }, 260);
        } else if (e.target.id === "kb-library-search-input") {
          clearTimeout(this.kbSearchDebounceTimer);
          const query = (e.target.value || "").toLowerCase().trim();
          this.kbSearchDebounceTimer = setTimeout(() => {
            const cards = document.querySelectorAll(".kb-shelf-doc-card");
            cards.forEach((card) => {
              const title = (card.getAttribute("data-doc-title") || "").toLowerCase();
              const key = (card.getAttribute("data-doc-key") || "").toLowerCase();
              const mod = (card.getAttribute("data-doc-module") || "").toLowerCase();
              const text = card.textContent.toLowerCase();
              if (!query || title.includes(query) || key.includes(query) || mod.includes(query) || text.includes(query)) {
                card.classList.remove("hidden");
              } else {
                card.classList.add("hidden");
              }
            });
            document.querySelectorAll(".kb-shelf-section").forEach((sec) => {
              const visibleCards = sec.querySelectorAll(".kb-shelf-doc-card:not(.hidden)");
              if (query && visibleCards.length === 0) {
                sec.classList.add("hidden");
              } else {
                sec.classList.remove("hidden");
              }
            });
          }, 180);
        } else if (e.target.id === "omnibox-input") {
          clearTimeout(this.omniboxDebounceTimer);
          const query = e.target.value;
          this.omniboxDebounceTimer = setTimeout(() => {
            this.renderOmniboxResults(query);
          }, 150);
        } else if (e.target.id === "doc-editor-textarea") {
          const preview = document.getElementById("doc-editor-live-preview");
          if (preview) {
            preview.innerHTML = renderMarkdown(e.target.value);
          }
        } else if (e.target.closest(".visual-block-card")) {
          this.syncBlocksFromDom();
        }
      });
      document.addEventListener("change", (e) => {
        if (e.target.id === "plane-group-by") {
          store.setState({ planeGroupBy: e.target.value });
          return;
        } else if (e.target.id === "plane-filter-state") {
          store.setState({ planeFilterState: e.target.value });
          return;
        } else if (e.target.id === "modal-state-select") {
          const issueId = e.target.getAttribute("data-issue-id");
          const newState = e.target.value;
          api.updatePlaneIssue(issueId, { state_id: newState }).then(() => {
            const planeData = store.getState().planeData;
            const issue = (planeData.issues || []).find((i) => i.id === issueId);
            const stateObj = (planeData.states || []).find((s) => s.id === newState);
            if (issue && stateObj) {
              issue.state_id = newState;
              issue.state_name = stateObj.name;
              issue.state_color = stateObj.color;
              store.setState({ planeData: { ...planeData } });
            }
          });
          return;
        } else if (e.target.id === "modal-priority-select") {
          const issueId = e.target.getAttribute("data-issue-id");
          const newPriority = e.target.value;
          api.updatePlaneIssue(issueId, { priority: newPriority }).then(() => {
            const planeData = store.getState().planeData;
            const issue = (planeData.issues || []).find((i) => i.id === issueId);
            if (issue) {
              issue.priority = newPriority;
              store.setState({ planeData: { ...planeData } });
            }
          });
          return;
        }
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
        } else if (e.target.id === "kb-rules-module-filter") {
          const selectedMod = e.target.value.toLowerCase().trim();
          const ruleCards = document.querySelectorAll("[data-rule-module]");
          ruleCards.forEach((card) => {
            const cardMod = (card.getAttribute("data-rule-module") || "").toLowerCase().trim();
            if (!selectedMod || cardMod === selectedMod) {
              card.classList.remove("hidden");
            } else {
              card.classList.add("hidden");
            }
          });
        } else if (e.target.id === "import-doc-file-input") {
          const file = e.target.files?.[0];
          if (!file) return;
          const fileReader = new FileReader();
          fileReader.onload = (loadEvent) => {
            const text = loadEvent.target.result;
            if (file.name.endsWith(".json")) {
              try {
                const parsed = JSON.parse(text);
                if (parsed.docs && typeof parsed.docs === "object") {
                  Object.entries(parsed.docs).forEach(([k, c]) => store.saveDoc(k, c));
                } else if (typeof parsed === "object") {
                  Object.entries(parsed).forEach(([k, c]) => {
                    if (typeof c === "string") store.saveDoc(k, c);
                  });
                }
              } catch (err) {
                alert("Error al parsear el archivo JSON: " + err.message);
              }
            } else {
              store.saveDoc(file.name, text);
            }
            e.target.value = "";
          };
          fileReader.readAsText(file);
        } else if (e.target.closest(".visual-block-card")) {
          this.syncBlocksFromDom();
        }
      });
      document.addEventListener("submit", (e) => {
        if (e.target.id === "new-doc-form") {
          e.preventDefault();
          const modInput = document.getElementById("new-doc-module");
          const fileInput = document.getElementById("new-doc-filename");
          const contentInput = document.getElementById("new-doc-content");
          const modVal = (modInput?.value || "").trim();
          let fileVal = (fileInput?.value || "").trim();
          const contentVal = contentInput?.value || "# Nuevo Documento";
          if (!fileVal) return;
          if (!fileVal.endsWith(".md") && !fileVal.endsWith(".markdown")) {
            fileVal += ".md";
          }
          let docKey = fileVal;
          if (modVal && modVal.toLowerCase() !== "general") {
            docKey = `modules/${modVal.toLowerCase()}/${fileVal}`;
          }
          store.saveDoc(docKey, contentVal);
          const modal = document.getElementById("new-doc-modal");
          if (modal) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
          }
          e.target.reset();
        }
      });
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          this.openOmnibox();
          return;
        }
        if (e.key === "Escape") {
          this.closeOmnibox();
          if (store.getState().selectedFeature) {
            store.setSelectedFeature(null);
          }
          const aiModal = document.getElementById("ai-context-modal");
          if (aiModal && !aiModal.classList.contains("hidden")) {
            aiModal.classList.add("hidden");
            aiModal.classList.remove("flex");
          }
          const diagModal = document.getElementById("diagram-modal");
          if (diagModal && !diagModal.classList.contains("hidden")) {
            diagModal.classList.add("hidden");
            diagModal.classList.remove("flex");
          }
          const newDocModal = document.getElementById("new-doc-modal");
          if (newDocModal && !newDocModal.classList.contains("hidden")) {
            newDocModal.classList.add("hidden");
            newDocModal.classList.remove("flex");
          }
        }
      });
    }
  };
  function getBlockTypeLabel(type) {
    switch (type) {
      case "header":
        return "Encabezado";
      case "paragraph":
        return "P\xE1rrafo";
      case "callout":
        return "Alerta";
      case "business_rule":
        return "Regla BR";
      case "code":
        return "C\xF3digo / Diagrama";
      case "divider":
        return "Separador";
      default:
        return "Bloque";
    }
  }
  function renderTocHtml(toc = []) {
    if (!toc || toc.length === 0) {
      return `<div class="text-[11px] text-slate-400 italic py-2">Sin encabezados.</div>`;
    }
    return `
    <nav class="space-y-1 text-xs font-mono">
      ${toc.map((item) => `
        <a href="#${item.id}" 
           class="block py-1 px-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate text-slate-600 dark:text-slate-400 ${item.level === 1 ? "font-bold text-slate-900 dark:text-slate-100" : item.level === 2 ? "pl-3" : "pl-5 text-[11px]"}"
           title="${escapeAttr5(item.text)}">
          ${escapeHtml8(item.text)}
        </a>
      `).join("")}
    </nav>
  `;
  }
  function escapeHtml8(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function escapeAttr5(text) {
    if (!text) return "";
    return String(text).replace(/"/g, "&quot;");
  }
  document.addEventListener("DOMContentLoaded", () => {
    const app = new App();
    app.init();
  });
})();
