import { setIcon } from "obsidian";
import type { FactoryStore } from "../store";
import type { FactoryItem } from "../types";
import { TYPE_META } from "../types";

export class ListPanel {
  private containerEl: HTMLElement;
  private store: FactoryStore;
  private onSelect: (item: FactoryItem) => void;
  private selectedId: string | null = null;

  constructor(containerEl: HTMLElement, store: FactoryStore, onSelect: (item: FactoryItem) => void) {
    this.containerEl = containerEl;
    this.store = store;
    this.onSelect = onSelect;
  }

  setSelectedId(id: string | null): void {
    this.selectedId = id;
  }

  render(): void {
    this.containerEl.empty();

    const searchBar = this.containerEl.createDiv("fd-search-bar");
    const searchIcon = searchBar.createSpan("fd-search-icon");
    setIcon(searchIcon, "search");
    const input = searchBar.createEl("input", {
      type: "text",
      placeholder: "Search droids, specs, missions...",
      cls: "fd-search-input",
    });
    input.value = this.store.searchQuery;
    input.addEventListener("input", () => {
      this.store.setSearch(input.value);
    });

    const items = this.store.filteredItems;
    const listContainer = this.containerEl.createDiv("fd-list-container");

    if (items.length === 0) {
      const empty = listContainer.createDiv("fd-list-empty");
      empty.createDiv({ cls: "fd-list-empty-text", text: "No items found" });
      return;
    }

    for (const item of items) {
      this.renderCard(listContainer, item);
    }
  }

  private renderCard(parent: HTMLElement, item: FactoryItem): void {
    const card = parent.createDiv("fd-card");
    if (item.id === this.selectedId) card.addClass("is-selected");

    const top = card.createDiv("fd-card-top");
    const nameEl = top.createSpan({ cls: "fd-card-name", text: item.name });

    if (item.isFavorite) {
      const starEl = nameEl.createSpan("fd-card-star");
      setIcon(starEl, "star");
    }

    const meta = TYPE_META[item.type];
    const badge = top.createSpan("fd-card-type-badge");
    badge.style.setProperty("--badge-color", meta.color);
    badge.textContent = meta.label.replace(/s$/, "");

    if (item.description) {
      const desc = item.description.length > 80
        ? item.description.slice(0, 80) + "..."
        : item.description;
      card.createDiv({ cls: "fd-card-desc", text: desc });
    }

    const bottomRow = card.createDiv("fd-card-bottom");
    const sizeText = item.fileSize < 1024
      ? `${item.fileSize} B`
      : `${(item.fileSize / 1024).toFixed(1)} KB`;
    bottomRow.createSpan({ cls: "fd-card-meta", text: sizeText });

    if (item.model) {
      bottomRow.createSpan({ cls: "fd-card-meta", text: item.model });
    }

    const date = new Date(item.lastModified);
    bottomRow.createSpan({ cls: "fd-card-meta", text: date.toLocaleDateString() });

    card.addEventListener("click", () => {
      this.selectedId = item.id;
      this.onSelect(item);
    });
  }
}
