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
    // Plane Unified Architecture & Multi-View State
    layoutMode: "plane",
    planeData: { workspace: null, project: null, states: [], cycles: [], modules: [], issues: [], pages: [] },
    planeView: "issues",
    // 'issues' | 'cycles' | 'modules' | 'pages' | 'architecture' | 'graph' | 'constellation' | 'analytics'
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
    isSidebarCollapsed: false,
    isOmniboxOpen: false,
    omniboxQuery: "",
    graphMode: "graph"
    // 'graph' | 'tree'
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
        const rawHash = (typeof window !== "undefined" && window.location?.hash ? window.location.hash.replace("#", "").trim() : "") || "issues";
        let domainView = "issues";
        if (rawHash === "features" || rawHash === "issues" || rawHash === "plane" || rawHash === "plane-issues") {
          domainView = "issues";
        } else if (rawHash === "cycles" || rawHash === "plane-cycles") {
          domainView = "cycles";
        } else if (rawHash === "modules" || rawHash === "plane-modules") {
          domainView = "modules";
        } else if (rawHash === "pages" || rawHash === "knowledge" || rawHash === "plane-pages") {
          domainView = "pages";
        } else if (rawHash === "architecture" || rawHash === "c4" || rawHash === "stack") {
          domainView = "architecture";
        } else if (rawHash === "graph" || rawHash === "tree" || rawHash === "depgraph" || rawHash === "dependencies") {
          domainView = "graph";
        } else if (rawHash === "constellation" || rawHash === "three" || rawHash === "space3d" || rawHash === "3d") {
          domainView = "constellation";
        } else if (rawHash === "analytics" || rawHash === "metrics" || rawHash === "stats") {
          domainView = "analytics";
        } else {
          domainView = rawHash;
        }
        if (callback) callback(domainView, rawHash);
      };
      if (typeof window !== "undefined") {
        window.addEventListener("hashchange", handleHash);
        handleHash();
      }
    },
    navigate(domainView) {
      if (typeof window !== "undefined") {
        window.location.hash = domainView;
      }
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
    user: createIcon('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    play: createIcon('<polygon points="5 3 19 12 5 21 5 3"/>'),
    maximize: createIcon('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>')
  };

  // project-docs/src/shared/utils/renderList.js
  function renderList(items = [], renderItemFn, emptyMessageOrFn = "") {
    if (!items || !Array.isArray(items) || items.length === 0) {
      if (typeof emptyMessageOrFn === "function") {
        return emptyMessageOrFn();
      }
      if (typeof emptyMessageOrFn === "string" && emptyMessageOrFn.trim().length > 0) {
        return `
        <div class="p-8 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 text-xs text-zinc-400">
          <span>${emptyMessageOrFn}</span>
        </div>
      `;
      }
      return "";
    }
    return items.map((item, index) => renderItemFn(item, index, items)).join("");
  }

  // project-docs/src/features/layout/components/PlaneSidebar.js
  function renderPlaneSidebar({
    currentView = "issues",
    activeWorkspace = "Harness Engineering",
    activeProject = "Arn\xE9s de Ingenier\xEDa SDD",
    issueCount = 0,
    cycleCount = 0,
    moduleCount = 0,
    pageCount = 0,
    isCollapsed = false
  }) {
    const navItems = [
      { id: "issues", legacyTab: "features", label: "Tareas (Issues)", icon: "kanban", count: issueCount },
      { id: "cycles", legacyTab: "history", label: "Ciclos (Cycles)", icon: "cycle", count: cycleCount },
      { id: "modules", label: "M\xF3dulos (Epics)", icon: "moduleIcon", count: moduleCount },
      { id: "pages", legacyTab: "knowledge", label: "P\xE1ginas (Docs / IA)", icon: "page", count: pageCount },
      { id: "architecture", legacyTab: "architecture", label: "Arquitectura C4", icon: "layers" },
      { id: "graph", legacyTab: "graph", label: "Grafo de Dependencias", icon: "gitTree" },
      { id: "tree", legacyTab: "tree", label: "\xC1rbol Jer\xE1rquico", icon: "gitTree" },
      { id: "constellation", legacyTab: "three", label: "Constelaci\xF3n 3D", icon: "cube" },
      { id: "analytics", label: "M\xE9tricas & Burn-down", icon: "activity" }
    ];
    const renderNavItem = (item) => {
      const isActive = currentView === item.id;
      const iconFn = Icons[item.icon] || Icons.terminal;
      const tabAttr = item.legacyTab ? `data-tab="${item.legacyTab}"` : "";
      return `
      <button data-plane-nav="${item.id}" ${tabAttr} class="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${isActive ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 shadow-sm font-semibold" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent"}">
        ${iconFn("w-4 h-4 shrink-0")}
        ${!isCollapsed ? `
          <span class="flex-1 text-left truncate">${item.label}</span>
          ${item.count !== void 0 ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 font-mono font-medium">${item.count}</span>` : ""}
        ` : ""}
      </button>
    `;
    };
    return `
    <aside id="plane-sidebar" class="${isCollapsed ? "w-16" : "w-64"} bg-zinc-950 border-r border-zinc-800/80 flex flex-col shrink-0 transition-all duration-200 select-none h-screen sticky top-0 z-30">
      <!-- Workspace Switcher Header -->
      <div class="h-14 px-4 border-b border-zinc-800/80 flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
            HE
          </div>
          ${!isCollapsed ? `
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-semibold text-zinc-100 truncate tracking-tight">${activeWorkspace}</span>
              <span class="text-[10px] text-zinc-400 truncate">Plane Edition \xB7 Screaming</span>
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
          <div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></div>
          ${!isCollapsed ? `
            <span class="text-xs font-medium truncate flex-1">${activeProject}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">SDD</span>
          ` : ""}
        </div>
      </div>

      <!-- Main Navigation Menu (Screaming Domains) -->
      <nav class="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        <div class="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase ${isCollapsed ? "text-center" : ""}">
          ${!isCollapsed ? "Dominio del Negocio" : "\u2022\u2022\u2022"}
        </div>

        ${renderList(navItems, renderNavItem)}
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

  // project-docs/src/features/layout/components/PlaneTopBar.js
  function renderPlaneTopBar({
    currentView = "issues",
    viewTitle = "Tareas (Work Items)",
    activeProject = "Arn\xE9s SDD Multi-Agente",
    theme = "dark"
  }) {
    return `
    <header class="h-14 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      <!-- Breadcrumbs -->
      <div class="flex items-center gap-2 text-xs">
        <span class="text-zinc-400 font-medium">${activeProject}</span>
        <span class="text-zinc-600">/</span>
        <h1 class="text-zinc-100 font-bold tracking-tight text-sm">${viewTitle}</h1>
      </div>

      <!-- Action Tools -->
      <div class="flex items-center gap-3">
        <!-- Quick Search / Omnibox Trigger (Ctrl+K) -->
        <button id="plane-omnibox-trigger" data-action="open-omnibox" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs transition-colors shadow-inner" title="Buscar tareas y documentos (Ctrl+K)">
          ${Icons.search("w-3.5 h-3.5")}
          <span class="hidden sm:inline">Buscar tareas o docs...</span>
          <kbd class="hidden sm:inline-block px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">Ctrl K</kbd>
        </button>

        <!-- Sync SQLite Button -->
        <button id="plane-manual-sync-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-medium transition-colors" title="Sincronizar SQLite con Markdown">
          ${Icons.refresh("w-3.5 h-3.5")}
          <span class="hidden sm:inline">Sincronizar</span>
        </button>

        <!-- Theme Toggle -->
        <button id="plane-theme-toggle" class="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors" title="Cambiar tema claro/oscuro">
          ${theme === "dark" ? Icons.sun("w-4 h-4") : Icons.moon("w-4 h-4")}
        </button>
      </div>
    </header>
  `;
  }

  // project-docs/src/features/layout/components/OmniboxModal.js
  function renderOmniboxModal({
    isOpen = false,
    query = "",
    issues = [],
    pages = []
  }) {
    if (!isOpen) return "";
    const q = (query || "").toLowerCase().trim();
    const matchedIssues = issues.filter(
      (i) => (i.title || "").toLowerCase().includes(q) || (i.id || "").toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q)
    ).slice(0, 5);
    const matchedPages = pages.filter(
      (p) => (p.title || "").toLowerCase().includes(q) || (p.id || "").toLowerCase().includes(q) || (p.file_path || "").toLowerCase().includes(q) || (p.slug || "").toLowerCase().includes(q)
    ).slice(0, 5);
    const renderIssueResult = (issue) => `
    <div data-action="omnibox-select-issue" data-issue-id="${issue.id}" class="omnibox-item flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/80 cursor-pointer transition-colors group">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="text-xs font-mono font-bold text-indigo-400 shrink-0">${issue.id}</span>
        <span class="text-xs text-zinc-200 truncate group-hover:text-white font-medium">${issue.title}</span>
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono shrink-0">${issue.state_name || issue.state_id}</span>
    </div>
  `;
    const renderPageResult = (page) => `
    <div data-action="omnibox-select-page" data-page-id="${page.id}" class="omnibox-item flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/80 cursor-pointer transition-colors group">
      <div class="flex items-center gap-2.5 min-w-0">
        ${Icons.page("w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-400 shrink-0")}
        <span class="text-xs text-zinc-200 truncate group-hover:text-white font-medium">${page.title}</span>
        <span class="text-[10px] text-zinc-500 font-mono">${page.file_path ? page.file_path.split(/[\\/]/).pop() : page.id ? page.id.replace("page-", "") : ""}</span>
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono shrink-0">${page.shelf_id || "doc"}</span>
    </div>
  `;
    return `
    <div id="omnibox-modal" data-backdrop="plane-omnibox" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div class="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <!-- Input Header -->
        <div class="p-4 border-b border-zinc-800 flex items-center gap-3">
          ${Icons.search("w-5 h-5 text-indigo-400 shrink-0")}
          <input
            type="text"
            id="omnibox-input"
            value="${query}"
            placeholder="Escribe para buscar tareas, ciclos, m\xF3dulos o p\xE1ginas..."
            class="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            autofocus
          />
          <kbd class="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-400">ESC</kbd>
        </div>

        <!-- Results Body -->
        <div id="omnibox-results" class="max-h-96 overflow-y-auto p-3 space-y-4">
          <!-- Issues Section -->
          <div>
            <div class="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Tareas Encontradas (${matchedIssues.length})
            </div>
            <div class="space-y-1 mt-1">
              ${renderList(matchedIssues, renderIssueResult, "No se encontraron tareas coincidentes")}
            </div>
          </div>

          <!-- Pages Section -->
          <div>
            <div class="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              P\xE1ginas de Conocimiento (${matchedPages.length})
            </div>
            <div class="space-y-1 mt-1">
              ${renderList(matchedPages, renderPageResult, "No se encontraron documentos coincidentes")}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-3 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Navega con las flechas, pulsa Enter para abrir</span>
          <span class="font-mono">Plane Omnibox</span>
        </div>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/layout/views/MasterLayout.js
  function renderMasterLayout({
    sidebarProps = {},
    topBarProps = {},
    omniboxProps = {},
    mainContentHtml = "",
    modalHtml = ""
  }) {
    return `
    <div id="plane-app-root" class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-row font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <!-- 1. Left Sidebar -->
      ${renderPlaneSidebar(sidebarProps)}

      <!-- 2. Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <!-- Top Navigation Bar -->
        ${renderPlaneTopBar(topBarProps)}

        <!-- Feature View Container -->
        <main id="tab-content" class="flex-1 flex flex-col min-h-0 overflow-y-auto">
          ${mainContentHtml}
        </main>
      </div>

      <!-- 3. Omnibox Modal (Ctrl+K) -->
      ${renderOmniboxModal(omniboxProps)}

      <!-- 4. Flyout Detail Modal / Overlays -->
      ${modalHtml}
    </div>
  `;
  }

  // project-docs/src/features/layout/components/PlaneControlsBar.js
  function renderPlaneControlsBar({
    currentViewMode = "list",
    filterState = "all",
    filterPriority = "all",
    filterAssignee = "all",
    groupBy = "state",
    orderBy = "sequence",
    searchQuery = "",
    totalIssues = 0,
    filteredIssues = 0
  }) {
    const viewModes = [
      { id: "list", label: "Lista", icon: "alignLeft" },
      { id: "board", label: "Tablero (Kanban)", icon: "kanban" },
      { id: "calendar", label: "Calendario", icon: "calendar" },
      { id: "spreadsheet", label: "Hoja de C\xE1lculo", icon: "table" }
    ];
    const renderViewModeBtn = (m) => `
    <button data-view-mode="${m.id}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${currentViewMode === m.id ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/80 font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"}">
      ${(Icons[m.icon] || Icons.terminal)("w-3.5 h-3.5")}
      <span>${m.label}</span>
    </button>
  `;
    return `
    <div id="plane-controls-bar" class="border-b border-zinc-800/80 bg-zinc-950/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sticky top-14 z-10 backdrop-blur-sm">
      <!-- Left: View Mode Pills -->
      <div class="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800">
        ${renderList(viewModes, renderViewModeBtn)}
      </div>

      <!-- Right: Filters & Search Input -->
      <div class="flex items-center flex-wrap gap-2.5">
        <!-- Search Input -->
        <div class="relative">
          <input
            type="text"
            id="plane-issue-search"
            value="${searchQuery}"
            placeholder="Filtrar tareas..."
            class="pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:outline-none text-xs text-zinc-200 placeholder-zinc-500 w-48 sm:w-60 transition-all shadow-inner"
          />
          <div class="absolute left-2.5 top-2 text-zinc-500 pointer-events-none">
            ${Icons.search("w-3.5 h-3.5")}
          </div>
        </div>

        <!-- Filter by State -->
        <select id="plane-filter-state" class="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500 transition-colors">
          <option value="all" ${filterState === "all" ? "selected" : ""}>Todos los Estados</option>
          <option value="state-backlog" ${filterState === "state-backlog" ? "selected" : ""}>Backlog</option>
          <option value="state-todo" ${filterState === "state-todo" ? "selected" : ""}>Por Hacer (Todo)</option>
          <option value="state-in-progress" ${filterState === "state-in-progress" ? "selected" : ""}>En Progreso</option>
          <option value="state-in-review" ${filterState === "state-in-review" ? "selected" : ""}>En Revisi\xF3n</option>
          <option value="state-done" ${filterState === "state-done" ? "selected" : ""}>Completado</option>
          <option value="state-cancelled" ${filterState === "state-cancelled" ? "selected" : ""}>Cancelado</option>
        </select>

        <!-- Filter by Priority -->
        <select id="plane-filter-priority" class="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500 transition-colors">
          <option value="all" ${filterPriority === "all" ? "selected" : ""}>Prioridad (Todas)</option>
          <option value="urgent" ${filterPriority === "urgent" ? "selected" : ""}>P0 Urgente</option>
          <option value="high" ${filterPriority === "high" ? "selected" : ""}>P1 Alta</option>
          <option value="medium" ${filterPriority === "medium" ? "selected" : ""}>P2 Media</option>
          <option value="low" ${filterPriority === "low" ? "selected" : ""}>P3 Baja</option>
        </select>

        <!-- Group By -->
        <select id="plane-group-by" class="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500 transition-colors">
          <option value="state" ${groupBy === "state" ? "selected" : ""}>Agrupar: Estado</option>
          <option value="priority" ${groupBy === "priority" ? "selected" : ""}>Agrupar: Prioridad</option>
          <option value="assignee" ${groupBy === "assignee" ? "selected" : ""}>Agrupar: Agente</option>
        </select>

        <!-- Count indicator -->
        <div class="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800/80 text-[11px] font-mono text-zinc-400">
          <span class="text-zinc-200 font-bold">${filteredIssues}</span> / ${totalIssues}
        </div>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/issues/components/IssueRow.js
  function IssueRow(issue) {
    const priorityIcons = {
      urgent: Icons.priorityUrgent("w-3.5 h-3.5 text-rose-500 shrink-0"),
      high: Icons.priorityHigh("w-3.5 h-3.5 text-amber-500 shrink-0"),
      medium: Icons.priorityMedium("w-3.5 h-3.5 text-blue-500 shrink-0"),
      low: Icons.priorityLow("w-3.5 h-3.5 text-zinc-400 shrink-0")
    };
    const pIcon = priorityIcons[(issue.priority || "none").toLowerCase()] || Icons.priorityLow("w-3.5 h-3.5 text-zinc-500 shrink-0");
    const totalSubtasks = issue.subtasks_count || (issue.subtasks ? issue.subtasks.length : 0);
    const doneSubtasks = issue.subtasks_done || (issue.subtasks ? issue.subtasks.filter((s) => s.status === "done" || s.completed).length : 0);
    const percentSubtasks = totalSubtasks > 0 ? Math.round(doneSubtasks / totalSubtasks * 100) : 0;
    return `
    <tr
      data-issue-id="${issue.id}"
      class="plane-issue-row group border-b border-zinc-800/40 hover:bg-zinc-900/70 transition-colors cursor-pointer select-none text-xs"
    >
      <!-- Priority & ID -->
      <td class="py-3 px-4 w-32">
        <div class="flex items-center gap-2.5">
          <span title="Prioridad: ${issue.priority || "None"}">${pIcon}</span>
          <span class="font-mono font-bold text-indigo-400 group-hover:text-indigo-300">${issue.id}</span>
        </div>
      </td>

      <!-- Title & Badges -->
      <td class="py-3 px-4 min-w-[240px]">
        <div class="flex items-center gap-2">
          <button
            type="button"
            data-action="view-detail"
            data-id="${parseInt(String(issue.id || issue.sequence_id || "0").replace(/\D/g, ""), 10) || issue.id}"
            class="text-zinc-200 hover:text-indigo-400 font-medium truncate max-w-md text-left transition-colors cursor-pointer"
          >
            ${issue.title}
          </button>
          <span class="px-1.5 py-0.2 rounded bg-blue-900/30 border border-blue-500/20 text-blue-300 text-[10px] font-mono font-semibold">DEV</span>
          <span class="px-1.5 py-0.2 rounded bg-purple-900/30 border border-purple-500/20 text-purple-300 text-[10px] font-mono font-semibold">QA</span>
        </div>
      </td>

      <!-- Subtasks Jira Progress -->
      <td class="py-3 px-4 w-36 hidden sm:table-cell">
        ${totalSubtasks > 0 ? `
          <div class="flex items-center gap-2" title="Subtareas completadas: ${doneSubtasks}/${totalSubtasks}">
            <div class="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full" style="width: ${percentSubtasks}%"></div>
            </div>
            <span class="text-[10px] text-zinc-400 font-mono">${doneSubtasks}/${totalSubtasks}</span>
          </div>
        ` : `
          <span class="text-[10px] text-zinc-500 font-mono">0 subtareas</span>
        `}
      </td>

      <!-- Module -->
      <td class="py-3 px-4 w-36 hidden md:table-cell">
        <span class="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-[10px] text-zinc-300 font-mono truncate max-w-[120px] block">
          ${issue.module_name || "Harness Core"}
        </span>
      </td>

      <!-- Assignee Agent -->
      <td class="py-3 px-4 w-32 hidden lg:table-cell">
        <span class="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
          ${Icons.user("w-3 h-3 text-indigo-400")}
          <span class="truncate">${issue.assignee_role || issue.assignee_name || "leader"}</span>
        </span>
      </td>

      <!-- State Badge -->
      <td class="py-3 px-4 w-32 text-right">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${issue.state_id === "state-done" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : issue.state_id === "state-in-progress" ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : issue.state_id === "state-in-review" ? "bg-purple-500/15 border-purple-500/30 text-purple-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"}">
          ${issue.state_name || issue.state_id}
        </span>
      </td>
    </tr>
  `;
  }

  // project-docs/src/features/issues/components/IssueCard.js
  function IssueCard(issue) {
    const priorityIcons = {
      urgent: Icons.priorityUrgent("w-3.5 h-3.5 text-rose-500 shrink-0"),
      high: Icons.priorityHigh("w-3.5 h-3.5 text-amber-500 shrink-0"),
      medium: Icons.priorityMedium("w-3.5 h-3.5 text-blue-500 shrink-0"),
      low: Icons.priorityLow("w-3.5 h-3.5 text-zinc-400 shrink-0")
    };
    const pIcon = priorityIcons[(issue.priority || "none").toLowerCase()] || Icons.priorityLow("w-3.5 h-3.5 text-zinc-500 shrink-0");
    const totalSubtasks = issue.subtasks_count || (issue.subtasks ? issue.subtasks.length : 0);
    const doneSubtasks = issue.subtasks_done || (issue.subtasks ? issue.subtasks.filter((s) => s.status === "done" || s.completed).length : 0);
    const percentSubtasks = totalSubtasks > 0 ? Math.round(doneSubtasks / totalSubtasks * 100) : 0;
    return `
    <div
      data-issue-id="${issue.id}"
      class="plane-issue-card group p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 shadow-md hover:shadow-lg transition-all cursor-pointer select-none space-y-2.5"
    >
      <!-- Card Header: ID, Priority & Action Menu -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span title="Prioridad: ${issue.priority || "None"}">
            ${pIcon}
          </span>
          <span class="text-xs font-mono font-bold text-indigo-400">
            ${issue.id}
          </span>
        </div>

        <!-- Quick move state buttons -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button data-action="quick-state" data-target-state="state-in-progress" data-issue-id="${issue.id}" class="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-amber-400" title="Pasar a En Progreso">
            ${Icons.play("w-3 h-3")}
          </button>
          <button data-action="quick-state" data-target-state="state-done" data-issue-id="${issue.id}" class="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-emerald-400" title="Marcar como Completado">
            ${Icons.check("w-3 h-3")}
          </button>
        </div>
      </div>

      <!-- Card Title -->
      <h4 class="text-xs font-medium text-zinc-100 group-hover:text-white line-clamp-2 leading-snug">
        ${issue.title}
      </h4>

      <!-- Subtasks Progress -->
      ${totalSubtasks > 0 ? `
        <div class="space-y-1 pt-1">
          <div class="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>Subtareas Jira</span>
            <span>${doneSubtasks}/${totalSubtasks} (${percentSubtasks}%)</span>
          </div>
          <div class="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" style="width: ${percentSubtasks}%"></div>
          </div>
        </div>
      ` : ""}

      <!-- Card Footer: Module & Assignee -->
      <div class="pt-1 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
        <span class="truncate max-w-[110px] font-mono text-zinc-400">
          ${issue.module_name || "General"}
        </span>

        <span class="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 font-mono">
          ${Icons.user("w-2.5 h-2.5 text-indigo-400")}
          <span>${issue.assignee_role || "Agent"}</span>
        </span>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/issues/components/IssueDetailModal.js
  function IssueDetailModal({
    issue = null,
    states = [],
    cycles = [],
    modules = []
  }) {
    if (!issue) return "";
    const subtotal = issue.subtasks ? issue.subtasks.length : 0;
    const completed = issue.subtasks ? issue.subtasks.filter((s) => s.status === "done" || s.status === "passed").length : 0;
    const percent = subtotal > 0 ? Math.round(completed / subtotal * 100) : 0;
    const renderAcceptanceCriterion = (crit) => `
    <div class="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60 text-xs text-zinc-300">
      <span class="p-0.5 rounded text-emerald-400 mt-0.5">${Icons.check("w-3.5 h-3.5")}</span>
      <span>${crit}</span>
    </div>
  `;
    const renderSubtaskItem = (sub) => {
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
    };
    return `
    <div id="plane-issue-modal-backdrop" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      <div id="plane-issue-modal-card" role="dialog" class="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
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
            <button id="plane-modal-close" data-action="close-modal" class="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Cerrar modal">
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
            <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs">
              <div class="font-semibold text-zinc-300 flex items-center gap-1.5">
                ${Icons.lightbulb("w-3.5 h-3.5 text-amber-400")}
                <span>Historia de Usuario (Scrum)</span>
              </div>
              <div class="text-zinc-400 pl-5 space-y-0.5">
                <p><strong class="text-zinc-300">Como:</strong> ${issue.user_story_as_a || "Desarrollador / Agente"}</p>
                <p><strong class="text-zinc-300">Quiero:</strong> ${issue.user_story_i_want || issue.title}</p>
                <p><strong class="text-zinc-300">Para:</strong> ${issue.user_story_so_that || "garantizar la calidad y trazabilidad integral del software"}</p>
              </div>
            </div>

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
                  ${renderList(issue.acceptance, renderAcceptanceCriterion)}
                </div>
              </div>
            ` : ""}

            <!-- Subtasks Section (Jira DEV & QA) -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Subtareas Jira DEV / QA</h4>
                <span class="text-xs font-mono text-zinc-400">${completed} de ${subtotal} (${percent}%)</span>
              </div>

              <div class="space-y-2">
                ${issue.subtasks && issue.subtasks.length > 0 ? renderList(issue.subtasks, renderSubtaskItem) : `
                  <div class="space-y-2">
                    <div class="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-start justify-between gap-3 text-xs">
                      <div class="flex items-start gap-2.5">
                        <span class="p-0.5 rounded text-emerald-400 mt-0.5">${Icons.checkCircle("w-4 h-4")}</span>
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="font-mono text-[11px] font-semibold text-zinc-300">${issue.id}-DEV</span>
                            <span class="text-[10px] px-1.5 py-0.2 rounded font-medium bg-blue-900/40 text-blue-300">DEV Subtask</span>
                          </div>
                          <p class="text-zinc-200 mt-1">Implementaci\xF3n t\xE9cnica y suites de pruebas</p>
                        </div>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">DONE</span>
                    </div>
                    <div class="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-start justify-between gap-3 text-xs">
                      <div class="flex items-start gap-2.5">
                        <span class="p-0.5 rounded text-emerald-400 mt-0.5">${Icons.checkCircle("w-4 h-4")}</span>
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="font-mono text-[11px] font-semibold text-zinc-300">${issue.id}-QA</span>
                            <span class="text-[10px] px-1.5 py-0.2 rounded font-medium bg-purple-900/40 text-purple-300">QA Subtask</span>
                          </div>
                          <p class="text-zinc-200 mt-1">Auditor\xEDa de calidad y verificaci\xF3n integral</p>
                        </div>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">DONE</span>
                    </div>
                  </div>
                `}
              </div>
            </div>

            <!-- Definition of Done Section -->
            <div class="space-y-3">
              <h4 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Definition of Done (DoD)</h4>
              <div class="space-y-1.5 text-xs text-zinc-300">
                <div class="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800">
                  <span class="text-emerald-400">${Icons.check("w-3.5 h-3.5")}</span>
                  <span>100% de subtareas Jira DEV implementadas con tests unitarios y suites multinivel</span>
                </div>
                <div class="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800">
                  <span class="text-emerald-400">${Icons.check("w-3.5 h-3.5")}</span>
                  <span>100% de subtareas Jira QA verificadas con evidencias de ejecuci\xF3n</span>
                </div>
                <div class="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800">
                  <span class="text-emerald-400">${Icons.check("w-3.5 h-3.5")}</span>
                  <span>Script aut\xF3nomo verify.sh pasa al 100% (c\xF3digo de salida 0)</span>
                </div>
              </div>
            </div>

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
                ${renderList(states, (s) => `
                  <option value="${s.id}" ${s.id === issue.state_id ? "selected" : ""}>
                    ${s.name}
                  </option>
                `)}
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

  // project-docs/src/features/issues/views/IssueListView.js
  function renderIssueListView({
    issues = [],
    states = [],
    groupBy = "state"
  }) {
    if (issues.length === 0) {
      return `
      <div class="p-12 text-center space-y-3">
        <div class="inline-flex p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500">
          ${Icons.search("w-6 h-6")}
        </div>
        <h3 class="text-sm font-semibold text-zinc-300">No se encontraron tareas</h3>
        <p class="text-xs text-zinc-500 max-w-sm mx-auto">Prueba ajustando los filtros de b\xFAsqueda, estado o prioridad.</p>
      </div>
    `;
    }
    if (groupBy === "state") {
      return `
      <div class="p-4">
        <div class="rounded-xl border border-zinc-800/80 bg-zinc-950/60 overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th class="py-2.5 px-4 w-32">ID</th>
                <th class="py-2.5 px-4">Tarea</th>
                <th class="py-2.5 px-4 w-36 hidden sm:table-cell">Subtareas</th>
                <th class="py-2.5 px-4 w-36 hidden md:table-cell">M\xF3dulo</th>
                <th class="py-2.5 px-4 w-32 hidden lg:table-cell">Agente</th>
                <th class="py-2.5 px-4 w-32 text-right">Estado</th>
              </tr>
            </thead>
            ${renderList(states, (state) => {
        const stateIssues = issues.filter((i) => i.state_id === state.id);
        if (stateIssues.length === 0) return "";
        return `
                <tbody class="divide-y divide-zinc-800/40">
                  <tr class="bg-zinc-900/60 border-y border-zinc-800/80">
                    <td colspan="6" class="px-4 py-2">
                      <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full ${state.color || "bg-zinc-400"}"></span>
                        <span class="text-xs font-bold text-zinc-200 tracking-tight">${state.name}</span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono font-medium">
                          ${stateIssues.length}
                        </span>
                      </div>
                    </td>
                  </tr>
                  ${renderList(stateIssues, IssueRow)}
                </tbody>
              `;
      })}
          </table>
        </div>
      </div>
    `;
    }
    return `
    <div class="p-4">
      <div class="rounded-xl border border-zinc-800/80 bg-zinc-950/60 overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th class="py-2.5 px-4 w-32">ID</th>
              <th class="py-2.5 px-4">Tarea</th>
              <th class="py-2.5 px-4 w-36 hidden sm:table-cell">Subtareas</th>
              <th class="py-2.5 px-4 w-36 hidden md:table-cell">M\xF3dulo</th>
              <th class="py-2.5 px-4 w-32 hidden lg:table-cell">Agente</th>
              <th class="py-2.5 px-4 w-32 text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${renderList(issues, IssueRow)}
          </tbody>
        </table>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/issues/views/IssueBoardView.js
  function renderIssueBoardView({
    issues = [],
    states = []
  }) {
    const defaultStates = states.length > 0 ? states : [
      { id: "state-backlog", name: "Backlog", color: "bg-zinc-500" },
      { id: "state-todo", name: "Por Hacer", color: "bg-sky-500" },
      { id: "state-in-progress", name: "En Progreso", color: "bg-amber-500" },
      { id: "state-in-review", name: "En Revisi\xF3n", color: "bg-purple-500" },
      { id: "state-done", name: "Completado", color: "bg-emerald-500" },
      { id: "state-cancelled", name: "Cancelado", color: "bg-rose-500" }
    ];
    const renderColumn = (state) => {
      const colIssues = issues.filter((i) => i.state_id === state.id);
      return `
      <div
        data-state-column="${state.id}"
        class="w-72 sm:w-80 shrink-0 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 flex flex-col max-h-[calc(100vh-12rem)] shadow-lg"
      >
        <!-- Column Header -->
        <div class="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between gap-2 bg-zinc-900/40 rounded-t-2xl">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full ${state.color || "bg-zinc-400"} shrink-0 shadow-sm"></span>
            <span class="text-xs font-bold text-zinc-200 truncate tracking-tight">${state.name}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono font-medium">
              ${colIssues.length}
            </span>
          </div>
        </div>

        <!-- Column Cards Container -->
        <div class="flex-1 overflow-y-auto p-3 space-y-3">
          ${renderList(colIssues, IssueCard, () => `
            <div class="p-6 text-center rounded-xl border border-dashed border-zinc-800/80 text-[11px] text-zinc-400">
              Sin tareas en este estado
            </div>
          `)}
        </div>
      </div>
    `;
    };
    return `
    <div class="p-6 overflow-x-auto min-h-full">
      <div class="flex items-start gap-4 pb-4">
        ${renderList(defaultStates, renderColumn)}
      </div>
    </div>
  `;
  }

  // project-docs/src/features/issues/views/IssueCalendarView.js
  function renderIssueCalendarView({
    issues = [],
    cycles = []
  }) {
    const renderTimelineItem = (issue) => `
    <div
      data-issue-id="${issue.id}"
      class="plane-issue-row p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between gap-4 transition-all cursor-pointer"
    >
      <div class="flex items-center gap-3 min-w-0">
        <span class="text-xs font-mono font-bold text-indigo-400 shrink-0">${issue.id}</span>
        <span class="text-xs text-zinc-200 font-medium truncate">${issue.title}</span>
      </div>

      <div class="flex items-center gap-3 shrink-0 text-xs">
        <span class="text-[11px] font-mono text-zinc-400">${issue.cycle_name || "Sprint Activo"}</span>
        <span class="px-2 py-0.5 rounded text-[10px] font-mono ${issue.state_id === "state-done" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-300"}">
          ${issue.state_name || issue.state_id}
        </span>
      </div>
    </div>
  `;
    return `
    <div class="p-6 space-y-6 max-w-6xl mx-auto">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            ${Icons.calendar("w-4 h-4 text-indigo-400")}
            <span>Cronograma Temporal de Tareas (Calendar & Timeline)</span>
          </h2>
          <p class="text-xs text-zinc-400 mt-0.5">Seguimiento temporal por ciclos e iteraciones de entrega.</p>
        </div>
      </div>

      <div class="space-y-2">
        ${renderList(issues, renderTimelineItem, "No hay tareas programadas")}
      </div>
    </div>
  `;
  }

  // project-docs/src/features/issues/views/IssueSpreadsheetView.js
  function renderIssueSpreadsheetView({
    issues = []
  }) {
    const renderTableRow = (issue, idx) => `
    <tr
      data-issue-id="${issue.id}"
      class="plane-issue-row border-b border-zinc-800/50 hover:bg-zinc-900/60 transition-colors cursor-pointer text-xs"
    >
      <td class="p-3 text-center text-zinc-500 font-mono">${idx + 1}</td>
      <td class="p-3 font-mono font-bold text-indigo-400">${issue.id}</td>
      <td class="p-3 font-medium text-zinc-200 truncate max-w-xs">${issue.title}</td>
      <td class="p-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-mono ${issue.state_id === "state-done" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : issue.state_id === "state-in-progress" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "bg-zinc-800 text-zinc-400"}">
          ${issue.state_name || issue.state_id}
        </span>
      </td>
      <td class="p-3 font-mono text-[11px] text-zinc-300 capitalize">${issue.priority || "none"}</td>
      <td class="p-3 text-zinc-400 font-mono text-[11px]">${issue.assignee_role || "leader"}</td>
      <td class="p-3 text-zinc-400 font-mono text-[11px]">${issue.module_name || "Harness Core"}</td>
      <td class="p-3 text-zinc-400 font-mono text-[11px]">${issue.cycle_name || "Sprint Activo"}</td>
    </tr>
  `;
    return `
    <div class="p-6 overflow-x-auto">
      <div class="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-xl">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th class="p-3 text-center w-12">#</th>
              <th class="p-3 w-28">ID</th>
              <th class="p-3">T\xEDtulo de la Tarea</th>
              <th class="p-3 w-32">Estado</th>
              <th class="p-3 w-28">Prioridad</th>
              <th class="p-3 w-32">Agente</th>
              <th class="p-3 w-36">M\xF3dulo</th>
              <th class="p-3 w-36">Ciclo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/40">
            ${renderList(issues, renderTableRow, () => `
              <tr>
                <td colspan="8" class="p-8 text-center text-xs text-zinc-400">
                  No hay tareas registradas en la hoja de c\xE1lculo
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/cycles/components/BurnDownChart.js
  function BurnDownChart({
    points = [],
    svgWidth = 600,
    svgHeight = 160,
    padding = 30,
    maxVal = 10,
    idealPath = "",
    realPath = "",
    getX = () => 0,
    getY = () => 0
  }) {
    return `
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
          ${renderList(points, (p, idx) => `
            <circle cx="${getX(idx)}" cy="${getY(p.remaining)}" r="4" fill="#818cf8" stroke="#1e1b4b" stroke-width="2"/>
            <text x="${getX(idx)}" y="${svgHeight - 8}" font-size="9" fill="#71717a" text-anchor="middle" font-family="monospace">${p.label}</text>
          `)}
        </svg>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/cycles/components/CycleCard.js
  function CycleCard({ cycle, issues = [] }) {
    const cycleIssues = issues.filter((i) => i.cycle_id === cycle.id);
    const total = cycleIssues.length;
    const done = cycleIssues.filter((i) => i.state_id === "state-done").length;
    const percent = total > 0 ? Math.round(done / total * 100) : 0;
    const isActive = cycle.status === "active";
    return `
    <div class="p-4 rounded-xl border ${isActive ? "border-indigo-500/30 bg-indigo-950/10" : "border-zinc-800 bg-zinc-900/40"} space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}"></span>
          <span class="text-xs font-bold text-zinc-100">${cycle.name}</span>
          ${isActive ? `
            <span class="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-semibold">ACTIVO</span>
          ` : `
            <span class="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">CERRADO</span>
          `}
        </div>

        <div class="text-xs font-mono text-zinc-400">
          <span>${cycle.start_date || "N/A"} al ${cycle.end_date || "N/A"}</span>
        </div>
      </div>

      <p class="text-xs text-zinc-400 line-clamp-2">${cycle.description || ""}</p>

      <!-- Progress Bar -->
      <div class="space-y-1">
        <div class="flex justify-between text-[11px] font-mono text-zinc-400">
          <span>${done}/${total} tareas completadas</span>
          <span class="${percent === 100 ? "text-emerald-400" : "text-zinc-300"} font-bold">${percent}%</span>
        </div>
        <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div class="h-full bg-indigo-500 rounded-full" style="width: ${percent}%"></div>
        </div>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/cycles/views/CyclesView.js
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
          <h2 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            ${Icons.cycle("w-5 h-5 text-indigo-400")}
            <span>Ciclos de Desarrollo (Sprints Plane)</span>
          </h2>
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
              <div class="text-xs font-mono font-bold text-zinc-200 mt-0.5">${activeCycle.start_date || "N/A"} al ${activeCycle.end_date || "N/A"}</div>
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

        <!-- Interactive SVG Burn-down Chart Component -->
        ${BurnDownChart({
      points,
      svgWidth,
      svgHeight,
      padding,
      maxVal,
      idealPath,
      realPath,
      getX,
      getY
    })}
      </div>

      <!-- All Cycles List -->
      <div class="space-y-4">
        <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Historial de Ciclos (${cycles.length})</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${renderList(cycles, (c) => CycleCard({ cycle: c, issues }))}
        </div>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/modules/components/ModuleCard.js
  function ModuleCard({ module, issues = [] }) {
    const modIssues = issues.filter((i) => i.module_id === module.id || i.module_name === module.name);
    const total = modIssues.length;
    const done = modIssues.filter((i) => i.state_id === "state-done").length;
    const percent = total > 0 ? Math.round(done / total * 100) : 0;
    return `
    <div class="border border-zinc-800 rounded-2xl bg-zinc-950/60 p-5 space-y-4 hover:border-zinc-700 transition-all shadow-md hover:shadow-xl">
      <!-- Module Header -->
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full ${percent === 100 ? "bg-emerald-500" : "bg-indigo-500"} shrink-0"></span>
            <h3 class="text-sm font-bold text-zinc-100 tracking-tight">${module.name}</h3>
          </div>
          <p class="text-xs text-zinc-400 line-clamp-2">${module.description || "M\xF3dulo de arquitectura"}</p>
        </div>

        <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${percent === 100 ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"}">
          ${percent}% OK
        </span>
      </div>

      <!-- Progress Bar -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>${done} de ${total} requerimientos</span>
          <span class="font-bold text-zinc-300">${percent}%</span>
        </div>
        <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
        </div>
      </div>

      <!-- Associated Tasks Summary -->
      ${total > 0 ? `
        <div class="pt-2 border-t border-zinc-800/60 space-y-1.5">
          <span class="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Tareas Vinculadas</span>
          <div class="space-y-1">
            ${renderList(modIssues.slice(0, 3), (i) => `
              <div data-issue-id="${i.id}" class="plane-issue-row flex items-center justify-between p-1.5 rounded hover:bg-zinc-900 cursor-pointer text-xs">
                <span class="font-mono text-indigo-400 shrink-0 text-[11px]">${i.id}</span>
                <span class="text-zinc-300 truncate max-w-[200px] text-[11px]">${i.title}</span>
                <span class="text-[10px] text-zinc-500 font-mono">${i.state_name || i.state_id}</span>
              </div>
            `)}
            ${total > 3 ? `
              <div class="text-[10px] text-zinc-500 text-center pt-1">+${total - 3} tareas m\xE1s en este m\xF3dulo</div>
            ` : ""}
          </div>
        </div>
      ` : ""}
    </div>
  `;
  }

  // project-docs/src/features/modules/views/ModulesView.js
  function renderModulesView({
    modules = [],
    issues = [],
    onSelectIssue = () => {
    }
  }) {
    return `
    <div class="p-6 space-y-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            ${Icons.moduleIcon("w-5 h-5 text-indigo-400")}
            <span>M\xF3dulos de Arquitectura (Epics / Bounded Contexts)</span>
          </h1>
          <p class="text-xs text-zinc-400 mt-0.5">Agrupaci\xF3n de dominios de negocio, servicios e historias del arn\xE9s.</p>
        </div>
      </div>

      <!-- Modules Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${renderList(modules, (m) => ModuleCard({ module: m, issues }), () => `
          <div class="col-span-full p-12 text-center text-xs text-zinc-500">
            No hay m\xF3dulos registrados en la arquitectura.
          </div>
        `)}
      </div>
    </div>
  `;
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
                          data-copy-mermaid="${escapeAttr(codeText)}" 
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
                <div class="mermaid-render-target w-full flex justify-center items-center" data-mermaid-code="${escapeAttr(codeText)}">
                  <pre class="mermaid text-xs font-mono text-slate-400">${escapeHtml(codeText)}</pre>
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
                <pre><code>${codeLines.map((l, idx) => `<span class="inline-block w-6 select-none opacity-30 text-right mr-3">${idx + 1}</span>${escapeHtml(l)}`).join("\n")}</code></pre>
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
      html.push(`<div class="my-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden shadow-md"><div class="p-4 text-xs font-mono overflow-x-auto leading-relaxed"><pre><code>${escapeHtml(codeText)}</code></pre></div></div>`);
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
  function escapeHtml(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function escapeAttr(text) {
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

  // project-docs/src/features/pages/components/KnowledgeBase.js
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
                    ${escapeHtml2(heroDocMeta.title || heroDocKey)}
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    ${escapeHtml2(heroDocMeta.summary || "Especificaci\xF3n formal del sistema con diagramas de contexto, contenedores y componentes.")}
                  </p>
                  <div class="font-mono text-[11px] text-slate-400">
                    Ruta can\xF3nica: <code class="text-indigo-600 dark:text-indigo-400 font-bold">${heroDocKey}</code>
                  </div>
                </div>

                <div class="flex sm:flex-col items-stretch gap-2.5 shrink-0 w-full sm:w-auto">
                  <button type="button" 
                          data-action="open-article-read"
                          data-doc-key="${escapeAttr2(heroDocKey)}"
                          class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer">
                    ${Icons.bookOpen} <span>Leer Art\xEDculo Completo</span>
                  </button>
                  <button type="button" 
                          data-action="open-article-edit"
                          data-doc-key="${escapeAttr2(heroDocKey)}"
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
                        ${escapeHtml2(sh.title)}
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
                        <div class="kb-shelf-doc-card plane-page-item rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between group"
                             data-doc-key="${escapeAttr2(key)}"
                             data-doc-shelf="${escapeAttr2(sh.id)}"
                             data-doc-title="${escapeAttr2(meta.title)}"
                             data-doc-module="${escapeAttr2(meta.moduleName || "")}">
                          
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
                                ${escapeHtml2(meta.title)}
                              </h4>
                              <div class="text-[10px] font-mono text-slate-400 truncate mt-1">
                                ${escapeHtml2(key)}
                              </div>
                            </div>

                            <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                              ${escapeHtml2(meta.summary)}
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
                                      data-doc-key="${escapeAttr2(key)}"
                                      class="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1">
                                ${Icons.bookOpen("w-3.5 h-3.5")} <span>Leer</span>
                              </button>
                              <button type="button" 
                                      data-action="open-article-edit"
                                      data-doc-key="${escapeAttr2(key)}"
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
                          data-module-tab="${escapeAttr2(modId)}"
                          class="kb-module-tab-btn ${isActive ? "active bg-purple-600 text-white font-bold shadow-xs" : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"} px-4 py-2 rounded-2xl text-xs font-mono transition-all cursor-pointer shrink-0 inline-flex items-center gap-2">
                    ${Icons.folder("w-3.5 h-3.5")}
                    <span>${escapeHtml2(mod.title || modId)}</span>
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
                <div id="kb-module-content-${escapeAttr2(modId)}" class="kb-module-content-panel space-y-6 ${isHidden ? "hidden" : ""}">
                  
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
                        <span>${escapeHtml2(mod.title || modId)}</span>
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
                        <div class="kb-shelf-doc-card plane-page-item rounded-2xl border ${spec.color} bg-white dark:bg-slate-900/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                             data-doc-key="${escapeAttr2(docKey)}"
                             data-doc-shelf="modules"
                             data-doc-title="${escapeAttr2(spec.title)}"
                             data-doc-module="${escapeAttr2(modId)}">
                          
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
                                ${escapeHtml2(spec.title)}
                              </h4>
                              <div class="text-[10px] font-mono text-slate-400 truncate mt-1">
                                ${escapeHtml2(docKey)}
                              </div>
                            </div>

                            <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                              ${escapeHtml2(spec.desc)}
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
                                      data-doc-key="${escapeAttr2(docKey)}"
                                      class="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-600 hover:text-white text-purple-600 dark:text-purple-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1">
                                ${Icons.bookOpen("w-3.5 h-3.5")} <span>Leer</span>
                              </button>
                              <button type="button" 
                                      data-action="open-article-edit"
                                      data-doc-key="${escapeAttr2(docKey)}"
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
                        data-doc-key="${escapeAttr2(masterDocKey)}"
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
                      ${escapeHtml2(ch.title)}
                    </h5>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      ${escapeHtml2(ch.desc)}
                    </p>
                  </div>

                  <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" 
                            data-action="open-article-read"
                            data-doc-key="${escapeAttr2(masterDocKey)}"
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
                        class="w-full p-4 font-mono text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed h-[560px] overflow-y-auto">${escapeHtml2(activeDocContent)}</textarea>
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
                <option value="${escapeAttr2(m)}">${m}</option>
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
                <div data-rule-module="${escapeAttr2(rule.module || "general")}" 
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
                        ${escapeHtml2(rule.title)}
                      </h4>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${sevBadge}">
                      ${rule.severity || "Normal"}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-1">
                    ${escapeHtml2(rule.description)}
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
                  <span class="font-bold text-xs text-slate-900 dark:text-slate-100">${escapeHtml2(svc.name)}</span>
                  <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 dark:cyan-950 text-cyan-700 dark:text-cyan-300 font-semibold">
                    ${escapeHtml2(svc.type)}
                  </span>
                </div>
                <div class="space-y-1 text-[11px] font-mono">
                  <div class="text-slate-500 dark:text-slate-400">
                    Protocolo: <span class="text-slate-800 dark:text-slate-200 font-semibold">${escapeHtml2(svc.protocol)}</span>
                  </div>
                  <div class="text-slate-500 dark:text-slate-400">
                    Autenticaci\xF3n: <span class="text-slate-800 dark:text-slate-200 font-semibold">${escapeHtml2(svc.auth)}</span>
                  </div>
                  <div class="text-slate-500 dark:text-slate-400">
                    Variable: <code class="text-indigo-600 dark:text-indigo-400">${escapeHtml2(svc.env_var)}</code>
                  </div>
                </div>
                <div class="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-600 dark:text-slate-400">
                  <strong class="text-slate-700 dark:text-slate-300">Failover:</strong> ${escapeHtml2(svc.failover)}
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
                  <span>${escapeHtml2(g)}</span>
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
            <textarea id="ai-context-prompt-text" readonly rows="13" class="w-full p-3.5 font-mono text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 resize-none focus:outline-none leading-relaxed">${escapeHtml2(dynamicAiPrompt)}</textarea>
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
           title="${escapeAttr2(item.text)}">
          ${escapeHtml2(item.text)}
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
  function escapeHtml2(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function escapeAttr2(text) {
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
                  data-copy-mermaid="${escapeAttr3(code)}"
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
        <h4 class="font-bold text-sm sm:text-base text-slate-900 dark:text-white">${escapeHtml3(title)}</h4>
        <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">${escapeHtml3(description)}</p>
      </div>

      <!-- 3. Contenedores de Vista -->
      
      <!-- 3.1 VISTA VISUAL (RENDER SVG INTERACTIVO) -->
      <div id="diagram-view-visual-${id}" class="diagram-visual-panel p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/60 overflow-x-auto min-h-[320px] flex items-center justify-center">
        <div class="mermaid-render-target w-full flex justify-center items-center" 
             id="mermaid-target-${id}" 
             data-mermaid-code="${escapeAttr3(code)}">
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
          <button type="button" data-copy-mermaid="${escapeAttr3(code)}" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer">Copiar</button>
        </div>
        <pre class="text-xs font-mono text-indigo-300 leading-relaxed overflow-x-auto p-2 select-all"><code>${escapeHtml3(code)}</code></pre>
      </div>

    </div>
  `;
  }
  function escapeHtml3(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function escapeAttr3(text) {
    if (!text) return "";
    return String(text).replace(/"/g, "&quot;");
  }

  // project-docs/src/features/architecture/views/ArchitectureView.js
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
              ${escapeHtml4(proj.name || "Proyecto de Software")}
            </h2>
            <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              ${escapeHtml4(proj.tagline || "Arquitectura Can\xF3nica y Especificaci\xF3n T\xE9cnica")}
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
                ${escapeHtml4(proj.description)}
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
                    <span>${escapeHtml4(g)}</span>
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
                      <span>${escapeHtml4(row.technology)}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    ${escapeHtml4(row.version || "Auto")}
                  </td>
                  <td class="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs">
                    ${escapeHtml4(row.purpose)}
                  </td>
                  <td class="py-3 px-4 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${row.statusBadgeClass}">
                      <span class="w-1.5 h-1.5 rounded-full ${row.statusDotClass}"></span>
                      ${row.status}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    ${escapeHtml4(row.dependencies || "Nativa / MIT")}
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
                    <h4 class="font-bold text-xs text-slate-900 dark:text-slate-100">${escapeHtml4(pName)}</h4>
                    <span class="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      ${escapeHtml4(pType)}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    ${escapeHtml4(pDesc)}
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
                            <span>${escapeHtml4(r)}</span>
                          </li>
                        `).join("")}
                      </ul>
                    </div>

                    <div>
                      <span class="font-mono font-bold text-[10px] uppercase text-slate-400">Stack Tecnol\xF3gico & Tareas Asignadas:</span>
                      <div class="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-1 mb-2">
                        ${escapeHtml4(mod.tech || "")}
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
  function escapeHtml4(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // project-docs/src/features/graph/components/DependencyGraph.js
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

  // project-docs/src/features/graph/views/DependencyGraphView.js
  function renderDependencyGraphView({
    features = [],
    graphMode = "graph",
    // 'graph' | 'tree'
    onSelectFeature = () => {
    }
  }) {
    return `
    <div class="p-6 space-y-6 max-w-7xl mx-auto">
      <!-- Header with Mode Switch -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            ${Icons.gitTree("w-5 h-5 text-indigo-400")}
            <span>Grafo & \xC1rbol de Dependencias del Proyecto</span>
          </h1>
          <p class="text-xs text-zinc-400 mt-0.5">Topolog\xEDa t\xE9cnica ac\xEDclica (DAG) y taxonom\xEDa de requerimientos.</p>
        </div>

        <!-- Mode Toggle -->
        <div class="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button id="toggle-graph-mode-dag" class="px-3 py-1.5 rounded-md text-xs font-semibold ${graphMode === "graph" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}">
            Grafo en Malla (DAG)
          </button>
          <button id="toggle-graph-mode-tree" class="px-3 py-1.5 rounded-md text-xs font-semibold ${graphMode === "tree" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}">
            \xC1rbol Jer\xE1rquico
          </button>
        </div>
      </div>

      <!-- Graph Container Card -->
      <div class="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl overflow-hidden min-h-[500px]">
        <div id="dependency-interactive-target">
          ${renderDependencyGraph({ features })}
        </div>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/graph/components/DependencyTree.js
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
                ${escapeHtml5(sub.name)}
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
                    ${escapeHtml5(f.title || f.name)}
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
                  <h2 class="text-lg font-bold tracking-tight">${escapeHtml5(projectName)}</h2>
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
  function escapeHtml5(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // project-docs/src/features/constellation/views/Constellation3DView.js
  function renderConstellation3DView() {
    return `
    <div class="p-6 space-y-6 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between shrink-0">
        <div>
          <h1 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            ${Icons.cube("w-5 h-5 text-indigo-400")}
            <span>Constelaci\xF3n Piramidal 3D (Three.js)</span>
          </h1>
          <p class="text-xs text-zinc-400 mt-0.5">Topolog\xEDa piramidal de 4 niveles arquitect\xF3nicos con flujo de part\xEDculas.</p>
        </div>

        <div class="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">Arrastra para rotar \xB7 Rueda para zoom</span>
        </div>
      </div>

      <!-- 3D Canvas Mounting Container -->
      <div id="space-3d-canvas-container" class="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden relative shadow-2xl">
        <div class="absolute inset-0 flex items-center justify-center text-xs text-zinc-500 font-mono">
          Iniciando motor Three.js...
        </div>
      </div>
    </div>
  `;
  }

  // project-docs/src/features/constellation/components/SpaceView3D.js
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

  // project-docs/src/features/analytics/views/AnalyticsView.js
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
    const agentKeys = Object.keys(agentWorkload);
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
        <div class="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 shadow-md">
          <div class="flex items-center justify-between text-zinc-400 text-xs">
            <span>Tasa de Completitud</span>
            ${Icons.checkCircle("w-4 h-4 text-emerald-400")}
          </div>
          <div class="text-2xl font-bold font-mono text-zinc-100">${completionRate}%</div>
          <p class="text-[11px] text-zinc-400">${done} de ${total} requerimientos cerrados</p>
        </div>

        <div class="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 shadow-md">
          <div class="flex items-center justify-between text-zinc-400 text-xs">
            <span>En Ejecuci\xF3n Activa</span>
            ${Icons.clock("w-4 h-4 text-amber-400")}
          </div>
          <div class="text-2xl font-bold font-mono text-amber-400">${inProgress}</div>
          <p class="text-[11px] text-zinc-400">Tareas en progreso o en revisi\xF3n</p>
        </div>

        <div class="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 shadow-md">
          <div class="flex items-center justify-between text-zinc-400 text-xs">
            <span>Ratio de Pruebas QA</span>
            ${Icons.shield("w-4 h-4 text-emerald-400")}
          </div>
          <div class="text-2xl font-bold font-mono text-emerald-400">100%</div>
          <p class="text-[11px] text-zinc-400">9 niveles de verificaci\xF3n superados</p>
        </div>

        <div class="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 shadow-md">
          <div class="flex items-center justify-between text-zinc-400 text-xs">
            <span>Persistencia SQLite</span>
            ${Icons.database("w-4 h-4 text-indigo-400")}
          </div>
          <div class="text-2xl font-bold font-mono text-indigo-400">WAL</div>
          <p class="text-[11px] text-zinc-400">Dual Sync Markdown activo</p>
        </div>
      </div>

      <!-- Agent Workload Breakdown -->
      <div class="border border-zinc-800/80 rounded-2xl bg-zinc-950/70 p-6 space-y-4 shadow-xl">
        <h3 class="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Carga de Trabajo por Rol de Agente</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          ${renderList(agentKeys, (agentKey) => {
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
    })}
        </div>
      </div>

      <!-- Priority Distribution -->
      <div class="border border-zinc-800/80 rounded-2xl bg-zinc-950/70 p-6 space-y-4 shadow-xl">
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

  // project-docs/src/main.js
  var App = class {
    constructor() {
      this.root = document.getElementById("app");
      this.spaceView3D = new SpaceView3D();
      this.currentTreeComponent = null;
      this.activeView = "issues";
      this.envInfo = null;
      this.isAppMounted = false;
      this.searchDebounceTimer = null;
      this.pageSearchDebounceTimer = null;
      this.autoSyncController = null;
      this.lastSyncTime = /* @__PURE__ */ new Date();
      this.currentActiveDocKey = null;
      this.editorMode = "markdown";
      this.currentBlocks = [];
      this.isScrollingFromEditor = false;
      this.isScrollingFromPreview = false;
      this.scrollResetTimer = null;
    }
    async init() {
      router.init((domainView, rawHash) => {
        this.handleViewChange(domainView, rawHash);
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
      this.autoSyncController = api.startPolling(5e3, (freshData) => {
        if (freshData) {
          this.lastSyncTime = /* @__PURE__ */ new Date();
          store.setData(freshData);
        }
      });
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
    handleViewChange(domainView, rawHash) {
      if (this.activeView === "constellation" && domainView !== "constellation") {
        this.spaceView3D.unmount();
      }
      this.activeView = domainView;
      store.setState({
        planeView: domainView,
        graphMode: rawHash === "tree" ? "tree" : "graph"
      });
      this.render();
    }
    handleStateChange(state) {
      this.render();
    }
    render() {
      if (!this.root) return;
      const state = store.getState();
      const planeData = state.planeData || {};
      const issues = planeData.issues || state.features || [];
      const states = planeData.states || [];
      const cycles = planeData.cycles || [];
      const modules = planeData.modules || [];
      const pages = planeData.pages || [];
      const currentView = state.planeView || "issues";
      if (state.loading && issues.length === 0) {
        this.root.innerHTML = `
        <div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 space-y-4">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 class="text-base font-bold tracking-tight">Iniciando Plataforma Plane...</h2>
          <p class="text-xs text-zinc-500 font-mono">Sincronizando SQLite y base de conocimiento Markdown</p>
        </div>
      `;
        return;
      }
      if (state.error && issues.length === 0) {
        this.root.innerHTML = `
        <div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
            ${Icons.clock("w-8 h-8")}
          </div>
          <h2 class="text-lg font-bold text-rose-400">Error al inicializar el tablero</h2>
          <p class="text-xs text-zinc-400 max-w-md text-center">${state.error}</p>
          <button type="button" data-action="refresh" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer">
            Reintentar
          </button>
        </div>
      `;
        return;
      }
      const searchQuery = state.planeSearchQuery || "";
      const filterState = state.planeFilterState || "all";
      const filterPriority = state.planeFilterPriority || "all";
      const filterAssignee = state.planeFilterAssignee || "all";
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
      const viewTitles = {
        issues: "Tareas (Work Items)",
        cycles: "Ciclos de Desarrollo (Sprints)",
        modules: "M\xF3dulos de Arquitectura (Epics)",
        pages: "P\xE1ginas & Base de Conocimiento (Docs / IA)",
        architecture: "Arquitectura C4 & Stack Tecnol\xF3gico",
        graph: "Grafo & \xC1rbol de Dependencias",
        tree: "\xC1rbol Jer\xE1rquico de Requerimientos",
        constellation: "Constelaci\xF3n Piramidal 3D",
        analytics: "Anal\xEDtica, Velocidad & Rendimiento"
      };
      const viewTitle = viewTitles[currentView] || "Tareas";
      let mainContentHtml = "";
      if (currentView === "issues") {
        const controlsHtml = renderPlaneControlsBar({
          currentViewMode: state.planeViewMode || "list",
          filterState,
          filterPriority,
          filterAssignee,
          groupBy: state.planeGroupBy || "state",
          orderBy: state.planeOrderBy || "sequence",
          searchQuery,
          totalIssues: issues.length,
          filteredIssues: filteredIssues.length
        });
        let viewComponentHtml = "";
        if (state.planeViewMode === "board") {
          viewComponentHtml = renderIssueBoardView({ issues: filteredIssues, states });
        } else if (state.planeViewMode === "calendar") {
          viewComponentHtml = renderIssueCalendarView({ issues: filteredIssues, cycles });
        } else if (state.planeViewMode === "spreadsheet") {
          viewComponentHtml = renderIssueSpreadsheetView({ issues: filteredIssues });
        } else {
          viewComponentHtml = renderIssueListView({ issues: filteredIssues, states, groupBy: state.planeGroupBy || "state" });
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
          ${renderCyclesView({ cycles, issues, onSelectIssue: (id) => this.openIssueModal(id) })}
        </div>
      `;
      } else if (currentView === "modules") {
        mainContentHtml = `
        <div class="flex-1 overflow-y-auto">
          ${renderModulesView({ modules, issues, onSelectIssue: (id) => this.openIssueModal(id) })}
        </div>
      `;
      } else if (currentView === "pages") {
        mainContentHtml = `
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
          ${renderKnowledgeBase({
          knowledgeIndex: state.knowledgeIndex || planeData.knowledgeIndex,
          projectSpec: state.projectSpec || planeData.projectSpec,
          features: state.features || issues
        })}
        </div>
      `;
      } else if (currentView === "architecture") {
        mainContentHtml = `
        <div class="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto space-y-6">
          ${renderArchitectureDocs({
          projectSpec: state.projectSpec || planeData.projectSpec,
          knowledgeIndex: state.knowledgeIndex || planeData.knowledgeIndex,
          features: state.features || issues
        })}
        </div>
      `;
      } else if (currentView === "graph" || currentView === "tree") {
        mainContentHtml = `
        <div class="flex-1 overflow-y-auto">
          ${renderDependencyGraphView({
          features: state.features || issues,
          graphMode: state.graphMode || (currentView === "tree" ? "tree" : "graph")
        })}
        </div>
      `;
      } else if (currentView === "constellation") {
        mainContentHtml = `
        <div class="flex-1 overflow-y-auto">
          ${renderConstellation3DView()}
        </div>
      `;
      } else if (currentView === "analytics") {
        mainContentHtml = `
        <div class="flex-1 overflow-y-auto">
          ${renderAnalyticsView({ issues, states, cycles, modules })}
        </div>
      `;
      }
      let modalHtml = "";
      if (state.planeSelectedIssueId) {
        const selectedIssue = issues.find((i) => String(i.id) === String(state.planeSelectedIssueId));
        if (selectedIssue) {
          modalHtml = IssueDetailModal({
            issue: selectedIssue,
            states,
            cycles,
            modules
          });
        }
      }
      this.root.innerHTML = renderMasterLayout({
        sidebarProps: {
          currentView,
          activeWorkspace: planeData.workspace?.name || "Harness Engineering",
          activeProject: planeData.project?.name || "Arn\xE9s SDD Multi-Agente",
          issueCount: issues.length,
          cycleCount: cycles.length,
          moduleCount: modules.length,
          pageCount: pages.length,
          isCollapsed: state.isSidebarCollapsed || false
        },
        topBarProps: {
          currentView,
          viewTitle,
          activeProject: planeData.project?.name || "Arn\xE9s SDD Multi-Agente",
          theme: state.theme
        },
        omniboxProps: {
          isOpen: state.isOmniboxOpen || false,
          query: state.omniboxQuery || "",
          issues,
          pages
        },
        mainContentHtml,
        modalHtml
      });
      if (currentView === "constellation") {
        const threeTarget = document.getElementById("space-3d-canvas-container");
        if (threeTarget) {
          this.spaceView3D.mount(threeTarget, {
            features: state.features || issues,
            onSelect: (f) => this.openIssueModal(f.id)
          });
        }
      } else if (currentView === "graph" || currentView === "tree") {
        if (state.graphMode === "tree") {
          const treeTarget = document.getElementById("dependency-interactive-target");
          if (treeTarget) {
            this.currentTreeComponent = new DependencyTreeComponent(treeTarget, {
              features: state.features || issues,
              currentSpec: state.currentSpec,
              onSelect: (f) => this.openIssueModal(f.id)
            });
          }
        }
      } else if (currentView === "architecture") {
        this.initMermaidDiagrams();
      }
      this.isAppMounted = true;
    }
    openIssueModal(issueId) {
      store.setState({ planeSelectedIssueId: issueId });
    }
    closeIssueModal() {
      store.setState({ planeSelectedIssueId: null });
    }
    initMermaidDiagrams() {
      if (window.mermaid) {
        try {
          window.mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            themeVariables: {
              darkMode: true,
              background: "#09090b",
              primaryColor: "#6366f1",
              primaryBorderColor: "#818cf8",
              primaryTextColor: "#f4f4f5",
              lineColor: "#52525b"
            }
          });
          window.mermaid.run({ querySelector: ".mermaid" });
        } catch (e) {
          console.warn("Error inicializando Mermaid:", e);
        }
      }
    }
    bindGlobalEvents() {
      document.addEventListener("click", async (e) => {
        const toggleCollapseBtn = e.target.closest("#toggle-sidebar-collapse");
        if (toggleCollapseBtn) {
          const curr = store.getState().isSidebarCollapsed || false;
          store.setState({ isSidebarCollapsed: !curr });
          return;
        }
        const navBtn = e.target.closest("[data-plane-nav]");
        if (navBtn) {
          const targetView = navBtn.getAttribute("data-plane-nav");
          if (targetView) {
            router.navigate(targetView);
          }
          return;
        }
        const archTabBtn = e.target.closest("button[data-arch-tab]");
        if (archTabBtn) {
          const tabId = archTabBtn.getAttribute("data-arch-tab");
          document.querySelectorAll(".arch-tab-btn").forEach((b) => {
            b.classList.remove("active", "bg-indigo-600", "text-white");
            b.classList.add("text-slate-400");
          });
          archTabBtn.classList.add("active", "bg-indigo-600", "text-white");
          archTabBtn.classList.remove("text-slate-400");
          document.querySelectorAll(".diagram-panel").forEach((p) => {
            p.classList.add("hidden");
            p.classList.remove("block");
          });
          const targetPanel = document.getElementById(`diagram-panel-${tabId}`);
          if (targetPanel) {
            targetPanel.classList.remove("hidden");
            targetPanel.classList.add("block");
          }
          return;
        }
        if (e.target.closest("#toggle-graph-mode-dag")) {
          store.setState({ graphMode: "graph" });
          router.navigate("graph");
          return;
        }
        if (e.target.closest("#toggle-graph-mode-tree")) {
          store.setState({ graphMode: "tree" });
          router.navigate("tree");
          return;
        }
        const viewModeBtn = e.target.closest("button[data-view-mode]");
        if (viewModeBtn) {
          const mode = viewModeBtn.getAttribute("data-view-mode");
          store.setState({ planeViewMode: mode });
          return;
        }
        const viewDetailBtn = e.target.closest('button[data-action="view-detail"]');
        if (viewDetailBtn) {
          const id = viewDetailBtn.getAttribute("data-id");
          const issues = store.getState().planeData?.issues || store.getState().features || [];
          const match = issues.find((i) => String(i.id) === String(id) || String(i.id) === `INT-${String(id).padStart(3, "0")}` || String(i.sequence_id) === String(id));
          if (match) {
            this.openIssueModal(match.id);
          } else if (id) {
            this.openIssueModal(id);
          }
          return;
        }
        const issueRow = e.target.closest(".plane-issue-row, .plane-issue-card");
        if (issueRow && !e.target.closest("button") && !e.target.closest("select")) {
          const issueId = issueRow.getAttribute("data-issue-id");
          if (issueId) {
            this.openIssueModal(issueId);
          }
          return;
        }
        if (e.target.closest("#plane-modal-close") || e.target.closest('[data-action="close-modal"]') || e.target.id === "plane-issue-modal-backdrop") {
          this.closeIssueModal();
          return;
        }
        const quickStateBtn = e.target.closest('button[data-action="quick-state"]');
        if (quickStateBtn) {
          e.stopPropagation();
          const targetState = quickStateBtn.getAttribute("data-target-state");
          const issueId = quickStateBtn.getAttribute("data-issue-id");
          if (issueId && targetState) {
            await api.updatePlaneIssue(issueId, { state_id: targetState });
            await this.refreshData();
          }
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
        const pageBtn = e.target.closest("button[data-page-id]");
        if (pageBtn) {
          const pageId = pageBtn.getAttribute("data-page-id");
          const page = (store.getState().planeData?.pages || []).find((p) => p.id === pageId);
          store.setState({
            planeActivePageId: pageId,
            planeActivePageContent: page?.content_markdown || "",
            planePageEditorMode: "reader"
          });
          return;
        }
        if (e.target.closest("#plane-page-toggle-mode")) {
          const curr = store.getState().planePageEditorMode || "reader";
          store.setState({ planePageEditorMode: curr === "reader" ? "editor" : "reader" });
          return;
        }
        const savePageBtn = e.target.closest("#plane-page-save-btn");
        if (savePageBtn) {
          const pageId = savePageBtn.getAttribute("data-page-id");
          const editorInput = document.getElementById("plane-page-editor-input");
          const content = editorInput ? editorInput.value : "";
          if (pageId && content) {
            savePageBtn.textContent = "Guardando...";
            await api.updatePlanePage(pageId, content);
            await this.refreshData();
            store.setState({ planeActivePageContent: content, planePageEditorMode: "reader" });
          }
          return;
        }
        if (e.target.closest("#plane-manual-sync-btn")) {
          const btn = document.getElementById("plane-manual-sync-btn");
          if (btn) btn.classList.add("animate-pulse");
          await api.syncPlane();
          await this.refreshData();
          if (btn) btn.classList.remove("animate-pulse");
          return;
        }
        if (e.target.closest("#plane-theme-toggle")) {
          store.toggleTheme();
          return;
        }
        if (e.target.closest("#plane-omnibox-trigger") || e.target.closest('[data-action="open-omnibox"]')) {
          store.setState({ isOmniboxOpen: true, omniboxQuery: "" });
          return;
        }
        if (e.target.id === "plane-omnibox-backdrop" || e.target.id === "omnibox-modal") {
          store.setState({ isOmniboxOpen: false });
          return;
        }
        const omniIssue = e.target.closest('[data-action="omnibox-select-issue"]');
        if (omniIssue) {
          const issueId = omniIssue.getAttribute("data-issue-id");
          store.setState({ isOmniboxOpen: false });
          router.navigate("issues");
          this.openIssueModal(issueId);
          return;
        }
        const omniPage = e.target.closest('[data-action="omnibox-select-page"]');
        if (omniPage) {
          const pageId = omniPage.getAttribute("data-page-id");
          const page = (store.getState().planeData?.pages || []).find((p) => p.id === pageId);
          store.setState({
            isOmniboxOpen: false,
            planeActivePageId: pageId,
            planeActivePageContent: page?.content_markdown || ""
          });
          router.navigate("pages");
          return;
        }
      });
      document.addEventListener("input", (e) => {
        if (e.target.id === "plane-issue-search") {
          clearTimeout(this.searchDebounceTimer);
          this.searchDebounceTimer = setTimeout(() => {
            store.setState({ planeSearchQuery: e.target.value });
          }, 150);
          return;
        }
        if (e.target.id === "plane-page-search") {
          clearTimeout(this.pageSearchDebounceTimer);
          this.pageSearchDebounceTimer = setTimeout(() => {
            store.setState({ planePageSearchQuery: e.target.value });
          }, 150);
          return;
        }
        if (e.target.id === "plane-omnibox-input" || e.target.id === "omnibox-input") {
          store.setState({ omniboxQuery: e.target.value });
          return;
        }
        if (e.target.id === "doc-editor-textarea") {
          const preview = document.getElementById("doc-editor-live-preview");
          if (preview) {
            preview.innerHTML = renderMarkdown(e.target.value);
          }
          return;
        }
      });
      document.addEventListener("change", async (e) => {
        if (e.target.id === "plane-filter-state") {
          store.setState({ planeFilterState: e.target.value });
          return;
        }
        if (e.target.id === "plane-filter-priority") {
          store.setState({ planeFilterPriority: e.target.value });
          return;
        }
        if (e.target.id === "plane-group-by") {
          store.setState({ planeGroupBy: e.target.value });
          return;
        }
        if (e.target.id === "modal-state-select") {
          const issueId = e.target.getAttribute("data-issue-id");
          const newState = e.target.value;
          if (issueId && newState) {
            await api.updatePlaneIssue(issueId, { state_id: newState });
            await this.refreshData();
          }
          return;
        }
        if (e.target.id === "modal-priority-select") {
          const issueId = e.target.getAttribute("data-issue-id");
          const newPriority = e.target.value;
          if (issueId && newPriority) {
            await api.updatePlaneIssue(issueId, { priority: newPriority });
            await this.refreshData();
          }
          return;
        }
      });
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          const isOpen = store.getState().isOmniboxOpen;
          store.setState({ isOmniboxOpen: !isOpen, omniboxQuery: "" });
          return;
        }
        if (e.key === "Escape") {
          const st = store.getState();
          if (st.isOmniboxOpen) {
            store.setState({ isOmniboxOpen: false });
          } else if (st.planeSelectedIssueId) {
            this.closeIssueModal();
          }
        }
      });
    }
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
              <button type="button" data-block-action="move-up" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600" title="Subir">
                ${Icons.chevronUp("w-3.5 h-3.5")}
              </button>
              <button type="button" data-block-action="move-down" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600" title="Bajar">
                ${Icons.chevronDown("w-3.5 h-3.5")}
              </button>
              <button type="button" data-block-action="delete" class="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600" title="Eliminar">
                ${Icons.trash("w-3.5 h-3.5")}
              </button>
            </div>
          </div>
          <div class="space-y-2">
            ${b.type === "header" ? `
              <input type="text" class="w-full text-base font-bold bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white" value="${escapeAttr4(b.text)}" placeholder="T\xEDtulo..." />
            ` : `
              <textarea rows="3" class="w-full text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-mono text-slate-900 dark:text-white">${escapeHtml6(Array.isArray(b.lines) ? b.lines.join("\n") : b.text || (Array.isArray(b.content) ? b.content.join("\n") : ""))}</textarea>
            `}
          </div>
        </div>
      `;
      }).join("");
    }
  };
  function renderTocHtml(toc = []) {
    if (!toc || toc.length === 0) {
      return `<div class="text-[11px] text-slate-400 italic py-2">Sin encabezados.</div>`;
    }
    return `
    <nav class="space-y-1 text-xs font-mono">
      ${toc.map((item) => `
        <a href="#${item.id}" 
           class="block py-1 px-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate text-slate-600 dark:text-slate-400 ${item.level === 1 ? "font-bold text-slate-900 dark:text-slate-100" : item.level === 2 ? "pl-3" : "pl-5 text-[11px]"}"
           title="${escapeAttr4(item.text)}">
          ${escapeHtml6(item.text)}
        </a>
      `).join("")}
    </nav>
  `;
  }
  function escapeHtml6(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function escapeAttr4(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function getBlockTypeLabel(type) {
    switch (type) {
      case "header":
        return "Encabezado";
      case "paragraph":
        return "P\xE1rrafo";
      case "callout":
        return "Alerta";
      case "business_rule":
        return "Invariante BR";
      case "code":
        return "C\xF3digo / Diagrama";
      case "table":
        return "Tabla";
      default:
        return "Bloque";
    }
  }
  var app = new App();
  document.addEventListener("DOMContentLoaded", () => {
    app.init();
  });
})();
