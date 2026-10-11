# Vinoljubac — Put oko Sveta, vol. 3

Statički pratilac degustacije za salon **Put oko Sveta, vol. 3** (17. oktobar 2026, Fabrika Events, 12–18h).

U katalogu je svih 42 vina sa [vinoljubac.rs](https://vinoljubac.rs/): naziv, proizvođač, zemlja, maloprodajna cena, radnja i slika. Aplikacija nema server, nalog ni bazu. Utisci i beleške ostaju u `localStorage` na telefonu, a mogu da se preuzmu kao običan tekst.

## Pokretanje lokalno

Potreban je Node.js.

```bash
npm install
npm run dev
```

Aplikacija sluša na [http://127.0.0.1:43123](http://127.0.0.1:43123).

Produkcioni paket:

```bash
npm run build
npm run preview
```

## Netlify

`netlify.toml` već kaže da se gradi `npm run build` i da se objavljuje samo `dist`, uz SPA preusmerenje na `index.html`.

1. Poveži repozitorijum sa Netlify.
2. Build komanda: `npm run build`.
3. Publish direktorijum: `dist`.
4. Nisu potrebne env promenljive.

Posle prvog učitavanja, manifest i service worker drže katalog i slike u pregledaču ako Wi‑Fi na salonu padne.
