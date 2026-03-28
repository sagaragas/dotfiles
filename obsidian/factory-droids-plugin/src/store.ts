import { Events } from "obsidian";
import { scanAll } from "./scanner";
import type { FactoryItem, FactoryDroidsSettings, SidebarFilter } from "./types";

export class FactoryStore extends Events {
  private items: Map<string, FactoryItem> = new Map();
  private _filter: SidebarFilter = { kind: "all" };
  private _searchQuery = "";

  get allItems(): FactoryItem[] {
    return Array.from(this.items.values());
  }

  get filter(): SidebarFilter {
    return this._filter;
  }

  get searchQuery(): string {
    return this._searchQuery;
  }

  get filteredItems(): FactoryItem[] {
    let arr = this.allItems;

    if (this._filter.kind === "favorites") {
      arr = arr.filter((i) => i.isFavorite);
    } else if (this._filter.kind === "type") {
      arr = arr.filter((i) => i.type === this._filter.type);
    }

    if (this._searchQuery) {
      const q = this._searchQuery.toLowerCase();
      arr = arr.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q)
      );
    }

    return arr.sort((a, b) => a.name.localeCompare(b.name));
  }

  get typeCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of this.items.values()) {
      counts[item.type] = (counts[item.type] ?? 0) + 1;
    }
    return counts;
  }

  refresh(settings: FactoryDroidsSettings): void {
    this.items = scanAll(settings);
    this.trigger("updated");
  }

  setFilter(filter: SidebarFilter): void {
    this._filter = filter;
    this.trigger("updated");
  }

  setSearch(query: string): void {
    this._searchQuery = query;
    this.trigger("updated");
  }

  toggleFavorite(id: string, settings: FactoryDroidsSettings): boolean {
    const item = this.items.get(id);
    if (!item) return false;
    item.isFavorite = !item.isFavorite;
    if (item.isFavorite) {
      if (!settings.favorites.includes(id)) settings.favorites.push(id);
    } else {
      settings.favorites = settings.favorites.filter((f) => f !== id);
    }
    this.trigger("updated");
    return item.isFavorite;
  }

  getItem(id: string): FactoryItem | undefined {
    return this.items.get(id);
  }
}
