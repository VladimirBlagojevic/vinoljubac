import { useState } from "react";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

import type { Wine } from "@/data/wines";
import { formatPrice } from "@/lib/format";
import { TypeMarks } from "@/components/TypeMarks";
import { isTasted, type TastingNote } from "@/lib/tasting";

export function WineCard({
  wine,
  note,
}: {
  wine: Wine;
  note: TastingNote | undefined;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const tasted = isTasted(note);
  const hasNote = Boolean(note?.note.trim());
  const hasImpression = Boolean(note && (note.liked || note.again));

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-sm">
      <Link
        to={`/vino/${wine.id}`}
        className="focus-visible:ring-3 focus-visible:ring-ring"
      >
        <div className="flex h-56 items-center justify-center bg-[#14120f] sm:h-64">
          {imageFailed ? (
            <p className="px-4 text-center text-base text-white">Slika nije učitana</p>
          ) : (
            <img
              src={wine.image}
              alt={`${wine.name}, ${wine.producer}`}
              width={300}
              height={300}
              loading={wine.order < 4 ? "eager" : "lazy"}
              className="h-full w-full object-contain"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-2">
            <Link
              to={`/vino/${wine.id}`}
              className="min-w-0 text-xs font-medium text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring"
            >
              {wine.flag} {wine.country}
            </Link>
            {wine.stand ? (
              <span className="shrink-0 text-xs text-muted-foreground">{wine.stand}</span>
            ) : null}
          </div>
          <a
            href={wine.vivinoUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Vivino: ${wine.name}`}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-base font-semibold"
          >
            <Eye aria-hidden="true" className="size-5" />
            Vivino
          </a>
        </div>
        <Link
          to={`/vino/${wine.id}`}
          className="flex flex-1 flex-col gap-2 focus-visible:ring-3 focus-visible:ring-ring"
        >
          <h2 className="text-xl leading-tight font-semibold tracking-tight">{wine.name}</h2>
          <p className="text-base leading-snug">{wine.producer}</p>
          {wine.vintage ? (
            <p className="text-sm leading-snug text-muted-foreground">Berba {wine.vintage}</p>
          ) : null}
          {wine.grape ? <p className="text-sm leading-snug">{wine.grape}</p> : null}
          <TypeMarks wine={wine} />
          <p className="text-base font-semibold">{formatPrice(wine.priceRsd)}</p>
          {tasted ? (
            <p className="mt-auto flex flex-wrap gap-2 pt-1 text-sm font-semibold">
              {hasImpression ? (
                <span className="rounded-full bg-secondary px-3 py-1">Utisak</span>
              ) : null}
              {hasNote ? (
                <span className="rounded-full bg-secondary px-3 py-1">Beleška</span>
              ) : null}
            </p>
          ) : null}
        </Link>
      </div>
    </article>
  );
}
