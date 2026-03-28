import { readFileSync, readdirSync, statSync, existsSync, realpathSync } from "fs";
import { join, basename, extname, relative } from "path";
import { homedir } from "os";
import { createHash } from "crypto";
import { parseYaml } from "obsidian";
import type { FactoryItem, FactoryItemType, FactoryDroidsSettings } from "./types";

const HOME = homedir();
const IGNORED = new Set(["readme.md", "license", "license.md", ".ds_store", "thumbs.db", ".index.json"]);

function makeId(realPath: string): string {
  return createHash("sha256").update(realPath).digest("hex").slice(0, 12);
}

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  try {
    const fm = parseYaml(match[1]) as Record<string, unknown>;
    return { frontmatter: fm ?? {}, body: match[2] };
  } catch {
    /* empty */
    return { frontmatter: {}, body: content };
  }
}

function extractName(fm: Record<string, unknown>, body: string, filePath: string): string {
  if (typeof fm.name === "string" && fm.name.trim()) return fm.name.trim();
  const headingMatch = body.match(/^#\s+(.+)/m);
  if (headingMatch) return headingMatch[1].trim();
  return basename(filePath, extname(filePath));
}

function extractDescription(fm: Record<string, unknown>, body: string): string {
  if (typeof fm.description === "string") return fm.description.trim();
  const lines = body.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  return lines[0]?.trim().slice(0, 120) ?? "";
}

function addItem(result: Map<string, FactoryItem>, item: FactoryItem): void {
  if (!result.has(item.id)) result.set(item.id, item);
}

// Scan flat .md/.mdc files in a directory
function scanMdFiles(
  dir: string, type: FactoryItemType, settings: FactoryDroidsSettings,
  extra?: Partial<FactoryItem>
): FactoryItem[] {
  if (!existsSync(dir)) return [];
  const items: FactoryItem[] = [];
  let entries: string[];
  try { entries = readdirSync(dir); } catch { /* empty */ return []; }

  for (const entry of entries) {
    if (IGNORED.has(entry.toLowerCase())) continue;
    const filePath = join(dir, entry);
    let stat;
    try { stat = statSync(filePath); } catch { /* empty */ continue; }

    if (stat.isFile() && (entry.endsWith(".md") || entry.endsWith(".mdc"))) {
      try {
        const content = readFileSync(filePath, "utf-8");
        const realPath = realpathSync(filePath);
        const { frontmatter, body } = parseFrontmatter(content);
        items.push({
          id: makeId(realPath),
          name: extractName(frontmatter, body, filePath),
          description: extractDescription(frontmatter, body),
          type,
          filePath,
          realPath,
          content,
          frontmatter,
          lastModified: stat.mtimeMs,
          fileSize: stat.size,
          isFavorite: settings.favorites.includes(makeId(realPath)),
          model: typeof frontmatter.model === "string" ? frontmatter.model : undefined,
          ...extra,
        });
      } catch { /* empty */ }
    }
  }
  return items;
}

// Scan skills structured as subdirs with SKILL.md (+ companion .md files)
function scanSkillDirs(
  dir: string, settings: FactoryDroidsSettings, parentPlugin?: string
): FactoryItem[] {
  if (!existsSync(dir)) return [];
  const items: FactoryItem[] = [];
  let entries: string[];
  try { entries = readdirSync(dir); } catch { /* empty */ return []; }

  for (const entry of entries) {
    const skillDir = join(dir, entry);
    let stat;
    try { stat = statSync(skillDir); } catch { /* empty */ continue; }
    if (!stat.isDirectory()) continue;

    const skillFile = join(skillDir, "SKILL.md");
    if (!existsSync(skillFile)) continue;

    try {
      const content = readFileSync(skillFile, "utf-8");
      const realPath = realpathSync(skillFile);
      const { frontmatter, body } = parseFrontmatter(content);
      const id = makeId(realPath);

      // Gather companion files
      let companions: string[] = [];
      try {
        companions = readdirSync(skillDir)
          .filter((f) => f !== "SKILL.md" && f.endsWith(".md"));
      } catch { /* empty */ }

      items.push({
        id,
        name: extractName(frontmatter, body, skillFile),
        description: extractDescription(frontmatter, body),
        type: "skill",
        filePath: skillFile,
        realPath,
        content,
        frontmatter: {
          ...frontmatter,
          ...(companions.length > 0 ? { companions } : {}),
          ...(parentPlugin ? { plugin: parentPlugin } : {}),
        },
        lastModified: stat.mtimeMs,
        fileSize: stat.size,
        isFavorite: settings.favorites.includes(id),
        model: typeof frontmatter.model === "string" ? frontmatter.model : undefined,
        parentPlugin,
      });
    } catch { /* empty */ }
  }
  return items;
}

// Scan missions (subdirs with mission.md + state.json)
function scanMissions(dir: string, settings: FactoryDroidsSettings): FactoryItem[] {
  if (!existsSync(dir)) return [];
  const items: FactoryItem[] = [];
  let entries: string[];
  try { entries = readdirSync(dir); } catch { /* empty */ return []; }

  for (const entry of entries) {
    const missionDir = join(dir, entry);
    const missionFile = join(missionDir, "mission.md");
    if (!existsSync(missionFile)) continue;

    try {
      const stat = statSync(missionFile);
      const content = readFileSync(missionFile, "utf-8");
      const realPath = realpathSync(missionFile);
      const { frontmatter, body } = parseFrontmatter(content);
      const id = makeId(realPath);

      const stateFile = join(missionDir, "state.json");
      let state: Record<string, unknown> = {};
      if (existsSync(stateFile)) {
        try { state = JSON.parse(readFileSync(stateFile, "utf-8")) as Record<string, unknown>; }
        catch { /* empty */ }
      }

      // List mission artifacts
      let artifacts: string[] = [];
      try { artifacts = readdirSync(missionDir).filter((f) => f !== "mission.md"); }
      catch { /* empty */ }

      items.push({
        id,
        name: extractName(frontmatter, body, missionFile),
        description: extractDescription(frontmatter, body),
        type: "mission",
        filePath: missionFile,
        realPath,
        content,
        frontmatter: { ...frontmatter, ...state, artifacts },
        lastModified: stat.mtimeMs,
        fileSize: stat.size,
        isFavorite: settings.favorites.includes(id),
      });
    } catch { /* empty */ }
  }
  return items;
}

// Scan installed plugins from installed_plugins.json
function scanPlugins(factoryDir: string, settings: FactoryDroidsSettings): FactoryItem[] {
  const items: FactoryItem[] = [];
  const installedPath = join(factoryDir, "plugins", "installed_plugins.json");
  if (!existsSync(installedPath)) return [];

  try {
    const raw = JSON.parse(readFileSync(installedPath, "utf-8")) as {
      plugins: Record<string, Array<{ scope: string; installPath: string; version: string; source: string }>>;
    };

    for (const [pluginId, installs] of Object.entries(raw.plugins)) {
      const install = installs[0];
      if (!install) continue;

      const id = makeId(pluginId);
      const name = pluginId.split("@")[0];
      const source = pluginId.split("@")[1] ?? "unknown";

      items.push({
        id,
        name,
        description: `Source: ${source} | Version: ${install.version}`,
        type: "plugin",
        filePath: installedPath,
        realPath: installedPath,
        content: JSON.stringify(install, null, 2),
        frontmatter: {
          pluginId,
          scope: install.scope,
          version: install.version,
          source: install.source,
          installPath: install.installPath,
        },
        lastModified: statSync(installedPath).mtimeMs,
        fileSize: 0,
        isFavorite: settings.favorites.includes(id),
      });

      // Also scan this plugin's skills
      const skillsDir = join(install.installPath, "skills");
      const pluginSkills = scanSkillDirs(skillsDir, settings, name);
      for (const skill of pluginSkills) items.push(skill);
    }
  } catch { /* empty */ }

  return items;
}

// Scan MCP servers from mcp.json
function scanMcpServers(factoryDir: string, settings: FactoryDroidsSettings): FactoryItem[] {
  const items: FactoryItem[] = [];
  const mcpPath = join(factoryDir, "mcp.json");
  if (!existsSync(mcpPath)) return [];

  try {
    const raw = JSON.parse(readFileSync(mcpPath, "utf-8")) as {
      mcpServers: Record<string, { type: string; command: string; args?: string[]; disabled?: boolean; note?: string }>;
    };

    for (const [name, config] of Object.entries(raw.mcpServers)) {
      const id = makeId(`mcp:${name}`);
      const cmdLine = [config.command, ...(config.args ?? [])].join(" ");

      items.push({
        id,
        name,
        description: `${config.type} | ${cmdLine}${config.disabled ? " (disabled)" : ""}`,
        type: "mcp",
        filePath: mcpPath,
        realPath: mcpPath,
        content: JSON.stringify(config, null, 2),
        frontmatter: {
          type: config.type,
          command: config.command,
          args: config.args,
          disabled: config.disabled ?? false,
          ...(config.note ? { note: config.note } : {}),
        },
        lastModified: statSync(mcpPath).mtimeMs,
        fileSize: 0,
        isFavorite: settings.favorites.includes(id),
      });
    }
  } catch { /* empty */ }

  return items;
}

// Scan tools (e.g., agent-browser)
function scanTools(factoryDir: string, settings: FactoryDroidsSettings): FactoryItem[] {
  const toolsDir = join(factoryDir, "tools");
  if (!existsSync(toolsDir)) return [];
  const items: FactoryItem[] = [];

  let entries: string[];
  try { entries = readdirSync(toolsDir); } catch { /* empty */ return []; }

  for (const entry of entries) {
    const toolDir = join(toolsDir, entry);
    let stat;
    try { stat = statSync(toolDir); } catch { /* empty */ continue; }
    if (!stat.isDirectory()) continue;

    const id = makeId(`tool:${entry}`);
    let toolFiles: string[] = [];
    try { toolFiles = readdirSync(toolDir); } catch { /* empty */ }

    items.push({
      id,
      name: entry,
      description: `Tool: ${entry} | ${toolFiles.length} files`,
      type: "tool",
      filePath: toolDir,
      realPath: toolDir,
      content: `Tool: ${entry}\nContents: ${toolFiles.join(", ")}`,
      frontmatter: { files: toolFiles },
      lastModified: stat.mtimeMs,
      fileSize: 0,
      isFavorite: settings.favorites.includes(id),
    });
  }
  return items;
}

// Scan session directories (project-scoped sessions in subdirs)
function scanSessions(factoryDir: string, settings: FactoryDroidsSettings): FactoryItem[] {
  const sessionsDir = join(factoryDir, "sessions");
  if (!existsSync(sessionsDir)) return [];
  const items: FactoryItem[] = [];

  let entries: string[];
  try { entries = readdirSync(sessionsDir); } catch { /* empty */ return []; }

  // Session dirs are named like "-Users-ragas-code-website"
  for (const entry of entries) {
    if (entry.startsWith(".") || entry.endsWith(".json") || entry.endsWith(".jsonl")) continue;
    const sessionDir = join(sessionsDir, entry);
    let stat;
    try { stat = statSync(sessionDir); } catch { /* empty */ continue; }
    if (!stat.isDirectory()) continue;

    // Count sessions inside
    let sessionFiles: string[] = [];
    try { sessionFiles = readdirSync(sessionDir).filter((f) => f.endsWith(".jsonl")); }
    catch { /* empty */ }

    const projectPath = entry.replace(/-/g, "/");
    const id = makeId(`session-project:${entry}`);

    items.push({
      id,
      name: basename(projectPath) || entry,
      description: `${sessionFiles.length} sessions | ${projectPath}`,
      type: "session",
      filePath: sessionDir,
      realPath: sessionDir,
      content: `Project: ${projectPath}\nSessions: ${sessionFiles.length}`,
      frontmatter: {
        projectPath,
        sessionCount: sessionFiles.length,
      },
      lastModified: stat.mtimeMs,
      fileSize: 0,
      isFavorite: settings.favorites.includes(id),
    });
  }

  return items;
}

// Scan snapshots
function scanSnapshots(factoryDir: string, settings: FactoryDroidsSettings): FactoryItem[] {
  const snapshotsDir = join(factoryDir, "snapshots", "manifests");
  if (!existsSync(snapshotsDir)) return [];
  const items: FactoryItem[] = [];

  let entries: string[];
  try { entries = readdirSync(snapshotsDir); } catch { /* empty */ return []; }

  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    const filePath = join(snapshotsDir, entry);
    try {
      const stat = statSync(filePath);
      const content = readFileSync(filePath, "utf-8");
      const realPath = realpathSync(filePath);
      const id = makeId(realPath);
      let parsed: Record<string, unknown> = {};
      try { parsed = JSON.parse(content) as Record<string, unknown>; } catch { /* empty */ }

      items.push({
        id,
        name: basename(entry, ".json"),
        description: `Snapshot manifest`,
        type: "snapshot",
        filePath,
        realPath,
        content,
        frontmatter: parsed,
        lastModified: stat.mtimeMs,
        fileSize: stat.size,
        isFavorite: settings.favorites.includes(id),
      });
    } catch { /* empty */ }
  }
  return items;
}

