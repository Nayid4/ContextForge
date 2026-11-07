import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DOCS_DIR = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(PROJECT_DOCS_DIR, 'data');
const DEFAULT_DB_PATH = path.join(DATA_DIR, 'harness.db');

function ensureColumn(db, tableName, columnName, columnDef) {
  const cols = db.prepare(`PRAGMA table_info(${tableName})`).all();
  if (!cols.some(c => c.name === columnName)) {
    const safeDef = columnDef.replace(/DEFAULT\s+CURRENT_TIMESTAMP/i, "DEFAULT ''");
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${safeDef};`);
  }
}

export function initDatabase(dbPath = DEFAULT_DB_PATH) {
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);

  // Optimización WAL y Foreign Keys
  if (dbPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }
  db.exec('PRAGMA foreign_keys = ON;');

  // 1. Workspaces (Plane Workspace Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      owner_id TEXT DEFAULT 'user-leader',
      organization_size TEXT DEFAULT '10-50',
      timezone TEXT DEFAULT 'America/Bogota',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  ensureColumn(db, 'workspaces', 'owner_id', "TEXT DEFAULT 'user-leader'");
  ensureColumn(db, 'workspaces', 'organization_size', "TEXT DEFAULT '10-50'");
  ensureColumn(db, 'workspaces', 'timezone', "TEXT DEFAULT 'America/Bogota'");
  ensureColumn(db, 'workspaces', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

  // 2. Users & AI Bot Agents (Plane User Model: is_bot, bot_type)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL,
      is_bot INTEGER NOT NULL DEFAULT 1,
      bot_type TEXT DEFAULT 'sdd-agent',
      avatar_svg TEXT DEFAULT 'bot',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Workspace Members (Plane WorkspaceMember Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS workspace_members (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role INTEGER NOT NULL DEFAULT 20,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 4. API Tokens (Plane APIToken Model: user_type 0=Human, 1=Bot)
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_tokens (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      label TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      user_type INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      expired_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 5. Projects (Plane Project Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      identifier TEXT NOT NULL DEFAULT 'INT',
      description TEXT,
      network INTEGER NOT NULL DEFAULT 2,
      cycle_view INTEGER NOT NULL DEFAULT 1,
      module_view INTEGER NOT NULL DEFAULT 1,
      issue_views_view INTEGER NOT NULL DEFAULT 1,
      page_view INTEGER NOT NULL DEFAULT 1,
      inbox_view INTEGER NOT NULL DEFAULT 1,
      is_time_tracking_enabled INTEGER NOT NULL DEFAULT 1,
      is_issue_type_enabled INTEGER NOT NULL DEFAULT 1,
      estimate_id TEXT DEFAULT 'est-fibonacci',
      default_state_id TEXT DEFAULT 'state-backlog',
      default_assignee_id TEXT DEFAULT 'user-leader',
      project_lead_id TEXT DEFAULT 'user-leader',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
    );
  `);
  ensureColumn(db, 'projects', 'identifier', "TEXT NOT NULL DEFAULT 'INT'");
  ensureColumn(db, 'projects', 'network', 'INTEGER NOT NULL DEFAULT 2');
  ensureColumn(db, 'projects', 'cycle_view', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn(db, 'projects', 'module_view', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn(db, 'projects', 'issue_views_view', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn(db, 'projects', 'page_view', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn(db, 'projects', 'inbox_view', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn(db, 'projects', 'is_time_tracking_enabled', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn(db, 'projects', 'is_issue_type_enabled', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn(db, 'projects', 'estimate_id', "TEXT DEFAULT 'est-fibonacci'");
  ensureColumn(db, 'projects', 'default_state_id', "TEXT DEFAULT 'state-backlog'");
  ensureColumn(db, 'projects', 'default_assignee_id', "TEXT DEFAULT 'user-leader'");
  ensureColumn(db, 'projects', 'project_lead_id', "TEXT DEFAULT 'user-leader'");
  ensureColumn(db, 'projects', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

  // 6. States (Plane State Workflow Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS states (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT NOT NULL,
      slug TEXT DEFAULT '',
      sequence INTEGER NOT NULL,
      group_name TEXT NOT NULL,
      is_triage INTEGER NOT NULL DEFAULT 0,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);
  ensureColumn(db, 'states', 'description', "TEXT DEFAULT ''");
  ensureColumn(db, 'states', 'slug', "TEXT DEFAULT ''");
  ensureColumn(db, 'states', 'is_triage', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'states', 'is_default', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'states', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

  // 7. Labels (Plane Label Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS labels (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      parent_id TEXT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT NOT NULL DEFAULT '#6366f1',
      sort_order REAL NOT NULL DEFAULT 1000,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // 8. Estimates & EstimatePoints (Plane Estimate Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS estimates (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      type TEXT NOT NULL DEFAULT 'points',
      last_used INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS estimate_points (
      id TEXT PRIMARY KEY,
      estimate_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      key_val INTEGER NOT NULL,
      description TEXT DEFAULT '',
      value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // 9. Issue Types (Plane IssueType Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS issue_types (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      logo_props TEXT DEFAULT '{}',
      is_epic INTEGER NOT NULL DEFAULT 0,
      is_default INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // 10. Cycles (Plane Cycle / Sprint Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS cycles (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      owned_by_id TEXT DEFAULT 'user-leader',
      view_props TEXT DEFAULT '{}',
      sort_order REAL DEFAULT 1000,
      status TEXT NOT NULL,
      progress_snapshot TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);
  ensureColumn(db, 'cycles', 'owned_by_id', "TEXT DEFAULT 'user-leader'");
  ensureColumn(db, 'cycles', 'view_props', "TEXT DEFAULT '{}'");
  ensureColumn(db, 'cycles', 'sort_order', 'REAL DEFAULT 1000');
  ensureColumn(db, 'cycles', 'progress_snapshot', "TEXT DEFAULT '{}'");

  // 11. Modules (Plane Module / Bounded Context Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      description_text TEXT DEFAULT '',
      description_html TEXT DEFAULT '',
      start_date TEXT,
      target_date TEXT,
      status TEXT NOT NULL,
      lead_id TEXT DEFAULT 'user-leader',
      lead_role TEXT,
      view_props TEXT DEFAULT '{}',
      sort_order REAL DEFAULT 1000,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);
  ensureColumn(db, 'modules', 'description_text', "TEXT DEFAULT ''");
  ensureColumn(db, 'modules', 'description_html', "TEXT DEFAULT ''");
  ensureColumn(db, 'modules', 'start_date', 'TEXT');
  ensureColumn(db, 'modules', 'target_date', 'TEXT');
  ensureColumn(db, 'modules', 'lead_id', "TEXT DEFAULT 'user-leader'");
  ensureColumn(db, 'modules', 'view_props', "TEXT DEFAULT '{}'");
  ensureColumn(db, 'modules', 'sort_order', 'REAL DEFAULT 1000');

  // 12. Issues (Plane Issue Model + SDD Traceability)
  db.exec(`
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      workspace_id TEXT NOT NULL DEFAULT 'ws-harness',
      sequence_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      description_html TEXT DEFAULT '',
      description_stripped TEXT DEFAULT '',
      state_id TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'none',
      parent_id TEXT,
      type_id TEXT DEFAULT 'type-feature',
      point INTEGER DEFAULT 3,
      estimate_point_id TEXT DEFAULT 'ep-3',
      assignee_role TEXT,
      cycle_id TEXT,
      module_id TEXT,
      spec_folder TEXT,
      branch TEXT,
      start_date TEXT,
      target_date TEXT,
      completed_at DATETIME,
      sort_order REAL DEFAULT 1000,
      is_draft INTEGER NOT NULL DEFAULT 0,
      external_source TEXT DEFAULT 'harness-sdd',
      external_id TEXT,
      user_story_as_a TEXT,
      user_story_i_want TEXT,
      user_story_so_that TEXT,
      acceptance_criteria TEXT,
      evidence_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (state_id) REFERENCES states(id),
      FOREIGN KEY (cycle_id) REFERENCES cycles(id),
      FOREIGN KEY (module_id) REFERENCES modules(id)
    );
  `);
  ensureColumn(db, 'issues', 'workspace_id', "TEXT NOT NULL DEFAULT 'ws-harness'");
  ensureColumn(db, 'issues', 'description_html', "TEXT DEFAULT ''");
  ensureColumn(db, 'issues', 'description_stripped', "TEXT DEFAULT ''");
  ensureColumn(db, 'issues', 'parent_id', 'TEXT');
  ensureColumn(db, 'issues', 'type_id', "TEXT DEFAULT 'type-feature'");
  ensureColumn(db, 'issues', 'point', 'INTEGER DEFAULT 3');
  ensureColumn(db, 'issues', 'estimate_point_id', "TEXT DEFAULT 'ep-3'");
  ensureColumn(db, 'issues', 'start_date', 'TEXT');
  ensureColumn(db, 'issues', 'target_date', 'TEXT');
  ensureColumn(db, 'issues', 'completed_at', 'DATETIME');
  ensureColumn(db, 'issues', 'sort_order', 'REAL DEFAULT 1000');
  ensureColumn(db, 'issues', 'is_draft', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'issues', 'external_source', "TEXT DEFAULT 'harness-sdd'");
  ensureColumn(db, 'issues', 'external_id', 'TEXT');

  // 13. Subtasks (Jira DEV & QA Subtasks)
  db.exec(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      assignee_role TEXT,
      status TEXT NOT NULL,
      sequence INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
  `);

  // 14. Issue Assignees (Plane IssueAssignee Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS issue_assignees (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      assignee_id TEXT NOT NULL,
      assignee_role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 15. Issue Labels (Plane IssueLabel Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS issue_labels (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      label_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
    );
  `);

  // 16. Issue Relations (Plane IssueRelation Model: blocks, blocked_by, relates_to, duplicate)
  db.exec(`
    CREATE TABLE IF NOT EXISTS issue_relations (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      related_issue_id TEXT NOT NULL,
      relation_type TEXT NOT NULL DEFAULT 'blocked_by',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY (related_issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
  `);

  // 17. Issue Activities (Plane IssueActivity Audit Trail Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS issue_activities (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      project_id TEXT NOT NULL DEFAULT 'proj-harness',
      workspace_id TEXT NOT NULL DEFAULT 'ws-harness',
      actor_id TEXT DEFAULT 'user-leader',
      actor_role TEXT DEFAULT 'leader',
      verb TEXT NOT NULL DEFAULT 'updated',
      field_name TEXT,
      old_value TEXT,
      new_value TEXT,
      old_identifier TEXT,
      new_identifier TEXT,
      comment_text TEXT DEFAULT '',
      epoch INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
  `);

  // 18. Issue Comments (Plane IssueComment Model for Agents & Skills)
  db.exec(`
    CREATE TABLE IF NOT EXISTS issue_comments (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      actor_id TEXT DEFAULT 'user-leader',
      actor_role TEXT NOT NULL DEFAULT 'leader',
      comment_stripped TEXT DEFAULT '',
      comment_html TEXT DEFAULT '',
      body_markdown TEXT NOT NULL,
      access TEXT NOT NULL DEFAULT 'INTERNAL',
      source_skill TEXT DEFAULT '',
      external_source TEXT DEFAULT 'harness-cli',
      external_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
  `);

  // 19. Issue Evidences / Attachments (Plane FileAsset + QA Verification Evidence)
  db.exec(`
    CREATE TABLE IF NOT EXISTS issue_evidences (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      subtask_id TEXT,
      type TEXT NOT NULL DEFAULT 'report',
      title TEXT NOT NULL,
      file_path TEXT NOT NULL,
      asset_url TEXT DEFAULT '',
      file_size INTEGER DEFAULT 0,
      report_markdown TEXT DEFAULT '',
      metrics_json TEXT DEFAULT '{}',
      created_by_skill TEXT DEFAULT 'verify-spec',
      is_uploaded INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
  `);

  // 20. CycleIssues Bridge (Plane CycleIssue Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS cycle_issues (
      id TEXT PRIMARY KEY,
      cycle_id TEXT NOT NULL,
      issue_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE CASCADE,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
  `);

  // 21. ModuleIssues Bridge (Plane ModuleIssue Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS module_issues (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL,
      issue_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
  `);

  // 22. Pages (Plane Page / Knowledge Base / Specs Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      workspace_id TEXT NOT NULL DEFAULT 'ws-harness',
      owned_by_id TEXT DEFAULT 'user-spec-author',
      owned_by_role TEXT DEFAULT 'spec-author',
      updated_by_id TEXT DEFAULT 'user-spec-author',
      module_id TEXT,
      file_path TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT,
      shelf TEXT NOT NULL,
      content_markdown TEXT NOT NULL,
      description_html TEXT DEFAULT '',
      description_stripped TEXT DEFAULT '',
      access INTEGER NOT NULL DEFAULT 0,
      is_locked INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      view_props TEXT DEFAULT '{"full_width":false}',
      logo_props TEXT DEFAULT '{"in_use":"icon","icon":{"name":"file-text","color":"#6366f1"}}',
      archived_at DATETIME,
      word_count INTEGER NOT NULL DEFAULT 0,
      char_count INTEGER NOT NULL DEFAULT 0,
      paragraph_count INTEGER NOT NULL DEFAULT 0,
      diagrams_count INTEGER NOT NULL DEFAULT 0,
      reading_time_min INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);
  ensureColumn(db, 'pages', 'workspace_id', "TEXT NOT NULL DEFAULT 'ws-harness'");
  ensureColumn(db, 'pages', 'owned_by_id', "TEXT DEFAULT 'user-spec-author'");
  ensureColumn(db, 'pages', 'owned_by_role', "TEXT DEFAULT 'spec-author'");
  ensureColumn(db, 'pages', 'updated_by_id', "TEXT DEFAULT 'user-spec-author'");
  ensureColumn(db, 'pages', 'module_id', 'TEXT');
  ensureColumn(db, 'pages', 'description_html', "TEXT DEFAULT ''");
  ensureColumn(db, 'pages', 'description_stripped', "TEXT DEFAULT ''");
  ensureColumn(db, 'pages', 'access', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'pages', 'is_locked', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'pages', 'is_favorite', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'pages', 'view_props', `TEXT DEFAULT '{"full_width":false}'`);
  ensureColumn(db, 'pages', 'logo_props', `TEXT DEFAULT '{"in_use":"icon","icon":{"name":"file-text","color":"#6366f1"}}'`);
  ensureColumn(db, 'pages', 'archived_at', 'DATETIME');
  ensureColumn(db, 'pages', 'word_count', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'pages', 'char_count', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'pages', 'paragraph_count', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'pages', 'diagrams_count', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'pages', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

  // 23. Page Versions (Plane PageVersion Historical Snapshot Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_versions (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      version_number INTEGER NOT NULL DEFAULT 1,
      content_markdown TEXT NOT NULL,
      description_html TEXT DEFAULT '',
      description_stripped TEXT DEFAULT '',
      owned_by_role TEXT DEFAULT 'spec-author',
      word_count INTEGER DEFAULT 0,
      last_saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    );
  `);

  // 24. Page Logs (Plane PageLog Model: Entity Mentions, Issues INT-XXX, Rules BR-*, Backlinks)
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_logs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL DEFAULT 'ws-harness',
      page_id TEXT NOT NULL,
      transaction_id TEXT NOT NULL,
      entity_identifier TEXT NOT NULL,
      entity_name TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    );
  `);

  // 25. Page Labels (Plane PageLabel Model: Knowledge Base Tagging)
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_labels (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL DEFAULT 'ws-harness',
      page_id TEXT NOT NULL,
      label_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
      FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
    );
  `);

  // 26. Issue Views (Plane IssueView Saved Filters & Layouts Model)
  db.exec(`
    CREATE TABLE IF NOT EXISTS issue_views (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      workspace_id TEXT NOT NULL DEFAULT 'ws-harness',
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      query_json TEXT DEFAULT '{}',
      filters_json TEXT DEFAULT '{}',
      display_filters_json TEXT DEFAULT '{}',
      display_properties_json TEXT DEFAULT '{}',
      access INTEGER NOT NULL DEFAULT 1,
      is_locked INTEGER NOT NULL DEFAULT 0,
      sort_order REAL DEFAULT 1000,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // 25. AI Configs (Plane InstanceConfig / LLMProvider Configuration)
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_configs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL DEFAULT 'ws-harness',
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'antigravity-gemini',
      model TEXT NOT NULL DEFAULT 'gemini-2.5-pro',
      category TEXT NOT NULL DEFAULT 'AI_ENGINE',
      is_encrypted INTEGER NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
  `);

  // 26. AI Runs & Skill Execution Log (Plane GPTIntegrationEndpoint + SDD Skill Execution Trace)
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_runs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL DEFAULT 'ws-harness',
      project_id TEXT NOT NULL DEFAULT 'proj-harness',
      issue_id TEXT,
      page_id TEXT,
      actor_id TEXT DEFAULT 'user-leader',
      agent_role TEXT NOT NULL DEFAULT 'leader',
      skill_name TEXT NOT NULL,
      task_type TEXT NOT NULL DEFAULT 'SDD_SKILL_EXECUTION',
      provider TEXT NOT NULL DEFAULT 'antigravity-gemini',
      model TEXT NOT NULL DEFAULT 'gemini-2.5-pro',
      prompt_summary TEXT NOT NULL,
      response_markdown TEXT DEFAULT '',
      artifacts_json TEXT DEFAULT '[]',
      tokens_used INTEGER DEFAULT 0,
      duration_ms INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}
