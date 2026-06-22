-- Users (admin accounts)
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    UNIQUE NOT NULL,
  email         TEXT    UNIQUE NOT NULL,
  password_hash TEXT    NOT NULL,
  password_salt TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'admin',
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Contacts / booking inquiries
CREATE TABLE IF NOT EXISTS contacts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT    NOT NULL,
  email         TEXT    NOT NULL,
  phone         TEXT,
  message       TEXT    NOT NULL,
  service_type  TEXT,
  budget_range  TEXT,
  event_date    TEXT,
  location      TEXT,
  status        TEXT    NOT NULL DEFAULT 'new',
  notes         TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contacts_email      ON contacts (email);
CREATE INDEX IF NOT EXISTS idx_contacts_status     ON contacts (status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);

-- Blog posts (manual + AI-generated journal posts)
CREATE TABLE IF NOT EXISTS blog_posts (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  title             TEXT    NOT NULL,
  slug              TEXT    UNIQUE NOT NULL,
  content           TEXT    NOT NULL,
  excerpt           TEXT,
  featured_image_url TEXT,
  category          TEXT    NOT NULL DEFAULT 'Photography Tips & Techniques',
  status            TEXT    NOT NULL DEFAULT 'published',
  read_time         TEXT    NOT NULL DEFAULT '5 min read',
  tags              TEXT,
  published_at      TEXT,
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_blog_slug       ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_status     ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_category   ON blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_created_at ON blog_posts (created_at DESC);

-- Portfolio images
CREATE TABLE IF NOT EXISTS portfolio_images (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT    NOT NULL,
  description   TEXT,
  image_url     TEXT    NOT NULL,
  thumbnail_url TEXT,
  category      TEXT    NOT NULL,
  is_featured   INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  tags          TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_portfolio_category   ON portfolio_images (category);
CREATE INDEX IF NOT EXISTS idx_portfolio_is_featured ON portfolio_images (is_featured);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT    NOT NULL,
  event_data TEXT,
  user_agent TEXT,
  ip_address TEXT,
  referrer   TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics (created_at DESC);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    UNIQUE NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Editable email templates used by lead follow-up automation
CREATE TABLE IF NOT EXISTS email_templates (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    UNIQUE NOT NULL,
  subject    TEXT    NOT NULL,
  content    TEXT    NOT NULL,
  is_active  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Scheduled automated emails for contact and chat leads
CREATE TABLE IF NOT EXISTS email_sequences (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id     INTEGER NOT NULL,
  sequence_type  TEXT    NOT NULL,
  step_number    INTEGER NOT NULL,
  email_template TEXT    NOT NULL,
  scheduled_for  TEXT    NOT NULL,
  sent_at        TEXT,
  status         TEXT    NOT NULL DEFAULT 'pending',
  last_error     TEXT,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(contact_id, sequence_type, step_number)
);
CREATE INDEX IF NOT EXISTS idx_email_sequences_due     ON email_sequences (status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_sequences_contact ON email_sequences (contact_id);

-- Emails that should not receive marketing/follow-up automation
CREATE TABLE IF NOT EXISTS email_suppression (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    UNIQUE NOT NULL,
  reason     TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_email_suppression_email ON email_suppression (email);
