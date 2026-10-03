-- Cold outreach: researched business targets and send history.
CREATE TABLE IF NOT EXISTS outreach_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  category TEXT,
  location TEXT,
  unsubscribe_token TEXT UNIQUE NOT NULL,
  unsubscribed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_outreach_targets_name ON outreach_targets(business_name);
CREATE INDEX IF NOT EXISTS idx_outreach_targets_unsub ON outreach_targets(unsubscribe_token);

CREATE TABLE IF NOT EXISTS outreach_sends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_id INTEGER NOT NULL REFERENCES outreach_targets(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'sent'
);
CREATE INDEX IF NOT EXISTS idx_outreach_sends_target ON outreach_sends(target_id);
