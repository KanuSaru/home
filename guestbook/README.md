# The guestbook

The Guestbook page talks to a small Cloudflare Worker that keeps the messages. That
worker now lives in its own project, so other people can set one up too:

**https://github.com/KanuSaru/leave-a-mark**

Everything about it is in that project's README: publishing the worker, approving
messages at `/admin`, and the Discord and email alerts.

What stays in this site:

- `components/GuestbookPage.tsx`, the page itself.
- `config.guestbook` in `content/site.ts`: the worker's address and Turnstile's **site**
  key (the public one). Secrets never go in this repo.
