import { Download } from "lucide-react";

import { Input } from "./ui/input";
import { Button, buttonVariants } from "./ui/button";
import { SheetContent, SheetFooter, SheetHeader } from "./ui/sheet";
import { Sheet, SheetClose, SheetTitle, SheetTrigger } from "./ui/sheet";

import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import type { Filters, GroupMode, ViewMode } from "@/lib/catalog";
import { TYPE_LABEL, TYPE_ORDER, TYPE_STYLE } from "@/lib/wine-labels";

const VIEW_OPTIONS: { id: ViewMode; label: string }[] = [
  { id: "all", label: "Sva vina" },
  { id: "untasted", label: "Samo neprobana" },
  { id: "notes", label: "Moje beleške" },
];

const GROUP_OPTIONS: { id: GroupMode; label: string }[] = [
  { id: "site", label: "Redosled sa sajta" },
  { id: "country", label: "Po zemlji" },
  { id: "type", label: "Po vrsti" },
  { id: "shop", label: "Po radnji" },
  { id: "grape", label: "Po sorti" },
];

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function activeFilterCount(filters: Filters): number {
  let count = filters.tags.length + filters.countries.length + filters.shops.length;
  if (filters.view !== "all") count += 1;
  if (filters.group !== "site") count += 1;
  return count;
}

export function FilterBar({
  filters,
  countries,
  shops,
  loggedCount,
  total,
  shown,
  onChange,
  onExport,
  onReset,
}: {
  filters: Filters;
  countries: string[];
  shops: string[];
  loggedCount: number;
  total: number;
  shown: number;
  onChange: (filters: Filters) => void;
  onExport: () => void;
  onReset: () => void;
}) {
  const activeCount = activeFilterCount(filters);

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
          17. oktobar 2026. · Fabrika Events · 12–18h
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
              side="bottom"
              className="max-h-[80vh] gap-0 overflow-hidden rounded-t-2xl p-0 text-base"
            >
              <SheetHeader className="border-b border-border pr-12">
                <SheetTitle className="text-xl">Filteri</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-5 overflow-y-auto px-4 py-4">
                <FilterControls
                  filters={filters}
                  countries={countries}
                  shops={shops}
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
  shops,
  onChange,
  onExport,
}: {
  filters: Filters;
  countries: string[];
  shops: string[];
  onChange: (filters: Filters) => void;
  onExport: () => void;
}) {
  return (
    <>
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
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Vrsta</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Vrsta">
          {TYPE_ORDER.map((tag) => {
            const selected = filters.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={selected}
                className={cn(buttonVariants({ variant: "outline" }), "shrink-0 rounded-full")}
                style={selected ? TYPE_STYLE[tag] : undefined}
                onClick={() =>
                  onChange({ ...filters, tags: toggleValue(filters.tags, tag) })
                }
              >
                {TYPE_LABEL[tag]}
              </button>
            );
          })}
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
      <ChipSection
        legend="Radnja"
        options={shops}
        selected={filters.shops}
        onToggle={(value) =>
          onChange({ ...filters, shops: toggleValue(filters.shops, value) })
        }
      />
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Grupisanje</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Grupisanje">
          {GROUP_OPTIONS.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant={filters.group === option.id ? "default" : "outline"}
              aria-pressed={filters.group === option.id}
              onClick={() => onChange({ ...filters, group: option.id })}
            >
              {option.label}
            </Button>
          ))}
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
