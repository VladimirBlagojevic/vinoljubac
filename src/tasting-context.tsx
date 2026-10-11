import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { wines } from "@/data/wines";
import { EMPTY_NOTE, buildNotesText, downloadNotes, isTasted, loadNotes, saveNotes, type Answer, type TastingNote } from "@/lib/tasting";

type TastingContextValue = {
  notes: Record<string, TastingNote>;
  loggedCount: number;
  noteFor: (id: string) => TastingNote;
  setLiked: (id: string, liked: Answer) => void;
  setAgain: (id: string, again: Answer) => void;
  setNote: (id: string, note: string) => void;
  setYear: (id: string, year: string) => void;
  clearNote: (id: string) => void;
  exportNotes: () => void;
};

const TastingContext = createContext<TastingContextValue | null>(null);

export function TastingProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Record<string, TastingNote>>(loadNotes);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  function update(id: string, patch: Partial<TastingNote>) {
    setNotes((current) => {
      const previous = current[id] ?? EMPTY_NOTE;
      return { ...current, [id]: { ...previous, ...patch } };
    });
  }

  const value = useMemo<TastingContextValue>(() => {
    const loggedCount = wines.filter((wine) => isTasted(notes[wine.id])).length;
    return {
      notes,
      loggedCount,
      noteFor: (id) => notes[id] ?? EMPTY_NOTE,
      setLiked: (id, liked) => update(id, { liked }),
      setAgain: (id, again) => update(id, { again }),
      setNote: (id, note) => update(id, { note }),
      setYear: (id, year) => update(id, { year }),
      clearNote: (id) =>
        setNotes((current) => {
          if (!current[id]) return current;
          const next = { ...current };
          delete next[id];
          return next;
        }),
      exportNotes: () => downloadNotes(buildNotesText(wines, notes)),
    };
  }, [notes]);

  return <TastingContext.Provider value={value}>{children}</TastingContext.Provider>;
}

export function useTasting(): TastingContextValue {
  const value = useContext(TastingContext);
  if (!value) {
    throw new Error("useTasting mora da stoji unutar TastingProvider.");
  }
  return value;
}
