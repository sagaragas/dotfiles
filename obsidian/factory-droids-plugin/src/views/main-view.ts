import { ItemView, type WorkspaceLeaf, type EventRef } from "obsidian";
import type { FactoryStore } from "../store";
import type { FactoryDroidsSettings, FactoryItem } from "../types";
import { VIEW_TYPE } from "../types";
import { SidebarPanel } from "./sidebar";
import { ListPanel } from "./list";
import { DetailPanel } from "./detail";

export class FactoryDroidsView extends ItemView {
  private store: FactoryStore;
  private settings: FactoryDroidsSettings;
  private saveSettings: () => Promise<void>;

  private sidebarPanel!: SidebarPanel;
  private listPanel!: ListPanel;
  private detailPanel!: DetailPanel;

  private updateRef: EventRef | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    store: FactoryStore,
    settings: FactoryDroidsSettings,
    saveSettings: () => Promise<void>
  ) {
    super(leaf);
    this.store = store;
    this.settings = settings;
    this.saveSettings = saveSettings;
  }

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Factory Droids";
  }

  getIcon(): string {
    return "bot";
  }

  onOpen(): void {
    const container = this.contentEl;
    container.empty();
    container.addClass("fd-container");

    const sidebarEl = container.createDiv("fd-panel fd-panel-sidebar");
    const listEl = container.createDiv("fd-panel fd-panel-list");
    const detailEl = container.createDiv("fd-panel fd-panel-detail");

    this.sidebarPanel = new SidebarPanel(sidebarEl, this.store);
    this.listPanel = new ListPanel(listEl, this.store, (item) => this.onSelectItem(item));
    this.detailPanel = new DetailPanel(detailEl, this.store, this.settings, this.saveSettings, this.app);

    this.updateRef = this.store.on("updated", () => this.renderAll());
    this.renderAll();
  }

  onClose(): void {
    if (this.updateRef) {
      this.store.offref(this.updateRef);
    }
  }

  private renderAll(): void {
    this.sidebarPanel.render();
    this.listPanel.render();
    this.detailPanel.render();
  }

  private onSelectItem(item: FactoryItem): void {
    this.listPanel.setSelectedId(item.id);
    this.listPanel.render();
    this.detailPanel.showItem(item);
  }
}
