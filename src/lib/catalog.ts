import { fold } from "@/lib/format";
import { TYPE_LABEL, TYPE_ORDER } from "@/lib/wine-labels";
import { wineTags, type TypeTag, type Wine } from "@/data/wines";
import { isTasted, wineHaystack, type TastingNote } from "@/lib/tasting";

export type ViewMode = "all" | "untasted" | "notes";

export type GroupMode = "site" | "country" | "type" | "shop" | "grape";

export type Filters = {
  query: string;
  tags: TypeTag[];
  countries: string[];
  shops: string[];
  view: ViewMode;
  group: GroupMode;
};

export const EMPTY_FILTERS: Filters = {
  query: "",
  tags: [],
  countries: [],
  shops: [],
  view: "all",
  group: "site",
};

export type WineGroup = {
  id: string;
  title: string;
  wines: Wine[];
};

function grapeNames(wine: Wine): string[] {
  if (!wine.grape) return [];
  return wine.grape
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function includesAny(selected: string[], value: string): boolean {
  return selected.length === 0 || selected.includes(value);
}

export function wineMatches(
  wine: Wine,
  filters: Filters,
  notes: Record<string, TastingNote>,
): boolean {
  const tasted = isTasted(notes[wine.id]);
  if (filters.view === "untasted" && tasted) return false;
  if (filters.view === "notes" && !tasted) return false;

  const tokens = fold(filters.query).split(/\s+/).filter(Boolean);
  if (tokens.length > 0) {
    const haystack = wineHaystack(wine);
    if (!tokens.every((token) => haystack.includes(token))) return false;
  }

  if (filters.tags.length > 0) {
    const tags = wineTags(wine);
    if (!filters.tags.some((tag) => tags.includes(tag))) return false;
  }

  if (!includesAny(filters.countries, wine.country)) return false;
  if (!includesAny(filters.shops, wine.shop)) return false;
  return true;
}

export function groupWines(list: Wine[], mode: GroupMode): WineGroup[] {
  if (mode === "site") {
    return [{ id: "site", title: "Redosled sa sajta", wines: list }];
  }

  if (mode === "type") {
    return TYPE_ORDER.map((tag) => ({
      id: tag,
      title: TYPE_LABEL[tag],
      wines: list.filter((wine) => wineTags(wine).includes(tag)),
    })).filter((group) => group.wines.length > 0);
  }

  if (mode === "grape") {
    const buckets = new Map<string, Wine[]>();
    for (const wine of list) {
      for (const grape of grapeNames(wine)) {
        const current = buckets.get(grape);
        if (current) current.push(wine);
        else buckets.set(grape, [wine]);
      }
    }
    return [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "sr"))
      .map(([title, items]) => ({ id: title, title, wines: items }));
  }

  const keyOf = mode === "country" ? (wine: Wine) => wine.country : (wine: Wine) => wine.shop;
  const buckets = new Map<string, Wine[]>();
  for (const wine of list) {
    const key = keyOf(wine);
    const current = buckets.get(key);
    if (current) current.push(wine);
    else buckets.set(key, [wine]);
  }

  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "sr"))
    .map(([title, items]) => ({ id: title, title, wines: items }));
}

export function filtersAreNarrow(filters: Filters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.tags.length > 0 ||
    filters.countries.length > 0 ||
    filters.shops.length > 0 ||
    filters.view !== "all"
  );
}
