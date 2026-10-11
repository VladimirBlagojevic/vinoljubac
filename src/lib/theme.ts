export type ThemeName = "svetlo" | "tamno";

export const THEMES: { id: ThemeName; label: string }[] = [
  { id: "svetlo", label: "Svetlo" },
  { id: "tamno", label: "Tamno" },
];

const STORAGE_KEY = "vinoljubac-theme";

let current: ThemeName = readStoredTheme();
const listeners = new Set<() => void>();

function readStoredTheme(): ThemeName {
  if (typeof localStorage === "undefined") return "svetlo";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "tamno" || raw === "svetlo") return raw;
  } catch {
    return "svetlo";
  }
  return "svetlo";
}

export function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* the choice still applies for this visit */
  }
}

export function getTheme(): ThemeName {
  return current;
}

export function setTheme(theme: ThemeName) {
  current = theme;
  applyTheme(theme);
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

applyTheme(current);
