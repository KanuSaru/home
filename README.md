# Kanu

The personal site of Erick Donado (Kanu): **[erickdonado.com](https://erickdonado.com)**.
Research, notes, a free route into machine learning, a guestbook, a locked journal, and
pictures drawn in 1-bit pixels by the browser. In English, and in Spanish under `/es/`.

It's a [Next.js](https://nextjs.org) site exported as plain static files and published
by GitHub Pages. There's no server of its own.

## How it works

- **Pages** are built ahead of time: `next build` writes every page as an HTML file to
  `out/`, and GitHub Pages serves that folder. Each page exists twice, `/work/` in English
  and `/es/work/` in Spanish; the language switch moves between them and remembers the
  visitor's choice.
- **Live widgets** (what I'm listening to, Discord status, weather, visitors, mood) are
  filled in by the visitor's browser from public APIs: Last.fm, Lanyard, Open-Meteo,
  GoatCounter and imood. None of them needs a secret.
- **The guestbook** is the only part with a server: a small Cloudflare Worker with a D1
  database, from [leave-a-mark](https://github.com/KanuSaru/leave-a-mark). It lives in
  its own repo, with its own settings and secrets.
- **Pictures** (the moon, the lily, the Steam Deck, the music visualizer) are drawn by
  code into on-or-off pixels with a 4×4 Bayer grid. No image files.

The build runs four steps (`npm run build`):

1. `scripts/feeds.mjs` writes the RSS feeds, with maths as MathML.
2. `scripts/og.mjs` draws the link preview images into `public/og/`: one per page and
   note, plus a square one for Google's result thumbnail. It needs internet for the fonts;
   without it, the site builds anyway, just without them.
3. `next build` writes the pages.
4. `scripts/html-lang.mjs` marks every page under `out/es/` as Spanish (`lang="es"`).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # the whole site, in out/
```

Node 26, the same version the deploy uses, so if it builds on your computer it builds there.

## Change things

Almost all the text lives in `content/`, always as `{ en, es }` pairs, so changing the
words never means touching a component.

### Every page

- **Masthead, pages list, footer:** `components/Shell.tsx`. The line under "Kanu" is
  `epigraph` in `content/site.ts`.
- **Updates log:** add an entry at the top of `content/updates.ts`. The sidebar shows the
  latest three; `/updates/` shows them all.
- **A new page** needs a file in both `app/<page>/` and `app/es/<page>/`, and an entry in
  `nav` in `content/site.ts`.
- **Styles and colors:** `app/globals.css`, with the color tokens at the top.

### Home

The texts are `home` in `content/site.ts`; the page is `components/HomePage.tsx`. The
taped photo is `public/avatar.jpg` (set as `avatar` in `config`), shown in grayscale. The
lily is `components/LilyScene.tsx`; the moon is the `dither-moon` package.

### Me

The texts are `me` in `content/site.ts`. The **Daily driver** panel shows the Steam Deck,
drawn by the `dither-model` package from `public/models/steam-deck.json`. That file is
Valve's official CAD, simplified, under Valve's license (CC BY-NC-SA 4.0, see
`public/models/README.md`): keep the credit line under the panel. To show another STL:
`npx dither-model thing.stl -o public/models/thing.json`.

### Work

The texts and projects are in `content/work.ts`. The CV buttons download the PDFs in
`public/cv/`: to update a CV, replace the file with one of the same name. My publications
also go into the structured data from `publications` in `content/seo.ts`.

### Notes

Each note is a Markdown file in `content/notes/`, named after its address plus its
language: `my-note.en.md`, `my-note.es.md`, or both. It's published at `/notes/my-note/`,
and the three newest show on the home page. Start the file like this:

```
---
title: My note
date: 2026-11-15
tags: machine learning, c
summary: One or two sentences for the list of notes.
description: Optional, up to 160 characters, for search results (default: the summary).
---
```

Then write normally: `##` headings, paragraphs, `-` lists, `**bold**`, `*italic*`,
`` `code` ``, code blocks with three backticks, `[links](https://…)` and images (put them
in `public/notes/` and write `![what it shows](/notes/picture.png)`).

- **Maths** is LaTeX, typeset by KaTeX at build time: `$x_i$` inside a sentence, `$$ … $$`
  on its own line for a centered formula.
- **Live figures** go on a line starting with `::`. The ones in `components/NoteFigures.tsx`:
  `::moon`, `::moons`, `::ramp` and `::bayer`. The diagrams in `components/LearnFigures.tsx`:
  `::loop`, `::projects`, `::karaoke`, `::bell`, `::houses`, `::trend`, `::pca`, `::compare`,
  `::curves`, `::descent` and `::landscape`. Each takes an optional `caption="…"`, and the
  words inside follow the page's language.
- Each note gets a reading time and, with three or more sections, a list of them at the top.

### Learn ML

The whole route is data in `content/learn.ts`: phases, modules, resources with their
priority level (1 essential, 2 reinforcement, 3 go deeper), self-checks and the glossary.
Update `reviewed` there when you go through it again. Visitors' progress stays in their
own browser, and the progress code lets them carry it to another one. Don't reorder the
resources inside a module: progress is saved by position.

### Journal

The page shows a sealed envelope with the riddle on it. Solving it breaks the wax seal
and shows the entries as handwritten letters. Entries are sealed on your computer, and
only the sealed file is published.

1. Write the riddle in `content/journal.ts`, in English and Spanish.
2. Write an entry as `journal/2026-10-28-anything.md` (date first). The first line,
   `# Title`, is the title. For both languages, write a pair: `2026-10-31-first-step.es.md`
   and `2026-10-31-first-step.en.md`.
3. Run `npm run journal:seal`. The first time it asks which answers open the journal
   (several, separated by `|`); after that it asks for one of them to unlock.
4. Commit and publish `content/journal.sealed.json`. The `journal/` folder is in
   `.gitignore`: keep it, back it up privately, and never commit it.

`npm run journal:unseal` writes every entry back into `journal/` if you lose the files;
`npm run journal:answers` changes the accepted answers.

Without the answer, visitors can see how many entries there are and their dates. Titles
and text are encrypted (AES-GCM, with a key derived by PBKDF2), and the answer isn't
stored anywhere. But anyone can copy the sealed file and keep guessing offline, so a short
answer can fall to a word list. Don't seal anything you couldn't live with being read.

### Guestbook

Messages are kept by the leave-a-mark Worker. Its address and Turnstile's **site** key
(public) are in `config.guestbook` in `content/site.ts`. You approve or delete messages at
the Worker's `/admin`, and get a Discord message and an email when someone signs. The
Worker's settings and secrets live in the leave-a-mark repo and in Cloudflare, never here.
The guestbook page also shows the 88×31 button (`public/button.gif`, with a still
`button.png`) and the code others can copy to link to the site.

### Sidebar widgets

On computers the widgets are a column on the right. On phones and tablets they're in the
**Menu** drawer, which slides in from the right. The code is in `components/Widgets.tsx`
and `components/MusicPlayer.tsx`; their settings are in `config` at the top of
`content/site.ts`:

- **Now playing** and **Music**: Last.fm (`lastfm.user`, `lastfm.apiKey`). The key is a
  public read-only key from last.fm/api/account/create (the API key, never the shared
  secret). Both widgets remember Last.fm's last good answer in the visitor's browser and
  keep showing it while Last.fm is down.
- **Music**: while `music.tracks` is empty, it lists my five most played songs this month.
  With tracks (mp3 or m4a in `public/music/`, listed in `music.tracks`, each under 100 MB),
  it becomes the `dither-player` music player. Only upload music I made or can share.
- **On Discord**: Lanyard (`discordId`). It only works while I'm in Lanyard's Discord server.
- **Weather** and **Local time**: Open-Meteo and the browser (`place`).
- **Mood**: imood (`imood`). Change it on imood.com.
- **Visitors**: GoatCounter (`goatcounter`). Its settings must allow "visitor counts on
  your website", or the number won't load.

On computers, the browser's own scrollbar is hidden. A scrollbar appears when the mouse
reaches the right edge (`components/ScrollRail.tsx`).

## Publishing

Every push to `main` runs `.github/workflows/deploy.yml`: it builds the site, publishes
`out/` to GitHub Pages, and then tells Bing and the other IndexNow search engines which
pages exist (`scripts/indexnow.mjs`; the key file in `public/` is public on purpose).

- **The domain**, erickdonado.com, is registered at Cloudflare and set as the custom domain
  in the repo's Settings › Pages. Its DNS records must stay **DNS only** (grey cloud) so
  GitHub can keep its HTTPS certificate. Old links under `kanusaru.github.io/home/` forward
  to the same page on the domain.
- **The address and base path** come from GitHub during the build, so changing the domain
  needs no code changes.
- **The repo must stay public** for GitHub Pages on a free account. Only
  `content/journal.sealed.json` of the journal is ever pushed.
- **Links are checked** on the 1st of every month by
  [still-breathing](https://github.com/KanuSaru/still-breathing)
  (`.github/workflows/links.yml`), which opens an issue if one has died. To run it now:
  Actions › Check links › Run workflow.

## Search engines and AI assistants

What they read lives in `content/seo.ts`: each page's title and description (written for
search results, between 25 and 160 characters), the facts about me for the structured
data, and my profiles elsewhere. `lib/seo.tsx` turns it into metadata and schema.org data.
Each build also writes `sitemap.xml`, `robots.txt` and `llms.txt`.

The site is in Google Search Console and Bing Webmaster Tools, both verified through DNS.
After changing a page's text, request indexing for it in Search Console to have it read
again sooner. The journal is kept out of search results with `noindex`.

## Map of the code

- `app/`: one folder per page, in English, and again under `app/es/`
- `content/`: all the text and settings (`site.ts`, `work.ts`, `learn.ts`, `seo.ts`,
  `updates.ts`, `journal.ts`, `notes/`)
- `components/Shell.tsx`: masthead, language switch, pages list, sidebar and Menu drawer, footer
- `components/HomePage.tsx`, `MePage.tsx`, `WorkPage.tsx`, `NotesPage.tsx`, `LearnPage.tsx`,
  `JournalPage.tsx`, `GuestbookPage.tsx`: the pages
- `components/LilyScene.tsx` (the lily), `MaskField.tsx` (the segmentation mask on Work),
  `TapedPhoto.tsx` (the photo by the wordmark)
- `components/NoteFigures.tsx`, `LearnFigures.tsx`: the figures notes can use
- `components/Widgets.tsx`, `MusicPlayer.tsx`, `Updates.tsx`: the sidebar
- `components/SmoothScroll.tsx`, `ScrollRail.tsx`: wheel scrolling and the mouse scrollbar
- `lib/i18n.tsx`, `lib/route.tsx`: languages and addresses
- `lib/markdown.ts`, `lib/notes.ts`: reading the notes
- `lib/seal.mjs`, `scripts/journal.mjs`: sealing and opening the journal
- `lib/seo.tsx`, `lib/og.ts`: metadata and preview images
- `scripts/`: the build steps, and IndexNow
- `app/globals.css`: all styles

## Related packages

Parts of this site became their own open-source packages, each with its own repo:

- [dither-moon](https://github.com/KanuSaru/dither-moon): the Moon at its real phase, in 1-bit pixels
- [dither-model](https://github.com/KanuSaru/dither-model): any STL file as turning 1-bit pixel art
- [dither-player](https://github.com/KanuSaru/dither-player): a music player with a 1-bit visualizer
- [leave-a-mark](https://github.com/KanuSaru/leave-a-mark): the guestbook, on a Cloudflare Worker
- [still-breathing](https://github.com/KanuSaru/still-breathing): the monthly link checker
