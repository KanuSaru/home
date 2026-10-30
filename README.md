# Kanu — personal site

Erick Donado's personal site, built with Next.js (App Router) and exported as
static HTML. English first, with a Spanish switch.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # writes the static site to out/
```

## Edit the content

All text lives in `content/site.ts`, in English and Spanish (`{ en, es }`).
Pages: `/` (home hub), `/me/` and `/journal/`. Work and Notes are next.

## Connect the live widgets

Fill these in at the top of `content/site.ts`. Until then each widget says
"Not connected yet".

| Widget | Status |
| --- | --- |
| Now playing | Username set. Needs `lastfm.apiKey`: create one at last.fm/api/account/create and paste the API key (never the shared secret) |
| On Discord | Connected through Lanyard |
| Visitors | Code set (`kanu`). In GoatCounter settings, turn on "Allow adding visitor counts on your website" or the number won't load |
| Weather | nothing; uses Open-Meteo |
| Local time, moon | nothing; computed in the browser |

The Last.fm key is a public read-only key, the kind these widgets normally ship
with; don't put any private key in this file.

## The journal

Entries are sealed on your computer and only the sealed file is published.

1. Write your riddle in `content/journal.ts`, in English and Spanish.
2. Write an entry as `journal/2026-10-28-anything.md` (date first, then any name).
   The first line `# Title` is the title; paragraphs are separated by a blank line.
3. Run `npm run journal:seal`. The first time, it asks which answers open the
   journal (for example `moon | luna`). After that it asks for an answer to unlock.
4. Commit and publish `content/journal.sealed.json`. The `journal/` folder is in
   `.gitignore`: keep it, back it up privately, and never commit it.

Other commands: `npm run journal:unseal` writes every entry back into `journal/`
(if you lose the files), and `npm run journal:answers` changes the accepted answers.

What visitors can see without the answer: how many entries there are and their
dates. Titles and text are encrypted (AES-GCM, key derived with PBKDF2). The answer
isn't stored anywhere, but anyone can copy the sealed file and try guesses offline,
so a one-word answer can be found with a word list. A longer or less obvious
phrase is much harder to guess. Don't seal anything you couldn't live with being read.

## Where things are

- `components/Shell.tsx`: masthead, language switch, pages, sidebar, footer
- `components/Moon.tsx`: the moon, from the `dither-moon` package (github.com/KanuSaru/dither-moon)
- `components/Widgets.tsx`: time, weather, now playing, Discord, visitors
- `components/HomePage.tsx`, `MePage.tsx`, `JournalPage.tsx`: the pages
- `lib/seal.mjs`, `scripts/journal.mjs`: sealing and opening the journal
- `components/MaskField.tsx`: segmentation mask, saved for the Work page
- `app/globals.css`: all styles and color tokens

## Publish

The site lives in the repo `KanuSaru/home` and is published by GitHub Pages at
**https://kanusaru.github.io/home**. Every push to `main` runs
`.github/workflows/deploy.yml`, which builds the site and publishes it.

- GitHub Pages needs the repo to be **public** on a free account (private repos
  need GitHub Pro). Only `content/journal.sealed.json` of the journal is ever
  pushed; the plain-text `journal/` folder is ignored by git.
- One-time setup: Settings › Pages › Source: **GitHub Actions**.
- The `/home` part of the address is handled for you: the workflow asks GitHub
  where the site lives. When you add a custom domain (Settings › Pages › Custom
  domain), the next deploy serves it from the root with no code changes.
