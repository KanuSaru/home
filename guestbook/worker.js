// Kanu's guestbook: a Cloudflare Worker with a D1 database.
//
//   GET  /entries          approved messages, newest first (public)
//   POST /entries          sign the guestbook (checked by Turnstile, held for approval)
//   GET  /admin?key=…      your private page to approve or delete messages
//
// Settings (see README.md here):
//   DB                 the D1 database (wrangler.toml)
//   ALLOWED_ORIGINS    sites allowed to use it, comma-separated (wrangler.toml)
//   TURNSTILE_SECRET   Turnstile's secret key (a secret: `npx wrangler secret put`)
//   ADMIN_KEY          a long random password for /admin (a secret too)

const LIMITS = { name: 40, website: 120, message: 600, perHour: 3 };

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function cors(request, env) {
  const origin = request.headers.get("origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!allowed.includes(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

/** Compares two strings in constant time, so the admin key can't be guessed by timing. */
function sameSecret(a, b) {
  const x = new TextEncoder().encode(String(a));
  const y = new TextEncoder().encode(String(b));
  if (!x.length || x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

/** A one-way fingerprint of the visitor's IP, only to limit how often one person signs. */
async function fingerprint(ip, salt) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return [...new Uint8Array(bytes)].slice(0, 16).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function clean(s, max) {
  return String(s ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") // control characters, keeping line breaks
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function cleanWebsite(s) {
  const v = clean(s, LIMITS.website);
  if (!v) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
  } catch {
    return "";
  }
}

async function turnstileOk(token, ip, env, fetcher) {
  if (!token || !env.TURNSTILE_SECRET) return false;
  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  const res = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const out = await res.json().catch(() => ({}));
  return out.success === true;
}

async function listEntries(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, name, website, message, created_at FROM entries WHERE approved = 1 ORDER BY created_at DESC, id DESC LIMIT 300",
  ).all();
  return results.map((r) => ({ id: r.id, name: r.name, website: r.website || "", message: r.message, date: r.created_at }));
}

async function sign(request, env, fetcher) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "bad-request" }, 400);
  }
  // a field people never see; bots tend to fill it in
  if (data.company) return json({ ok: true, pending: true }, 202);

  const name = clean(data.name, LIMITS.name);
  const message = clean(data.message, LIMITS.message);
  const website = cleanWebsite(data.website);
  if (!name || !message) return json({ ok: false, error: "missing" }, 400);

  const ip = request.headers.get("cf-connecting-ip") || "";
  if (!(await turnstileOk(data.token, ip, env, fetcher))) return json({ ok: false, error: "check-failed" }, 403);

  const who = await fingerprint(ip, env.ADMIN_KEY || "guestbook");
  const since = new Date(Date.now() - 3600_000).toISOString();
  const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM entries WHERE ip_hash = ? AND created_at > ?")
    .bind(who, since)
    .first();
  if ((recent?.n ?? 0) >= LIMITS.perHour) return json({ ok: false, error: "too-many" }, 429);

  await env.DB.prepare("INSERT INTO entries (name, website, message, created_at, approved, ip_hash) VALUES (?, ?, ?, ?, 0, ?)")
    .bind(name, website, message, new Date().toISOString(), who)
    .run();
  return json({ ok: true, pending: true }, 202);
}

// ---------------------------------------------------------------- admin

