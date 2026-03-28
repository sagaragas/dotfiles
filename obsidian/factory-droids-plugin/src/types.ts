export type FactoryItemType = "droid" | "skill" | "spec" | "mission" | "plugin" | "mcp" | "tool" | "session" | "snapshot";

export interface FactoryItem {
  id: string;
  name: string;
  description: string;
  type: FactoryItemType;
  filePath: string;
  realPath: string;
  content: string;
  frontmatter: Record<string, unknown>;
  lastModified: number;
  fileSize: number;
  isFavorite: boolean;
  model?: string;
  parentPlugin?: string;
}

export type SidebarFilter =
  | { kind: "all" }
  | { kind: "favorites" }
  | { kind: "type"; type: FactoryItemType };

export interface FactoryDroidsSettings {
  watchEnabled: boolean;
  watchDebounceMs: number;
  favorites: string[];
  factoryDir: string;
}

export const DEFAULT_SETTINGS: FactoryDroidsSettings = {
  watchEnabled: true,
  watchDebounceMs: 500,
  favorites: [],
  factoryDir: "",
};

export const VIEW_TYPE = "factory-droids-view";

export const TYPE_META: Record<FactoryItemType, { label: string; icon: string; color: string }> = {
  droid: { label: "Droids", icon: "bot", color: "#8b5cf6" },
  skill: { label: "Skills", icon: "zap", color: "#eab308" },
  spec: { label: "Specs", icon: "file-text", color: "#3b82f6" },
  mission: { label: "Missions", icon: "target", color: "#f97316" },
  plugin: { label: "Plugins", icon: "plug", color: "#ec4899" },
  mcp: { label: "MCP Servers", icon: "server", color: "#06b6d4" },
  tool: { label: "Tools", icon: "wrench", color: "#84cc16" },
  session: { label: "Sessions", icon: "message-circle", color: "#10b981" },
  snapshot: { label: "Snapshots", icon: "camera", color: "#a855f7" },
};
