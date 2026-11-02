# The guestbook

The Guestbook page on the site talks to this small Cloudflare Worker, which keeps the
messages in a free Cloudflare D1 database. New messages wait until you approve them,
and Cloudflare Turnstile keeps bots out. All of this fits in Cloudflare's free plan.

Test it locally any time: `node guestbook/test.mjs`.

## Set it up (once, about 15 minutes)

1. **Make a free Cloudflare account** at dash.cloudflare.com (no credit card needed).

2. **Log in from this folder:**
   ```bash
   cd guestbook
   npx wrangler login
   ```

3. **Create the database** and copy the `database_id` it prints into `wrangler.toml`:
   ```bash
   npx wrangler d1 create kanu-guestbook
   npx wrangler d1 execute kanu-guestbook --remote --file=schema.sql
   ```

4. **Create the Turnstile check.** In the Cloudflare dashboard: Turnstile → Add widget.
   Name it "Guestbook", add the hostnames `kanusaru.github.io` and `localhost`, mode
   **Managed**. It gives you a **site key** (public) and a **secret key** (private).

5. **Store the two secrets** (each command asks you to paste the value):
   ```bash
   npx wrangler secret put TURNSTILE_SECRET   # the Turnstile secret key
   npx wrangler secret put ADMIN_KEY          # a long random password, e.g. from: openssl rand -hex 24
   ```
   Save the ADMIN_KEY somewhere private (a password manager). It's the key to your admin page.

6. **Publish the worker:**
   ```bash
   npx wrangler deploy
   ```
   It prints its address, like `https://kanu-guestbook.YOURNAME.workers.dev`.

7. **Connect the site:** in `content/site.ts`, fill in `config.guestbook`:
   ```ts
   guestbook: {
     api: "https://kanu-guestbook.YOURNAME.workers.dev",
     turnstileSiteKey: "0x4AAAA…", // the site key from step 4
   },
   ```
   Then build and push the site as usual.

## Approving messages

Open `https://kanu-guestbook.YOURNAME.workers.dev/admin?key=YOUR_ADMIN_KEY` (bookmark it,
and never share it). New messages wait at the top: **Approve** puts them on the site,
**Delete** removes them. Approved ones can be deleted later too.

The site checks for new approved messages every time someone opens the Guestbook page
(Cloudflare may keep a copy for up to a minute).

## Good to know

- With your own domain later, add it to `ALLOWED_ORIGINS` in `wrangler.toml` and to the
  Turnstile hostnames, then `npx wrangler deploy` again.
- Each person can sign up to 3 times an hour. Their IP address is never stored, only a
  one-way fingerprint of it for that limit.
- Messages are up to 600 characters, names up to 40.
