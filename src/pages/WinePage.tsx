import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState, type Ref } from "react";

import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button, buttonVariants } from "../components/ui/button";

import { cn } from "@/lib/utils";
import { wines } from "@/data/wines";
import { formatPrice } from "@/lib/format";
import { useTasting } from "@/tasting-context";
import { TypeMarks } from "@/components/TypeMarks";
import { isTasted, type Answer } from "@/lib/tasting";

export function WinePage() {
  const { id } = useParams();
  const wine = wines.find((item) => item.id === id);
  const tasting = useTasting();
  const photoRef = useRef<HTMLDivElement>(null);
  const [pastPhotoMiddle, setPastPhotoMiddle] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPastPhotoMiddle(false);
  }, [id]);

  useEffect(() => {
    const node = photoRef.current;
    if (!node) return;
    const update = () => {
      const rect = node.getBoundingClientRect();
      setPastPhotoMiddle(rect.top + rect.height / 2 <= 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [id]);

  if (!wine) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-xl font-semibold">Ovo vino nije na listi salona.</h1>
        <Link to="/" className={cn(buttonVariants(), "mt-6")}>
          Nazad na listu
        </Link>
      </main>
    );
  }

  const note = tasting.noteFor(wine.id);
  const tasted = isTasted(note);

  return (
    <div className="min-h-svh">
      {pastPhotoMiddle ? (
        <header className="fixed inset-x-0 top-0 z-30 border-b border-border bg-background">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-3 py-2">
            <Link
              to="/"
              aria-label="Nazad"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground"
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-base leading-tight font-semibold">{wine.name}</p>
              <p className="truncate text-sm leading-tight text-muted-foreground">{wine.producer}</p>
            </div>
          </div>
        </header>
      ) : null}
      <main className="mx-auto grid max-w-3xl gap-6 px-4 py-4 pb-16 md:grid-cols-[280px_1fr]">
        <BottleImage
          photoRef={photoRef}
          src={wine.image}
          alt={`${wine.name}, ${wine.producer}`}
          showBack={!pastPhotoMiddle}
        />
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-base">
              {wine.flag} {wine.country}
            </p>
            <h1 className="text-2xl leading-tight font-semibold tracking-tight">{wine.name}</h1>
            <p className="text-lg">{wine.producer}</p>
            <TypeMarks wine={wine} />
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-base">
            <dt className="text-muted-foreground">Cena</dt>
            <dd className="font-semibold">{formatPrice(wine.priceRsd)}</dd>
            <dt className="text-muted-foreground">Radnja</dt>
            <dd>{wine.shop}</dd>
            {wine.grape ? (
              <>
                <dt className="text-muted-foreground">Sorta</dt>
                <dd>{wine.grape}</dd>
              </>
            ) : null}
            {wine.region ? (
              <>
                <dt className="text-muted-foreground">Region</dt>
                <dd>{wine.region}</dd>
              </>
            ) : null}
          </dl>
          <a
            href={wine.vivinoUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants(), "w-full")}
          >
            Otvori na Vivinu
          </a>
          {wine.vivinoUncertain ? (
            <p className="rounded-xl border border-[#9a3412] bg-[#fde0c2] p-4 text-sm leading-snug text-[#7c2d12]">
              Link je najbliža prava stranica vina na Vivinu. Proveri da li je to baš ovo
              vino pre nego što čitaš ocene.
            </p>
          ) : null}
          <TriChoice
            label="Svidelo mi se"
            value={note.liked}
            onChange={(liked) => tasting.setLiked(wine.id, liked)}
          />
          <TriChoice
            label="Pio bih ponovo"
            value={note.again}
            onChange={(again) => tasting.setAgain(wine.id, again)}
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-base font-semibold">Beleška</span>
              <label className="flex items-center gap-2">
                <span className="text-sm font-semibold">Berba</span>
                <Input
                  value={note.year}
                  inputMode="numeric"
                  maxLength={4}
                  aria-label="Berba"
                  placeholder="godina"
                  className="h-11 w-24"
                  onChange={(event) =>
                    tasting.setYear(wine.id, event.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                />
              </label>
            </div>
            <Textarea
              value={note.note}
              onChange={(event) => tasting.setNote(wine.id, event.target.value)}
              maxLength={500}
            />
          </div>
          <p className="text-sm leading-snug text-muted-foreground">
            {tasted
              ? "Vino je zabeleženo na ovom telefonu."
              : "Čim označiš utisak ili upišeš belešku, vino ulazi u probana."}
          </p>
          {tasted ? (
            <Button type="button" variant="outline" className="h-10" onClick={() => tasting.clearNote(wine.id)}>
              Poništi utisak i belešku
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={tasting.exportNotes}>
            Preuzmi beleške
          </Button>
        </div>
      </main>
    </div>
  );
}

function TriChoice({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Answer;
  onChange: (value: Answer) => void;
}) {
  const options: { id: Answer; text: string }[] = [
    { id: null, text: "Prazno" },
    { id: "da", text: "Da" },
    { id: "ne", text: "Ne" },
  ];

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-base font-semibold">{label}</legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <Button
            key={option.text}
            type="button"
            variant={value === option.id ? "default" : "outline"}
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
          >
            {option.text}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}

function BottleImage({
  src,
  alt,
  showBack,
  photoRef,
}: {
  src: string;
  alt: string;
  showBack: boolean;
  photoRef: Ref<HTMLDivElement>;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      ref={photoRef}
      className="relative flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-[#14120f] md:h-[28rem]"
    >
      {showBack ? (
        <Link
          to="/"
          aria-label="Nazad"
          className="absolute top-3 left-3 z-10 flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>
      ) : null}
      {failed ? (
        <p className="px-4 text-center text-base text-white">Slika nije učitana</p>
      ) : (
        <img
          src={src}
          alt={alt}
          width={300}
          height={300}
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
