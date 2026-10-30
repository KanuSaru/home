#!/usr/bin/env node
// Seal journal entries on your computer. Only the sealed file is published.
//
//   npm run journal:seal      seal every entry in journal/ (first run sets the accepted answers)
//   npm run journal:unseal    write the sealed entries back into journal/ (recovery)
//   npm run journal:answers   change the accepted answers, keeping every entry
//
// Write entries as journal/YYYY-MM-DD-anything.md, first line "# Title".
// The journal/ folder is in .gitignore: never commit it.
//
// For scripts and tests: JOURNAL_DIR, JOURNAL_FILE, JOURNAL_ANSWER (to open)
// and JOURNAL_ANSWERS (accepted answers, separated by |) skip the prompts.

import { webcrypto } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

globalThis.crypto ??= webcrypto;
const seal = await import("../lib/seal.mjs");

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = process.env.JOURNAL_DIR ?? path.join(root, "journal");
const FILE = process.env.JOURNAL_FILE ?? path.join(root, "content", "journal.sealed.json");

async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer;
}

function fail(message) {
  console.error(`\n${message}`);
  process.exit(1);
}

async function load() {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return { version: 1, iterations: seal.ITERATIONS, locks: [], entries: [] };
  }
}

async function save(sealed) {
  sealed.entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(sealed, null, 2) + "\n");
}

async function acceptedAnswers(prompt) {
  const raw = process.env.JOURNAL_ANSWERS ?? (await ask(prompt));
  const answers = [...new Set(raw.split("|").map((a) => a.trim()).filter((a) => seal.normalizeAnswer(a)))];
  if (!answers.length) fail("No answers given. Nothing changed.");
  return answers;
}

async function lockWith(sealed, answers, raw) {
  sealed.locks = [];
  for (const a of answers) sealed.locks.push(await seal.makeLock(a, raw, sealed.iterations));
  console.log(`Accepted answers (as matched): ${answers.map((a) => `"${seal.normalizeAnswer(a)}"`).join(", ")}`);
}

async function unlock(sealed) {
  const answer = process.env.JOURNAL_ANSWER ?? (await ask("Answer to your riddle: "));
  const raw = await seal.openWithAnswer(sealed, answer);
  if (!raw) fail("That answer doesn't open the journal. Nothing changed.");
  return raw;
}

function parseEntry(file, text) {
  const date = file.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  if (!date) fail(`"${file}" needs a date at the start of its name, like 2026-10-28-${file}`);
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const first = lines.findIndex((l) => l.trim());
  const hasTitle = first >= 0 && lines[first].startsWith("# ");
  const title = hasTitle ? lines[first].slice(2).trim() : "";
  const body = (hasTitle ? lines.slice(first + 1) : lines).join("\n").trim();
  return { date, secret: { file, title, body } };
}

async function cmdSeal() {
  const sealed = await load();
  let raw;
  if (!sealed.locks.length) {
    console.log("First seal. Choose the answers that open your journal.");
    console.log("Case, accents and punctuation don't matter. Give one per language if you like.");
    raw = seal.random(32);
    await lockWith(sealed, await acceptedAnswers("Accepted answers, separated by | : "), raw);
  } else {
    raw = await unlock(sealed);
  }
  const key = await seal.importJournalKey(raw);

  let files = [];
  try {
    files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".md")).sort();
  } catch {
    await fs.mkdir(DIR, { recursive: true });
  }

  let changed = 0;
  for (const file of files) {
    const { date, secret } = parseEntry(file, await fs.readFile(path.join(DIR, file), "utf8"));
    const id = await seal.entryId(file);
    const entry = await seal.sealEntry(key, id, date, secret);
    const at = sealed.entries.findIndex((e) => e.id === id);
    if (at >= 0) sealed.entries[at] = entry;
    else sealed.entries.push(entry);
    changed++;
  }
  await save(sealed);
  console.log(`Sealed ${changed} file(s) from ${path.relative(root, DIR) || DIR}. The journal now has ${sealed.entries.length} entr${sealed.entries.length === 1 ? "y" : "ies"}.`);
  console.log(`Publish ${path.relative(root, FILE)}; keep journal/ to yourself.`);
}

async function cmdUnseal() {
  const sealed = await load();
  if (!sealed.locks.length) fail("Nothing has been sealed yet.");
  const key = await seal.importJournalKey(await unlock(sealed));
  await fs.mkdir(DIR, { recursive: true });
  for (const entry of sealed.entries) {
    const { file, title, body } = await seal.openEntry(key, entry);
    await fs.writeFile(path.join(DIR, file), `${title ? `# ${title}\n\n` : ""}${body}\n`);
  }
  console.log(`Wrote ${sealed.entries.length} entr${sealed.entries.length === 1 ? "y" : "ies"} to ${path.relative(root, DIR) || DIR}.`);
}

async function cmdAnswers() {
  const sealed = await load();
  if (!sealed.locks.length) fail("Nothing has been sealed yet. Run journal:seal first.");
  const raw = await unlock(sealed);
  await lockWith(sealed, await acceptedAnswers("New accepted answers, separated by | : "), raw);
  await save(sealed);
  console.log("Answers changed. Every entry is still readable with the new answers, and the old ones no longer work.");
}

const command = process.argv[2];
if (command === "seal") await cmdSeal();
else if (command === "unseal") await cmdUnseal();
else if (command === "answers") await cmdAnswers();
else fail("Use: node scripts/journal.mjs seal | unseal | answers");
