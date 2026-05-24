CREATE TABLE IF NOT EXISTS posts (
  id          TEXT    PRIMARY KEY,
  title       TEXT    NOT NULL,
  slug        TEXT    NOT NULL UNIQUE,
  excerpt     TEXT    NOT NULL,
  content     TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  image       TEXT    NOT NULL,
  date        TEXT    NOT NULL,
  read_time   TEXT    NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_posts_category   ON posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
