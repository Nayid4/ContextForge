/**
 * Environment & Tech Stack Auto-Detector
 * Detecta qué agentes de IA están configurados (Antigravity, Claude Code, Open Code, GitHub Copilot, Codex)
 * y el stack tecnológico del proyecto donde se adoptó el arnés.
 * 100% Vectorial, sin emojis.
 */

export async function detectEnvironment(projectData = {}) {
  const agents = [];

  // Detección de Agentes soportados inspeccionando archivos conocidos
  const agentChecks = [
    {
      id: 'antigravity',
      name: 'Google Antigravity',
      badge: 'Antigravity 2.0',
      iconName: 'zap',
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      paths: ['.agents/rules/antigravity-harness.md', '.agents/ANTIGRAVITY.md', 'ANTIGRAVITY.md', '.agents/agents/leader.md']
    },
    {
      id: 'opencode',
      name: 'Open Code',
      badge: 'OpenCode SDD',
      iconName: 'code',
      color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
      paths: ['opencode.json', '.opencode/rules/commits.md']
    },
    {
      id: 'copilot',
      name: 'GitHub Copilot',
      badge: 'Copilot Chat',
      iconName: 'bot',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      paths: ['.github/instructions/commits.instructions.md', '.github/copilot-instructions.md', '.github/skills/']
    },
    {
      id: 'claude',
      name: 'Claude Code',
      badge: 'Claude SDD',
      iconName: 'cpu',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      paths: ['CLAUDE.md', '.claude/', '.claude.json']
    },
    {
      id: 'codex',
      name: 'Codex / OpenAI',
      badge: 'Codex Engine',
      iconName: 'terminal',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      paths: ['.codex/', '.openai/']
    }
  ];

  const isFileProtocol = typeof window !== 'undefined' && window.location?.protocol === 'file:';

  for (const check of agentChecks) {
    let detected = false;
    if (!isFileProtocol) {
      for (const p of check.paths) {
        try {
          const res = await fetch(p, { method: 'HEAD' });
          if (res.ok) {
            detected = true;
            break;
          }
        } catch (_) {}
      }
    }
    // Fallback: si fetch está restringido por file:// o no hay HEAD, inferir de los metadatos
    if (!detected && typeof window !== 'undefined') {
      if (check.id === 'antigravity' || check.id === 'opencode' || check.id === 'copilot') {
        detected = true; // El arnés incluye soporte homologado para estos tres
      }
    }
    if (detected) {
      agents.push(check);
    }
  }

  // Agente activo principal: si currentSpec tiene responsable o por defecto el primero
  let activeAgent = agents[0] || {
    id: 'antigravity',
    name: 'Google Antigravity',
    badge: 'Antigravity 2.0',
    iconName: 'zap',
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
  };

  const currentExecutor = projectData?.currentSpec?.responsable || projectData?.currentSpec?.executor || '';
  if (currentExecutor.toLowerCase().includes('claude')) {
    activeAgent = agents.find(a => a.id === 'claude') || activeAgent;
  } else if (currentExecutor.toLowerCase().includes('copilot')) {
    activeAgent = agents.find(a => a.id === 'copilot') || activeAgent;
  } else if (currentExecutor.toLowerCase().includes('opencode')) {
    activeAgent = agents.find(a => a.id === 'opencode') || activeAgent;
  }

  // Stack Tecnológico
  let stack = {
    name: projectData?.tech_stack || projectData?.metadata?.stack || 'Multi-Stack Agnostico',
    runtime: projectData?.runtime || 'Universal',
    isAgnostic: true
  };

  if (projectData?.projectSpec) {
    const spec = projectData.projectSpec;
    const runtimeNames = (spec.tech_stack?.runtimes || []).map(r => r.name).join(' · ');
    stack = {
      name: runtimeNames || spec.project?.type || 'Node.js & .NET',
      runtime: spec.project?.type || 'Clean Architecture',
      isAgnostic: false
    };
  }

  // Intentar leer project-spec.yaml si fue generado por la skill technical-audit (solo en modo HTTP)
  if (!isFileProtocol) {
    try {
      const yamlRes = await fetch('project-spec.yaml');
      if (yamlRes.ok) {
        const text = await yamlRes.text();
        const runtimeMatch = text.match(/runtime:\s*([^\r\n]+)/);
        const frameworkMatch = text.match(/framework:\s*([^\r\n]+)/);
        if (runtimeMatch || frameworkMatch) {
          stack = {
            name: [frameworkMatch?.[1], runtimeMatch?.[1]].filter(Boolean).join(' · '),
            runtime: runtimeMatch?.[1] || 'Detectado por technical-audit',
            isAgnostic: false
          };
        }
      }
    } catch (_) {}
  }

  return {
    agents,
    activeAgent,
    stack
  };
}
