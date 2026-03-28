import { PluginSettingTab, Setting, type App } from "obsidian";
import type { FactoryDroidsSettings } from "./types";

export class FactoryDroidsSettingTab extends PluginSettingTab {
  private settings: FactoryDroidsSettings;
  private saveSettings: () => Promise<void>;
  private onSettingsChange: () => void;

  constructor(
    app: App,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin: any,
    settings: FactoryDroidsSettings,
    saveSettings: () => Promise<void>,
    onSettingsChange: () => void
  ) {
    super(app, plugin);
    this.settings = settings;
    this.saveSettings = saveSettings;
    this.onSettingsChange = onSettingsChange;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Factory Droids" });

    new Setting(containerEl)
      .setName("File watching")
      .setDesc("Automatically detect changes to Factory files")
      .addToggle((toggle) =>
        toggle.setValue(this.settings.watchEnabled).onChange(async (value) => {
          this.settings.watchEnabled = value;
          await this.saveSettings();
          this.onSettingsChange();
        })
      );

    new Setting(containerEl)
      .setName("Watch debounce (ms)")
      .setDesc("Delay before rescanning after file changes")
      .addText((text) =>
        text.setValue(String(this.settings.watchDebounceMs)).onChange(async (value) => {
          const num = parseInt(value, 10);
          if (!isNaN(num) && num >= 100) {
            this.settings.watchDebounceMs = num;
            await this.saveSettings();
            this.onSettingsChange();
          }
        })
      );

    new Setting(containerEl)
      .setName("Factory directory")
      .setDesc("Override the default ~/.factory directory path")
      .addText((text) =>
        text
          .setPlaceholder("~/.factory")
          .setValue(this.settings.factoryDir)
          .onChange(async (value) => {
            this.settings.factoryDir = value;
            await this.saveSettings();
            this.onSettingsChange();
          })
      );
  }
}
