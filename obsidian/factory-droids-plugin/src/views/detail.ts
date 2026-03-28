import { MarkdownRenderer, setIcon, Notice } from "obsidian";
import { writeFileSync } from "fs";
import type { FactoryItem, FactoryDroidsSettings } from "../types";
import type { FactoryStore } from "../store";
import { TYPE_META } from "../types";
import type { App } from "obsidian";

export class DetailPanel {
  private containerEl: HTMLElement;
  private store: FactoryStore;
  private settings: FactoryDroidsSettings;
  private saveSettings: () => Promise<void>;
  private app: App;
  private currentItem: FactoryItem | null = null;
  private editing = false;

  constructor(
    containerEl: HTMLElement,
    store: FactoryStore,
    settings: FactoryDroidsSettings,
    saveSettings: () => Promise<void>,
    app: App
  ) {
    this.containerEl = containerEl;
    this.store = store;
    this.settings = settings;
    this.saveSettings = saveSettings;
    this.app = app;
  }

  showItem(item: FactoryItem): void {
    this.currentItem = item;
    this.editing = false;
    this.render();
  }

  render(): void {
    this.containerEl.empty();

    if (!this.currentItem) {
      const empty = this.containerEl.createDiv("fd-detail-empty");
      const iconEl = empty.createDiv("fd-detail-empty-icon");
      setIcon(iconEl, "factory");
      empty.createDiv({ cls: "fd-detail-empty-text", text: "Select an item to view details" });
      return;
    }

    const item = this.currentItem;
    this.renderToolbar(item);

    if (this.editing) {
      this.renderEditor(item);
    } else {
      this.renderPreview(item);
    }
  }

  private renderToolbar(item: FactoryItem): void {
    const toolbar = this.containerEl.createDiv("fd-detail-toolbar");

    const titleRow = toolbar.createDiv("fd-detail-title-row");
    const meta = TYPE_META[item.type];
    const typeIcon = titleRow.createSpan("fd-detail-type-icon");
    typeIcon.style.color = meta.color;
    setIcon(typeIcon, meta.icon);
    titleRow.createSpan({ cls: "fd-detail-title", text: item.name });

    const actions = titleRow.createDiv("fd-detail-actions");

    const favBtn = actions.createEl("button", { cls: "fd-detail-btn" });
    setIcon(favBtn, item.isFavorite ? "star" : "star");
    if (item.isFavorite) favBtn.addClass("is-favorited");
    favBtn.title = item.isFavorite ? "Remove from favorites" : "Add to favorites";
    favBtn.addEventListener("click", () => {
      this.store.toggleFavorite(item.id, this.settings);
      void this.saveSettings();
      this.render();
    });

    if (item.type === "droid" || item.type === "spec") {
      const editBtn = actions.createEl("button", { cls: "fd-detail-btn" });
      setIcon(editBtn, this.editing ? "eye" : "pencil");
      editBtn.title = this.editing ? "Preview" : "Edit";
      editBtn.addEventListener("click", () => {
        this.editing = !this.editing;
        this.render();
      });
    }

    const openBtn = actions.createEl("button", { cls: "fd-detail-btn" });
    setIcon(openBtn, "folder-open");
    openBtn.title = "Show in Finder";
    openBtn.addEventListener("click", () => {
      const { shell } = require("electron") as typeof import("electron");
      shell.showItemInFolder(item.filePath);
    });

    const metaBar = toolbar.createDiv("fd-detail-meta-bar");
    const sizeText = item.fileSize < 1024
      ? `${item.fileSize} B`
      : `${(item.fileSize / 1024).toFixed(1)} KB`;
    metaBar.createSpan({ cls: "fd-detail-meta-item", text: sizeText });

    const chars = item.content.length;
    const tokens = Math.ceil(chars / 4);
    metaBar.createSpan({ cls: "fd-detail-meta-item", text: `${chars.toLocaleString()} chars` });
    metaBar.createSpan({ cls: "fd-detail-meta-item", text: `~${tokens.toLocaleString()} tokens` });

    const date = new Date(item.lastModified);
    metaBar.createSpan({ cls: "fd-detail-meta-item", text: date.toLocaleString() });

    if (item.model) {
      metaBar.createSpan({ cls: "fd-detail-meta-item fd-model-badge", text: item.model });
    }
  }

  private renderPreview(item: FactoryItem): void {
    const previewEl = this.containerEl.createDiv("fd-detail-preview");

    if (Object.keys(item.frontmatter).length > 0) {
      const fmEl = previewEl.createDiv("fd-detail-frontmatter");
      fmEl.createDiv({ cls: "fd-detail-fm-header", text: "Properties" });
      const table = fmEl.createEl("table", { cls: "fd-detail-fm-table" });
      for (const [key, value] of Object.entries(item.frontmatter)) {
        const row = table.createEl("tr");
        row.createEl("td", { cls: "fd-detail-fm-key", text: key });
        const valStr = typeof value === "string" ? value : JSON.stringify(value);
        row.createEl("td", { cls: "fd-detail-fm-val", text: valStr });
      }
    }

    const contentEl = previewEl.createDiv("fd-detail-content");
    const bodyContent = item.content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
    void MarkdownRenderer.render(this.app, bodyContent, contentEl, item.filePath, this.app.workspace.activeLeaf!);
  }

  private renderEditor(item: FactoryItem): void {
    const editorEl = this.containerEl.createDiv("fd-detail-editor");
    const textarea = editorEl.createEl("textarea", { cls: "fd-detail-textarea" });
    textarea.value = item.content;
    textarea.spellcheck = false;

    textarea.addEventListener("keydown", (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        this.saveFile(item, textarea.value);
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.slice(0, start) + "  " + textarea.value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }
    });

    const saveBar = editorEl.createDiv("fd-detail-save-bar");
    const saveBtn = saveBar.createEl("button", { cls: "fd-detail-save-btn", text: "Save" });
    saveBtn.addEventListener("click", () => {
      this.saveFile(item, textarea.value);
    });
    saveBar.createSpan({ cls: "fd-detail-save-hint", text: "Cmd+S to save" });
  }

  private saveFile(item: FactoryItem, content: string): void {
    try {
      writeFileSync(item.filePath, content, "utf-8");
      item.content = content;
      new Notice(`Saved ${item.name}`);
    } catch (err) {
      new Notice(`Failed to save: ${String(err)}`);
    }
  }
}
