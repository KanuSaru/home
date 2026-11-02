# Kanu — personal site

Erick Donado's personal site, built with Next.js (App Router) and exported as
static HTML. English first, with a Spanish switch.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # writes the static site to out/
```

The deploy workflow uses the same Node version as your computer (26), so if it
builds for you, it builds there.

## Edit the content

All text lives in `content/site.ts`, in English and Spanish (`{ en, es }`).
Pages: `/` (home hub), `/me/`, `/work/`, `/notes/` and `/journal/`.
The Work page's text is in `content/work.ts`. The CV buttons download the PDFs in
`public/cv/`; to update a CV, replace the file with one of the same name (or change
the name in `work.cv`).

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

## Your photo

Put the image in `public/` (for example `public/avatar.jpg`) and set
`avatar: "avatar.jpg"` in `config` at the top of `content/site.ts`. It shows in
grayscale inside the taped frame. Until then the frame is empty.

## Ideas for later

- A stats panel, like a game profile's level and badges (Wakfu hours, books read, chess rating…).

## Notes

Each note is a Markdown file in `content/notes/`, named after its address plus the
language: `my-note.en.md` and/or `my-note.es.md`. Write one or both; with both,
the language switch picks the version. It's published at `/notes/my-note/`, and the
three newest show on the home page. Start the file like this:

```
---
title: My note
date: 2026-11-15
tags: machine learning, c
summary: One or two sentences for the list of notes.
---
```

Then write normally: `##` headings, paragraphs, `-` lists, `**bold**`, `*italic*`,
`` `code` ``, code blocks with three backticks, `[links](https://…)` and images
(put them in `public/notes/` and write `![what it shows](/notes/picture.png)`).

Every build also writes the RSS feeds (`/feed.xml` in English, `/feed.es.xml` in
Spanish) and the link preview images in `public/og/`, so there's nothing to update by
hand. To look at them before publishing, run `npm run feeds` or `npm run og`.

A line starting with `::` places a live figure. These exist (see `components/NoteFigures.tsx`):

- `::moon date=2026-11-17 relief=0 surface=flat info=1 size=large caption="…"`
- `::moons dates="2026-11-13,2026-11-24" labels="Nov 13|Nov 24" caption="…"`
- `::ramp labels="a|b|c" caption="…"` and `::bayer caption="…"`

## Music player

The **Music** widget in the sidebar has two tabs, and it keeps playing while visitors
move between pages.

- **Mine**: your own tracks. Put the files (mp3 or m4a) in `public/music/` and list
  them in `music.tracks` at the top of `content/site.ts`, in the order they should play:
  `{ title: "Night bus", file: "night-bus.mp3" }`. Keep each file under 100 MB (GitHub's
  limit); a 3-minute mp3 at 192 kbps is about 4 MB.
- **Faves**: songs you like. Paste the share link of a public playlist (Apple Music,
  Spotify or YouTube) into `music.playlist`. Its player only loads when a visitor opens
  the tab. Apple Music and Spotify play full songs to their own members and short
  previews to everyone else; that's their rule, not the site's.

Only upload music you made or have the rights to share.

## Updates, guestbook, mood and your button

- **Updates log**: add an entry at the top of `content/updates.ts`. The sidebar shows the
  latest three, and `/updates/` shows them all.
- **Guestbook**: `/guestbook/`. Messages are kept by a small Cloudflare Worker in the
  `guestbook/` folder; set it up once with `guestbook/README.md`, then fill in
  `config.guestbook` in `content/site.ts`. Until then the page says it opens soon.
- **Mood**: comes from imood.com/users/kanu (`config.imood`). Change your mood on imood.
- **Your 88×31 button**: `public/button.gif` (animated; `button.png` is a still copy). The Guestbook page shows it with the code
  others can copy to link to you.
- **The line under "Kanu"**: `epigraph` in `content/site.ts`.

## The Steam Deck panel

The **Daily driver** panel on the Me page shows a turning 3D Steam Deck, drawn by the
`dither-model` package from `public/models/steam-deck.json`. That file is Valve's official
CAD, simplified, and it keeps Valve's license (CC BY-NC-SA 4.0, see `public/models/README.md`):
keep the credit line under the panel. The text is `me.deck` in `content/site.ts`.

To show another STL somewhere, convert it first: `npx dither-model thing.stl -o public/models/thing.json`.

## The cat

Neko, the classic desktop cat, chases the cursor (`components/CursorCat.tsx`). When it
catches up and the cursor stays put, it sits, scratches now and then, and falls asleep;
moving the cursor wakes it up. It only shows on screens with a mouse, and stays asleep
with reduced motion.

The drawing is `public/oneko.gif`, from [oneko.js](https://github.com/adryd325/oneko.js)
by adryd (MIT, `public/oneko.LICENSE.txt`).

## The journal

Entries are sealed on your computer and only the sealed file is published.

1. Write your riddle in `content/journal.ts`, in English and Spanish.
2. Write an entry as `journal/2026-10-28-anything.md` (date first, then any name).
   The first line `# Title` is the title; paragraphs are separated by a blank line.
   To publish an entry in both languages, write a pair with the same name plus the
   language: `2026-10-31-first-step.es.md` and `2026-10-31-first-step.en.md`. The
   page shows the version that matches the language switch, and counts the pair as one entry.
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
- `components/LilyScene.tsx`: the 3D pixel-art lily on the home page
- the moon widget is `<DitherMoon />` from the `dither-moon` package (drag it to turn it)
- `components/TapedPhoto.tsx`: the taped photo next to the wordmark
- `components/Widgets.tsx`: time, weather, now playing, Discord, visitors
- `components/CursorCat.tsx`: the lazy cat (Neko, `public/oneko.gif`)
- `components/MusicPlayer.tsx`: the music widget; the player is the `dither-player` package
- `components/HomePage.tsx`, `MePage.tsx`, `JournalPage.tsx`: the pages
- `lib/seal.mjs`, `scripts/journal.mjs`: sealing and opening the journal
- `components/NotesPage.tsx`, `NoteFigures.tsx`, `lib/notes.ts`, `lib/markdown.ts`: the notes
- `components/WorkPage.tsx`: the Work page; `components/MaskField.tsx` draws its segmentation mask
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
