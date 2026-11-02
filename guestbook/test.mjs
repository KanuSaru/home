// Runs the worker against an in-memory database: node guestbook/test.mjs
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import assert from "node:assert/strict";
import worker from "./worker.js";

const sql = new DatabaseSync(":memory:");
sql.exec(fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
// the small part of Cloudflare D1's API the worker uses
const DB = {
  prepare(q) {
    let args = [];
    const st = {
      bind: (...a) => ((args = a), st),
      all: async () => ({ results: sql.prepare(q).all(...args) }),
      first: async () => sql.prepare(q).get(...args) ?? null,
      run: async () => sql.prepare(q).run(...args),
    };
    return st;
  },
};
const env = { DB, ALLOWED_ORIGINS: "https://kanusaru.github.io", TURNSTILE_SECRET: "s", ADMIN_KEY: "k".repeat(32) };
const turnstile = async (_url, init) =>
  new Response(JSON.stringify({ success: init.body.get("response") === "good-token" }));
const site = "https://kanusaru.github.io";
const call = (path, init = {}) => worker.fetch(new Request(`https://gb.example${path}`, init), env, {}, turnstile);
const sign = (body, ip = "1.2.3.4") =>
  call("/entries", {
    method: "POST",
    headers: { origin: site, "content-type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify(body),
  });

let r = await sign({ name: "Ana", message: "Hola!", token: "good-token", website: "ana.neocities.org" });
assert.equal(r.status, 202);
assert.equal(r.headers.get("access-control-allow-origin"), site);
assert.equal((await (await call("/entries")).json()).entries.length, 0, "held until approved");

r = await sign({ name: "Bot", message: "spam", token: "bad" });
assert.equal(r.status, 403, "Turnstile failure is refused");
r = await sign({ name: "Bot", message: "spam", token: "good-token", company: "x" });
assert.equal(r.status, 202, "trap field: pretends to work");
r = await call("/entries", { method: "POST", headers: { origin: "https://evil.example" }, body: "{}" });
assert.equal(r.status, 403, "other sites can't post");
r = await sign({ name: "", message: "x", token: "good-token" });
assert.equal(r.status, 400, "name required");

for (let i = 0; i < 2; i++) await sign({ name: "Ana", message: `again ${i}`, token: "good-token" });
r = await sign({ name: "Ana", message: "fourth", token: "good-token" });
assert.equal(r.status, 429, "3 per hour per person");

assert.equal((await call("/admin?key=wrong")).status, 404);
let page = await (await call(`/admin?key=${env.ADMIN_KEY}`)).text();
assert.match(page, /Waiting for you \(3\)/);
assert.doesNotMatch(page, /spam/);

const form = new FormData();
form.append("key", env.ADMIN_KEY);
form.append("id", "1");
page = await (await call("/admin/approve", { method: "POST", body: form })).text();
assert.match(page, /Approved/);
const list = (await (await call("/entries")).json()).entries;
assert.equal(list.length, 1);
assert.equal(list[0].name, "Ana");
assert.equal(list[0].website, "https://ana.neocities.org/");

r = await sign({ name: "<b>x</b>", message: "<script>alert(1)</script>", token: "good-token" }, "5.6.7.8");
page = await (await call(`/admin?key=${env.ADMIN_KEY}`)).text();
assert.doesNotMatch(page, /<script>alert/, "admin page escapes messages");
console.log("guestbook worker: all checks passed");
