import type { L } from "./site";
import sealedFile from "./journal.sealed.json";

// Write your riddle here, in both languages. The answer goes nowhere in this
// project: you type it into `npm run journal:seal` on your own computer.
// While both are empty, the Journal page says the riddle is coming soon.
export const riddle: L = {
  en: "I'll always carry you in them...\nE.N.",
  es: "Te llevaré siempre en ellos...\nE.N.",
};

export type SealedEntry = { id: string; date: string; iv: string; data: string; group?: string };
export type Sealed = {
  version: number;
  iterations: number;
  locks: { salt: string; iv: string; key: string }[];
  entries: SealedEntry[];
};

export const sealed = sealedFile as Sealed;
