-- The guestbook's one table. Run once:
--   npx wrangler d1 execute kanu-guestbook --remote --file=schema.sql
CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  website TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,      -- ISO time, UTC
  approved INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT                   -- a one-way fingerprint, only for the hourly limit
);
CREATE INDEX IF NOT EXISTS entries_by_state ON entries (approved, created_at);
CREATE INDEX IF NOT EXISTS entries_by_visitor ON entries (ip_hash, created_at);
