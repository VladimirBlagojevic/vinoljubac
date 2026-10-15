import { fold } from "@/lib/format";
import type { Wine } from "@/data/wines";
import { ROTATIONS, type RotationId } from "@/data/rotations";
import { isTasted, wineHaystack, type TastingNote } from "@/lib/tasting";

export type ViewMode = "all" | "untasted" | "notes";

export type GroupMode = "brochure" | "country" | "grape";

export type Filters = {
  query: string;
  countries: string[];
  view: ViewMode;
  group: GroupMode;
  version: RotationId | null;
  round: number | null;
};

export const EMPTY_FILTERS: Filters = {
  query: "",
  countries: [],
  view: "all",
  group: "brochure",
  version: null,
  round: null,
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

  if (!includesAny(filters.countries, wine.country)) return false;
  if (filters.version && filters.round) {
    const ids = ROTATIONS[filters.version][filters.round - 1];
    if (!ids?.includes(wine.id)) return false;
  }
  return true;
}

function isRotation(mode: GroupMode | RotationId): mode is RotationId {
  return mode === "v1" || mode === "v2" || mode === "v3";
}

export function groupWines(
  list: Wine[],
  mode: GroupMode | RotationId,
  round: number | null = null,
): WineGroup[] {
  if (isRotation(mode)) {
    const byId = new Map(list.map((wine) => [wine.id, wine]));
    const rounds = ROTATIONS[mode]
      .map((ids, index) => ({
        id: `krug-${index + 1}`,
        title: `Krug ${index + 1}`,
        wines: ids.flatMap((id) => {
          const wine = byId.get(id);
          return wine ? [wine] : [];
        }),
      }))
      .filter((group) => group.wines.length > 0);
    if (round == null) return rounds;
    return rounds.filter((group) => group.id === `krug-${round}`);
  }

  if (mode === "brochure") {
    return [
      {
        id: "brochure",
        title: "Redosled po brošuri",
        wines: [...list].sort((a, b) => a.order - b.order),
      },
    ];
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

  const buckets = new Map<string, Wine[]>();
  for (const wine of list) {
    const key = wine.country;
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
    filters.countries.length > 0 ||
    filters.view !== "all"
  );
}
