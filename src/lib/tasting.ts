import type { Wine } from "@/data/wines";
import { fold, formatPrice } from "@/lib/format";

export type Answer = "da" | "ne" | null;

export type TastingNote = {
  liked: Answer;
  again: Answer;
  note: string;
};

export const EMPTY_NOTE: TastingNote = {
  liked: null,
  again: null,
  note: "",
};

const STORAGE_KEY = "vinoljubac-put-oko-sveta-vol-3";

function isAnswer(value: unknown): value is Answer {
  return value === "da" || value === "ne" || value === null;
}

export function isTasted(note: TastingNote | undefined): boolean {
  if (!note) return false;
  return (
    note.liked !== null ||
    note.again !== null ||
    note.note.trim().length > 0
  );
}

export function loadNotes(): Record<string, TastingNote> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const notes: Record<string, TastingNote> = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (!value || typeof value !== "object") continue;
      const record = value as Partial<TastingNote>;
      const note: TastingNote = {
        liked: isAnswer(record.liked) ? record.liked : null,
        again: isAnswer(record.again) ? record.again : null,
        note: typeof record.note === "string" ? record.note : "",
      };
      if (!isTasted(note)) continue;
      notes[id] = note;
    }
    return notes;
  } catch {
    return {};
  }
}

export function saveNotes(notes: Record<string, TastingNote>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function buildNotesText(
  catalog: Wine[],
  notes: Record<string, TastingNote>,
): string {
  const lines = [
    "Put oko Sveta, vol. 3",
    "17. oktobar 2026. · Fabrika Events · 12–18h",
    "",
  ];
  const logged = catalog.filter((wine) => isTasted(notes[wine.id]));
  if (logged.length === 0) {
    lines.push("Nema zabeleženih utisaka.");
    return lines.join("\n");
  }
  lines.push(`Zabeleženo ${logged.length} od ${catalog.length}.`);
  lines.push("");
  for (const wine of logged) {
    const note = notes[wine.id] ?? EMPTY_NOTE;
    lines.push(`${wine.order}. ${wine.name}`);
    lines.push(wine.producer);
    lines.push(
      [
        `${wine.flag} ${wine.country}`,
        wine.priceRsd == null ? null : formatPrice(wine.priceRsd),
        wine.shop,
      ]
        .filter(Boolean)
        .join(" · "),
    );
    if (wine.vintage) lines.push(`Berba: ${wine.vintage}`);
    if (note.liked) lines.push(`Svidelo mi se: ${note.liked}`);
    if (note.again) lines.push(`Pio bih ponovo: ${note.again}`);
    if (note.note.trim()) lines.push(`Beleška: ${note.note.trim()}`);
    lines.push("");
  }
  return lines.join("\n").trimEnd() + "\n";
}

export function downloadNotes(text: string): void {
  const blob = new Blob([`\uFEFF${text}`], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vinoljubac-beleske.txt";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function wineHaystack(wine: Wine): string {
  return fold(
    [
      wine.name,
      wine.producer,
      wine.grape ?? "",
      wine.country,
      wine.shop,
      wine.region ?? "",
      wine.stand ?? "",
      wine.vintage ? String(wine.vintage) : "",
    ].join(" "),
  );
}
