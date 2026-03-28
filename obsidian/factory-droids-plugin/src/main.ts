import { Plugin } from "obsidian";
import { FactoryStore } from "./store";
import { FactoryWatcher } from "./watcher";
import { FactoryDroidsView } from "./views/main-view";
import { FactoryDroidsSettingTab } from "./settings";
import { getWatchPaths } from "./scanner";
import { VIEW_TYPE, DEFAULT_SETTINGS } from "./types";
import type { FactoryDroidsSettings } from "./types";

export default class FactoryDroidsPlugin extends Plugin {
  settings!: FactoryDroidsSettings;
  store = new FactoryStore();
  watcher: FactoryWatcher | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(VIEW_TYPE, (leaf) =>
      new FactoryDroidsView(leaf, this.store, this.settings, () => this.saveSettings())
    );

    this.addRibbonIcon("bot", "Factory Droids", () => {
      void this.activateView();
    });

    this.addCommand({
      id: "open",
      name: "Open",
      callback: () => {
        void this.activateView();
      },
    });

    this.addSettingTab(
      new FactoryDroidsSettingTab(
        this.app,
        this,
        this.settings,
        () => this.saveSettings(),
        () => this.refreshStore()
      )
    );

    this.refreshStore();
    this.startWatcher();
  }

  onunload(): void {
    this.stopWatcher();
  }

  private async activateView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    this.app.workspace.revealLeaf(leaf);
  }

  private refreshStore(): void {
    this.store.refresh(this.settings);
    this.startWatcher();
  }

  private startWatcher(): void {
    this.stopWatcher();
    if (!this.settings.watchEnabled) return;
    this.watcher = new FactoryWatcher(this.settings.watchDebounceMs, () => {
      this.store.refresh(this.settings);
    });
    this.watcher.watchPaths(getWatchPaths(this.settings));
  }

  private stopWatcher(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  private async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  private async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
