import { setIcon } from "obsidian";
import type { FactoryStore } from "../store";
import type { SidebarFilter, FactoryItemType } from "../types";
import { TYPE_META } from "../types";

export class SidebarPanel {
  private containerEl: HTMLElement;
  private store: FactoryStore;

  constructor(containerEl: HTMLElement, store: FactoryStore) {
    this.containerEl = containerEl;
    this.store = store;
  }

  render(): void {
    this.containerEl.empty();

    const header = this.containerEl.createDiv("fd-sidebar-header");
    const titleRow = header.createDiv("fd-sidebar-title-row");
    const iconEl = titleRow.createSpan("fd-sidebar-logo");
    setIcon(iconEl, "factory");
    titleRow.createSpan({ cls: "fd-sidebar-title", text: "Factory" });

    const section = this.containerEl.createDiv("fd-sidebar-section");
    section.createDiv({ cls: "fd-sidebar-section-label", text: "Library" });

    this.renderItem(section, "All", "layers", { kind: "all" });
    this.renderItem(section, "Favorites", "star", { kind: "favorites" });

    const typesSection = this.containerEl.createDiv("fd-sidebar-section");
    typesSection.createDiv({ cls: "fd-sidebar-section-label", text: "Types" });

    const counts = this.store.typeCounts;
    for (const [type, meta] of Object.entries(TYPE_META)) {
      const count = counts[type] ?? 0;
      this.renderItem(
        typesSection,
        `${meta.label} (${count})`,
        meta.icon,
        { kind: "type", type: type as FactoryItemType }
      );
    }
  }

  private renderItem(parent: HTMLElement, label: string, icon: string, filter: SidebarFilter): void {
    const item = parent.createDiv("fd-sidebar-item");
    if (this.isActive(filter)) item.addClass("is-active");

    const iconEl = item.createSpan("fd-sidebar-item-icon");
    setIcon(iconEl, icon);
    item.createSpan({ cls: "fd-sidebar-item-label", text: label });

    item.addEventListener("click", () => {
      this.store.setFilter(filter);
    });
  }

  private isActive(filter: SidebarFilter): boolean {
    const current = this.store.filter;
    if (current.kind !== filter.kind) return false;
    if (current.kind === "type" && filter.kind === "type") return current.type === filter.type;
    return true;
  }
}