export function scanAll(settings: FactoryDroidsSettings): Map<string, FactoryItem> {
  const factoryDir = settings.factoryDir || join(HOME, ".factory");
  const result = new Map<string, FactoryItem>();

  // Droids
  for (const item of scanMdFiles(join(factoryDir, "droids"), "droid", settings)) addItem(result, item);

  // Specs
  for (const item of scanMdFiles(join(factoryDir, "specs"), "spec", settings)) addItem(result, item);

  // Missions
  for (const item of scanMissions(join(factoryDir, "missions"), settings)) addItem(result, item);

  // Plugins + their skills
  for (const item of scanPlugins(factoryDir, settings)) addItem(result, item);

  // MCP servers
  for (const item of scanMcpServers(factoryDir, settings)) addItem(result, item);

  // Tools
  for (const item of scanTools(factoryDir, settings)) addItem(result, item);

  // Sessions (project-scoped)
  for (const item of scanSessions(factoryDir, settings)) addItem(result, item);

  // Snapshots
  for (const item of scanSnapshots(factoryDir, settings)) addItem(result, item);

  return result;
}

export function getWatchPaths(settings: FactoryDroidsSettings): string[] {
  const factoryDir = settings.factoryDir || join(HOME, ".factory");
  return [
    join(factoryDir, "droids"),
    join(factoryDir, "specs"),
    join(factoryDir, "missions"),
    join(factoryDir, "plugins"),
    join(factoryDir, "tools"),
    join(factoryDir, "mcp.json"),
  ].filter((p) => existsSync(p));
}
