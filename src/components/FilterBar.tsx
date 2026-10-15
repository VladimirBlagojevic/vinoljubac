import { Download } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Input } from "./ui/input";
import { Button, buttonVariants } from "./ui/button";
import { SheetContent, SheetFooter, SheetHeader } from "./ui/sheet";
import { Sheet, SheetClose, SheetTitle, SheetTrigger } from "./ui/sheet";

import { cn } from "@/lib/utils";
import type { RotationId } from "@/data/rotations";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import type { Filters, GroupMode, ViewMode } from "@/lib/catalog";

const VIEW_OPTIONS: { id: ViewMode; label: string }[] = [
  { id: "all", label: "Sva vina" },
  { id: "untasted", label: "Samo neprobana" },
  { id: "notes", label: "Moje beleške" },
];

const VERSION_OPTIONS: { id: RotationId; label: string }[] = [
  { id: "v1", label: "Verzija 1" },
  { id: "v2", label: "Verzija 2" },
  { id: "v3", label: "Verzija 3" },
];

const GROUP_OPTIONS: { id: GroupMode; label: string }[] = [
  { id: "brochure", label: "Redosled po brošuri" },
  { id: "country", label: "Po zemlji" },
  { id: "grape", label: "Po sorti" },
];

function useDesktop() {
  return useSyncExternalStore(subscribeDesktop, desktopMatches, () => false);
}

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia("(min-width: 1024px)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function desktopMatches() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function activeFilterCount(filters: Filters): number {
  let count = filters.countries.length;
  if (filters.view !== "all") count += 1;
  if (filters.version) count += 1;
  else if (filters.group !== "brochure") count += 1;
  if (filters.round) count += 1;
  return count;
}

export function FilterBar({
  filters,
  countries,
  loggedCount,
  total,
  shown,
  onChange,
  onExport,
  onReset,
}: {
  filters: Filters;
  countries: string[];
  loggedCount: number;
  total: number;
  shown: number;
  onChange: (filters: Filters) => void;
  onExport: () => void;
  onReset: () => void;
}) {
  const activeCount = activeFilterCount(filters);
  const desktop = useDesktop();

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl leading-tight font-semibold tracking-tight">
            Put oko Sveta, vol. 3
          </h1>
          <p className="shrink-0 text-right text-sm leading-tight font-semibold">
            <span className="block text-lg">
              {loggedCount} od {total}
            </span>
            zabeleženo
          </p>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          17. oktobar 2026. ·{" "}
          <a
            href="https://maps.app.goo.gl/bxyFcHJ3SH17btK98"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            Fabrika Events
          </a>
          {" "}· 12–18h
        </p>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-foreground/15"
          aria-hidden="true"
        >
          <div
            className="h-full bg-primary"
            style={{ width: `${total === 0 ? 0 : (loggedCount / total) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Naziv, proizvođač, sorta..."
            aria-label="Pretraga vina"
            type="search"
            className="h-11"
          />
          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: activeCount > 0 ? "default" : "outline" }),
                "shrink-0",
              )}
              aria-label={
                activeCount > 0 ? `Filteri, ${activeCount} aktivno` : "Filteri"
              }
            >
              Filteri
              {activeCount > 0 ? (
                <span className="ml-1 inline-flex min-w-6 items-center justify-center rounded-full bg-primary-foreground px-1.5 text-sm font-semibold text-primary">
                  {activeCount}
                </span>
              ) : null}
            </SheetTrigger>
            <SheetContent
              side={desktop ? "right" : "bottom"}
              className={
                desktop
                  ? "h-full w-full gap-0 overflow-hidden p-0 text-base data-[side=right]:w-full data-[side=right]:max-w-md data-[side=right]:sm:max-w-md"
                  : "max-h-[80vh] gap-0 overflow-hidden rounded-t-2xl p-0 text-base"
              }
            >
              <SheetHeader className="border-b border-border pr-12">
                <SheetTitle className="text-xl">Filteri</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-5 overflow-y-auto px-4 py-4">
                <FilterControls
                  filters={filters}
                  countries={countries}
                  onChange={onChange}
                  onExport={onExport}
                />
                <ThemeSwitcher />
              </div>
              <SheetFooter className="border-t border-border">
                {activeCount > 0 ? (
                  <Button type="button" variant="outline" onClick={onReset}>
                    Poništi filtere
                  </Button>
                ) : null}
                <SheetClose render={<Button type="button" className="w-full" />}>
                  Prikaži {wineWord(shown)}
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
          Prikazano {wineWord(shown)}
        </p>
      </div>
    </div>
  );
}

function FilterControls({
  filters,
  countries,
  onChange,
  onExport,
}: {
  filters: Filters;
  countries: string[];
  onChange: (filters: Filters) => void;
  onExport: () => void;
}) {
  return (
    <>
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Verzija</h2>
        <p className="text-sm leading-snug text-muted-foreground">
          Tri rotacije, da ne idete svi istim putem. Svaka ima 6 krugova po 7 vina. Pratite
          verziju koju ste dobili.
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Verzija">
          {VERSION_OPTIONS.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant={filters.version === option.id ? "default" : "outline"}
              aria-pressed={filters.version === option.id}
              onClick={() =>
                onChange({
                  ...filters,
                  version: filters.version === option.id ? null : option.id,
                  round: null,
                })
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
        {filters.version ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Krug">
            {[1, 2, 3, 4, 5, 6].map((round) => (
              <Button
                key={round}
                type="button"
                variant={filters.round === round ? "default" : "outline"}
                aria-pressed={filters.round === round}
                onClick={() =>
                  onChange({
                    ...filters,
                    round: filters.round === round ? null : round,
                  })
                }
              >
                Krug {round}
              </Button>
            ))}
          </div>
        ) : null}
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Lista</h2>
        <div className="flex flex-wrap gap-2">
          {VIEW_OPTIONS.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant={filters.view === option.id ? "default" : "outline"}
              aria-pressed={filters.view === option.id}
              className="shrink-0"
              onClick={() => onChange({ ...filters, view: option.id })}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </section>
      <ChipSection
        legend="Zemlja"
        options={countries}
        selected={filters.countries}
        onToggle={(value) =>
          onChange({ ...filters, countries: toggleValue(filters.countries, value) })
        }
      />
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Grupisanje</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Grupisanje">
          {GROUP_OPTIONS.map((option) => {
            const selected = filters.version == null && filters.group === option.id;
            return (
              <Button
                key={option.id}
                type="button"
                variant={selected ? "default" : "outline"}
                aria-pressed={selected}
                onClick={() =>
                  onChange({ ...filters, group: option.id, version: null, round: null })
                }
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </section>
      <Button type="button" variant="outline" onClick={onExport}>
        <Download aria-hidden="true" />
        Preuzmi beleške
      </Button>
    </>
  );
}

function wineWord(count: number): string {
  const lastTwo = count % 100;
  if (count % 10 === 1 && lastTwo !== 11) return `${count} vino`;
  return `${count} vina`;
}

function ChipSection({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold">{legend}</h2>
      <ChipRow legend={legend} options={options} selected={selected} onToggle={onToggle} />
    </section>
  );
}

function ChipRow({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={legend}>
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <Button
            key={option}
            type="button"
            variant={active ? "default" : "outline"}
            aria-pressed={active}
            className="shrink-0"
            onClick={() => onToggle(option)}
          >
            {option}
          </Button>
        );
      })}
    </div>
  );
}
