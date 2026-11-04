# ERCM Progres

Responzivna prezentaciona stranica na srpskoj latinici. Čist HTML, CSS i JavaScript, bez biblioteka, CMS-a, baze podataka ili serverske aplikacije. Potreban je Node.js 20 ili noviji samo za lokalni pregled i pripremu fajlova.

Fontovi Manrope (promenljiva težina od 400 do 800) i Instrument Serif italic hostuju se lokalno iz `assets/fonts/`, sa podrškom za srpsku latinicu. SIL Open Font License tekstovi nalaze se uz fontove. Posetioci ne kontaktiraju Google Fonts servere.

## Lokalni pregled

```sh
npm run dev
```

Otvorite `http://127.0.0.1:4173`. Instalacija paketa nije potrebna. Zaustavljanje servera: `Ctrl+C`.

Ako Windows PowerShell blokira `npm.ps1`, koristite `npm.cmd run dev` i `npm.cmd run build`. Nije potrebno menjati sistemske dozvole.

```sh
npm run build
npm run preview
```

Build kopira samo javne fajlove u `dist/`. Taj direktorijum sadrži sve što je potrebno za hosting. Lokalna evidencija `.build-files.json` omogućava uklanjanje starih kopija kada se izvorni fajl ukloni. Build briše samo ranije generisane fajlove, a ne nepoznate datoteke ili direktorijume.

## Cloudflare Pages

Postavite projekat u GitHub repozitorijum i povežite ga sa Cloudflare Pages. Koristite sledeća build podešavanja:

| Podešavanje | Vrednost |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | koren ovog projekta |

Za ručno postavljanje pripremite `dist/` komandom `npm run build` i objavite njegov sadržaj. Fajl `index.html` mora ostati u korenu izlaznog direktorijuma. Detalji: [Cloudflare Pages: statički HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) i [build podešavanja](https://developers.cloudflare.com/pages/configuration/build-configuration/).

## Radionica i prijave

Podaci su u `data/site.js`:

- `registrations: 17` je ručno unet broj prijava. Sajt nema sistem za automatsko brojanje.
- Termini su **24. januara 2027. i 21. februara 2027.**, online preko Zooma. Godina je potvrđena; vreme održavanja nije dostavljeno.
- `registrationUrl: null` uključuje prijavu putem email klijenta na `ercmprogres@gmail.com`. Sam klik ne šalje prijavu i ne povećava broj prijava.
- Kada postoji obrazac za prijavu, unesite njegovu punu `https://` adresu u `registrationUrl`.

Posle promene podataka ponovo pokrenite build i objavite ažuriranje. Vidljivi statički tekst u `index.html` služi i kao sadržaj pre učitavanja JavaScripta; uskladite ga kada menjate termine ili kontakt.

## Dodavanje projekata

U `data/projects.js` dodajte objekte u niz `projects`. Dok je niz prazan, prikazuje se dizajnirana najava budućih projekata. Nema izmišljenih rezultata ili projekata.

Svaki objekat podržava sledeća polja:

| Polje | Sadržaj |
| --- | --- |
| `title` | naziv stvarnog projekta |
| `description` | kratak opis |
| `image` | opciona putanja, npr. `assets/projekat.webp` |
| `imageAlt` | smislen opis fotografije |
| `url` | opciona puna adresa projekta |
| `category` | opciona oblast ili vrsta projekta |

Fotografije smestite u `assets/`. Koristite optimizovane WebP/AVIF/JPEG fajlove i stvarne podatke. Projekat bez URL-a ne vodi na posebnu stranicu. Raspored podržava proširivanje niza.

## Struktura

```text
index.html         Sadržaj i SEO metapodaci
styles.css         Vizuelni sistem i responzivni prikaz
app.js             Navigacija, animacije i dinamički sadržaj
data/site.js       Podaci radionice
data/projects.js   Lista projekata
assets/            Logo i ostali javni resursi
scripts/           Lokalni server i priprema za hosting
_headers           HTTP zaglavlja za Cloudflare Pages
dist/              Pripremljen sajt nakon build-a
```

Animacije poštuju `prefers-reduced-motion` i mogu se pauzirati kružnim dugmetom u donjem levom uglu. Broj članova organizacije je 21. Kontakt, broj članova i projekti menjaju se samo prema potvrđenim podacima.

Godina, datumi i kontakt su već uneti. Vreme početka i Zoom link nisu dostavljeni i nisu izmišljeni. Kada bude poznat konačni domen, postavite apsolutnu adresu za `og:image` i dodajte canonical URL u `index.html`.
