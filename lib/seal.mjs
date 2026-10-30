// Sealing for the journal. Used by the browser (to open it) and by
// scripts/journal.mjs (to seal entries on your computer).
//
// How it works: one random journal key encrypts every entry (AES-GCM).
// That key is then locked once per accepted answer, with a key derived from
// the answer (PBKDF2, SHA-256). The answer itself is never stored anywhere.

const enc = new TextEncoder();
const dec = new TextDecoder();
const subtle = () => globalThis.crypto.subtle;

export const ITERATIONS = 600_000;

/** "  Omoide EMANÓN! " -> "omoide emanon": case, accents and punctuation don't matter. */
export function normalizeAnswer(answer) {
  return answer
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function random(n) {
  return globalThis.crypto.getRandomValues(new Uint8Array(n));
}

export function toB64(bytes) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s);
}

export function fromB64(text) {
  return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
}

async function answerKey(answer, salt, iterations) {
  const base = await subtle().importKey("raw", enc.encode(normalizeAnswer(answer)), "PBKDF2", false, ["deriveKey"]);
  return subtle().deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export function importJournalKey(raw) {
  return subtle().importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

/** Lock the raw journal key with one accepted answer. */
export async function makeLock(answer, rawJournalKey, iterations = ITERATIONS) {
  const salt = random(16);
  const iv = random(12);
  const key = await answerKey(answer, salt, iterations);
  const wrapped = await subtle().encrypt({ name: "AES-GCM", iv }, key, rawJournalKey);
  return { salt: toB64(salt), iv: toB64(iv), key: toB64(wrapped) };
}

/** Try an answer against every lock. Returns the raw journal key, or null. */
export async function openWithAnswer(sealed, answer) {
  if (!normalizeAnswer(answer)) return null;
  for (const lock of sealed.locks) {
    try {
      const key = await answerKey(answer, fromB64(lock.salt), sealed.iterations);
      const raw = await subtle().decrypt({ name: "AES-GCM", iv: fromB64(lock.iv) }, key, fromB64(lock.key));
      return new Uint8Array(raw);
    } catch {
      // wrong answer for this lock; try the next one
    }
  }
  return null;
}

/** Encrypt one entry's private part ({ file, title, body }). */
export async function sealEntry(journalKey, id, date, secret) {
  const iv = random(12);
  const data = await subtle().encrypt({ name: "AES-GCM", iv }, journalKey, enc.encode(JSON.stringify(secret)));
  return { id, date, iv: toB64(iv), data: toB64(data) };
}

export async function openEntry(journalKey, entry) {
  const plain = await subtle().decrypt({ name: "AES-GCM", iv: fromB64(entry.iv) }, journalKey, fromB64(entry.data));
  return JSON.parse(dec.decode(plain));
}

export async function entryId(fileName) {
  const hash = await subtle().digest("SHA-256", enc.encode(fileName));
  return toB64(hash).replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
}
