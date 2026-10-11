import { useSyncExternalStore } from "react";

import { Button } from "./ui/button";

import { getTheme, setTheme, subscribeTheme, THEMES } from "@/lib/theme";

export function ThemeSwitcher() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "svetlo");

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold">Izgled</h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Izgled">
        {THEMES.map((option) => (
          <Button
            key={option.id}
            type="button"
            variant={theme === option.id ? "default" : "outline"}
            aria-pressed={theme === option.id}
            onClick={() => setTheme(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