function adminPage(pending, approved, key, notice) {
  const row = (e, actions) => `
    <li>
      <p class="meta"><b>${esc(e.name)}</b>${e.website ? ` · <a href="${esc(e.website)}" rel="nofollow noopener" target="_blank">${esc(e.website)}</a>` : ""} · ${esc(e.created_at.slice(0, 16).replace("T", " "))} UTC</p>
      <p class="msg">${esc(e.message)}</p>
      <form method="post">
        <input type="hidden" name="key" value="${esc(key)}"><input type="hidden" name="id" value="${e.id}">
        ${actions}
      </form>
    </li>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Guestbook admin</title>
<style>
body{margin:0;padding:24px 16px;background:#0d0d0c;color:#e7e2d6;font:16px/1.5 system-ui,sans-serif}
main{max-width:44rem;margin:0 auto}h1{font-size:1.5rem}h2{font-size:1.1rem;margin-top:2rem;color:#918c81}
ul{list-style:none;padding:0;display:grid;gap:.75rem}li{border:1px solid #2b2a26;background:#131312;padding:.8rem 1rem}
.meta{margin:0;color:#918c81;font-size:.875rem;overflow-wrap:anywhere}.msg{margin:.4rem 0 .6rem;white-space:pre-wrap;overflow-wrap:anywhere}
a{color:#e7e2d6}button{font:inherit;padding:.25rem .7rem;margin-right:.4rem;cursor:pointer;background:#e7e2d6;color:#0d0d0c;border:1px solid #e7e2d6}
button.no{background:transparent;color:#e7e2d6;border-color:#2b2a26}.notice{border-left:2px solid #7390ff;padding-left:.75rem}
</style></head><body><main>
<h1>Guestbook</h1>
${notice ? `<p class="notice">${esc(notice)}</p>` : ""}
<h2>Waiting for you (${pending.length})</h2>
${pending.length ? `<ul>${pending.map((e) => row(e, `<button formaction="/admin/approve">Approve</button><button class="no" formaction="/admin/delete">Delete</button>`)).join("")}</ul>` : "<p>Nothing new.</p>"}
<h2>On the site (${approved.length})</h2>
${approved.length ? `<ul>${approved.map((e) => row(e, `<button class="no" formaction="/admin/delete">Delete</button>`)).join("")}</ul>` : "<p>None yet.</p>"}
</main></body></html>`;
}

async function admin(request, env, url) {
  const isPost = request.method === "POST";
  const form = isPost ? await request.formData() : null;
  const key = isPost ? form.get("key") : url.searchParams.get("key");
  if (!sameSecret(key, env.ADMIN_KEY)) return new Response("Not found", { status: 404 });

  let notice = "";
  if (isPost) {
    const id = Number(form.get("id"));
    if (url.pathname === "/admin/approve") {
      await env.DB.prepare("UPDATE entries SET approved = 1 WHERE id = ?").bind(id).run();
      notice = "Approved. It's on the site now.";
    } else if (url.pathname === "/admin/delete") {
      await env.DB.prepare("DELETE FROM entries WHERE id = ?").bind(id).run();
      notice = "Deleted.";
    }
  }
  const all = (approved) =>
    env.DB.prepare(
      "SELECT id, name, website, message, created_at FROM entries WHERE approved = ? ORDER BY created_at DESC, id DESC LIMIT 500",
    )
      .bind(approved)
      .all()
      .then((r) => r.results);
  const [pending, approved] = await Promise.all([all(0), all(1)]);
  return new Response(adminPage(pending, approved, key, notice), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY" },
  });
}

// ---------------------------------------------------------------- entry point

export default {
  async fetch(request, env, ctx, fetcher = fetch) {
    const url = new URL(request.url);
    const headers = cors(request, env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

    try {
      if (url.pathname === "/entries" && request.method === "GET") {
        return json({ entries: await listEntries(env) }, 200, { ...headers, "cache-control": "public, max-age=60" });
      }
      if (url.pathname === "/entries" && request.method === "POST") {
        if (!headers["access-control-allow-origin"]) return json({ ok: false, error: "origin" }, 403);
        const res = await sign(request, env, fetcher);
        for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
        return res;
      }
      if (url.pathname.startsWith("/admin")) return admin(request, env, url);
    } catch (err) {
      console.error(err);
      return json({ ok: false, error: "server" }, 500, headers);
    }
    return new Response("Not found", { status: 404 });
  },
};
