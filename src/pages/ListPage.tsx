import { useEffect, useMemo, useState } from "react";

import { TYPE_ORDER } from "@/lib/wine-labels";
import { useTasting } from "@/tasting-context";
import { WineCard } from "@/components/WineCard";
import { FilterBar, type Panel } from "@/components/FilterBar";
import { countries, shops, wines, type TypeTag } from "@/data/wines";
import { EMPTY_FILTERS, filtersAreNarrow, groupWines, wineMatches, type Filters, type GroupMode, type ViewMode } from "@/lib/catalog";

const FILTER_KEY = "vinoljubac-list-filters";
const SCROLL_KEY = "vinoljubac-list-scroll";

const VIEWS: ViewMode[] = ["all", "untasted", "notes"];
const GROUPS: GroupMode[] = ["site", "country", "type", "shop", "grape"];

function isTypeTag(value: unknown): value is TypeTag {
  return typeof value === "string" && TYPE_ORDER.includes(value as TypeTag);
}

function readFilters(): Filters {
  if (typeof localStorage === "undefined") return EMPTY_FILTERS;
  try {
    const raw = localStorage.getItem(FILTER_KEY) ?? sessionStorage.getItem(FILTER_KEY);
    if (!raw) return EMPTY_FILTERS;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY_FILTERS;
    const record = parsed as Partial<Filters>;
    return {
      query: typeof record.query === "string" ? record.query : "",
      tags: Array.isArray(record.tags) ? record.tags.filter(isTypeTag) : [],
      countries: Array.isArray(record.countries)
        ? record.countries.filter((item): item is string => countries.includes(item))
        : [],
      shops: Array.isArray(record.shops)
        ? record.shops.filter((item): item is string => shops.includes(item))
        : [],
      view: VIEWS.includes(record.view as ViewMode) ? (record.view as ViewMode) : "all",
      group: GROUPS.includes(record.group as GroupMode)
        ? (record.group as GroupMode)
        : "site",
    };
  } catch {
    return EMPTY_FILTERS;
  }
}

export function ListPage() {
  const tasting = useTasting();
  const [filters, setFilters] = useState<Filters>(readFilters);
  const [panel, setPanel] = useState<Panel>(null);

  useEffect(() => {
    localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (!raw) return;
    sessionStorage.removeItem(SCROLL_KEY);
    const y = Number(raw);
    if (!Number.isFinite(y)) return;
    requestAnimationFrame(() => window.scrollTo(0, y));
  }, []);

  const visible = useMemo(
    () => wines.filter((wine) => wineMatches(wine, filters, tasting.notes)),
    [filters, tasting.notes],
  );
  const groups = useMemo(
    () => groupWines(visible, filters.group),
    [filters.group, visible],
  );

  const emptyMessage = emptyCopy(filters, tasting.loggedCount);

  return (
    <div className="min-h-svh" onClick={rememberScrollFromLink}>
      <FilterBar
        filters={filters}
        countries={countries}
        shops={shops}
        loggedCount={tasting.loggedCount}
        total={wines.length}
        shown={visible.length}
        panel={panel}
        onPanel={setPanel}
        onChange={setFilters}
        onExport={tasting.exportNotes}
        onReset={() => {
          setFilters({ ...EMPTY_FILTERS, group: filters.group });
          setPanel(null);
        }}
      />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-4 pb-12">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-8">
            <p className="text-xl leading-snug font-semibold">{emptyMessage}</p>
            {filtersAreNarrow(filters) ? (
              <button
                type="button"
                className="mt-4 text-lg font-semibold underline"
                onClick={() => setFilters({ ...EMPTY_FILTERS, group: filters.group })}
              >
                Poništi filtere
              </button>
            ) : null}
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.id} className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold">
                {group.title}
                <span className="text-base font-medium text-muted-foreground">
                  {" "}
                  · {group.wines.length}
                </span>
              </h2>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {group.wines.map((wine) => (
                  <li key={`${group.id}-${wine.id}`}>
                    <WineCard wine={wine} note={tasting.notes[wine.id]} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
        <p className="text-sm text-muted-foreground">
          Utisci i beleške ostaju samo na ovom telefonu. Preuzmi ih kao tekst ako želiš
          kopiju van pregledača.
        </p>
      </main>
    </div>
  );
}

function rememberScrollFromLink(event: { target: EventTarget | null }) {
  const target = event.target;
  if (!(target instanceof Element) || !target.closest("a")) return;
  sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
}

function emptyCopy(filters: Filters, loggedCount: number): string {
  if (filters.view === "notes" && loggedCount === 0) {
    return "Još nema beleški. Otvori vino i zapiši utisak ili kratku rečenicu.";
  }
  if (filters.view === "untasted" && loggedCount === wines.length && !filtersAreNarrow({ ...filters, view: "all" })) {
    return "Sva vina su zabeležena. Ostaje još samo čaša.";
  }
  if (filters.view === "notes") {
    return "Nijedna beleška ne prolazi ovaj izbor.";
  }
  if (filters.view === "untasted") {
    return "Nema neprobanih vina za ovaj izbor.";
  }
  return "Nijedno vino ne prolazi ovaj izbor. Promeni pretragu ili poništi filtere.";
}
