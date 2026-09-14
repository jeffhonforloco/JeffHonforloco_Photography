-- Phase 5 private Growth Command Center.
-- Apply explicitly after review; all access is through authenticated admin Worker routes.

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_key TEXT NOT NULL,
  succeeded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_key ON admin_login_attempts(attempt_key, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_revoked_tokens (
  jti TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  revoked_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS growth_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  status TEXT NOT NULL DEFAULT 'unread',
  source_record_type TEXT,
  source_record_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  read_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_growth_notifications_status ON growth_notifications(status, created_at DESC);

CREATE TABLE IF NOT EXISTS growth_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  problem TEXT NOT NULL,
  evidence TEXT NOT NULL,
  next_action TEXT NOT NULL,
  service TEXT,
  query TEXT,
  competitor_id INTEGER,
  priority TEXT NOT NULL CHECK (priority IN ('P0','P1','P2','P3')),
  impact TEXT NOT NULL CHECK (impact IN ('high','medium','low')),
  effort TEXT NOT NULL CHECK (effort IN ('high','medium','low')),
  risk TEXT NOT NULL CHECK (risk IN ('high','medium','low')),
  action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New','Reviewed','Approved','In Progress','PR Ready','Completed','Dismissed','Monitor')),
  source TEXT NOT NULL DEFAULT 'manual',
  source_timestamp TEXT,
  confidence TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (competitor_id) REFERENCES competitors(id)
);
CREATE INDEX IF NOT EXISTS idx_growth_recommendations_status ON growth_recommendations(status, priority);

CREATE TABLE IF NOT EXISTS competitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  market TEXT,
  services TEXT,
  priority TEXT NOT NULL DEFAULT 'P2',
  active INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'Phase 4 research',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competitor_id INTEGER NOT NULL,
  source_url TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  h1 TEXT,
  sitemap_fingerprint TEXT,
  schema_fingerprint TEXT,
  page_fingerprint TEXT,
  review_count INTEGER,
  observed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_competitor_snapshots_competitor ON competitor_snapshots(competitor_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS competitor_change_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competitor_id INTEGER NOT NULL,
  change_type TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  related_service TEXT,
  related_query TEXT,
  estimated_impact TEXT,
  evidence_url TEXT,
  detected_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS search_query_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL UNIQUE,
  service TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS search_query_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  source TEXT NOT NULL,
  observed_position TEXT,
  landing_page TEXT,
  notes TEXT,
  confidence TEXT,
  location_context TEXT,
  device_context TEXT,
  impressions INTEGER,
  clicks INTEGER,
  ctr REAL,
  average_position REAL,
  observed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_search_query_snapshots_query ON search_query_snapshots(query, observed_at DESC);

CREATE TABLE IF NOT EXISTS ai_query_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt TEXT NOT NULL UNIQUE,
  service TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_visibility_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  test_prompt TEXT NOT NULL,
  jeff_surfaced TEXT NOT NULL CHECK (jeff_surfaced IN ('yes','no','unclear')),
  citation_url TEXT,
  competitors_surfaced TEXT,
  notes TEXT,
  confidence TEXT,
  source TEXT NOT NULL DEFAULT 'manual observation',
  observed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_tests_provider ON ai_visibility_tests(provider, observed_at DESC);

CREATE TABLE IF NOT EXISTS authority_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('P0','P1','P2','P3')),
  why TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  owner TEXT,
  due_date TEXT,
  evidence TEXT,
  verification TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS performance_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device TEXT NOT NULL CHECK (device IN ('mobile','desktop')),
  performance_score INTEGER NOT NULL,
  accessibility_score INTEGER,
  best_practices_score INTEGER,
  seo_score INTEGER,
  lcp_ms INTEGER,
  tbt_ms INTEGER,
  cls REAL,
  source_url TEXT,
  source TEXT NOT NULL DEFAULT 'Lighthouse',
  measured_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_health_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  check_name TEXT NOT NULL,
  scope TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pass','fail','warning','not_tested')),
  evidence TEXT,
  latency_ms INTEGER,
  requires_human_submission INTEGER,
  source TEXT NOT NULL,
  checked_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_site_health_name ON site_health_snapshots(check_name, checked_at DESC);

CREATE TABLE IF NOT EXISTS growth_fix_proposals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recommendation_id INTEGER NOT NULL,
  proposed_changes TEXT NOT NULL,
  test_plan TEXT NOT NULL,
  branch_plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Prepared' CHECK (status IN ('Prepared','Approved','In Progress','PR Ready','Closed')),
  github_pr_url TEXT,
  prepared_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (recommendation_id) REFERENCES growth_recommendations(id),
  FOREIGN KEY (prepared_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS growth_experiments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recommendation_id INTEGER,
  implemented_at TEXT,
  before_metrics TEXT,
  after_metrics TEXT,
  affected_service TEXT,
  affected_queries TEXT,
  traffic_change TEXT,
  lead_change TEXT,
  booking_change TEXT,
  outcome TEXT NOT NULL DEFAULT 'Insufficient data' CHECK (outcome IN ('Positive','Neutral','Negative','Insufficient data')),
  evidence_strength TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (recommendation_id) REFERENCES growth_recommendations(id)
);

CREATE TABLE IF NOT EXISTS monitoring_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cadence TEXT NOT NULL CHECK (cadence IN ('daily','weekly','monthly')),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  result_summary TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO search_query_definitions (query, service) VALUES
('photographer Providence RI','general'),('photographer in Providence','general'),('Rhode Island photographer','general'),
('photographer Rhode Island','general'),('photographers New England','general'),('wedding photographer Providence RI','wedding'),
('Rhode Island wedding photographer','wedding'),('engagement photographer Providence RI','engagement'),
('Sweet 16 photographer Providence RI','sweet-16'),('quinceanera photographer Rhode Island','sweet-16'),
('headshot photographer Providence RI','headshots'),('fashion photographer Providence RI','fashion'),
('commercial photographer Providence RI','commercial'),('real estate photographer Providence RI','real-estate');

INSERT OR IGNORE INTO ai_query_templates (prompt, service) VALUES
('Find a photographer in Providence Rhode Island.','general'),('Find a wedding photographer in Providence.','wedding'),
('Find an engagement photographer in Rhode Island.','engagement'),('Find a Sweet 16 photographer in Providence.','sweet-16'),
('Find a headshot photographer near Providence.','headshots'),('Find an editorial photographer in New England.','editorial');

INSERT OR IGNORE INTO authority_tasks (task, category, priority, why, status, owner) VALUES
('Confirm canonical business name, phone, email, and Providence base','Identity cleanup','P1','Consistent identity strengthens entity recognition across search and referral sources.','New','Jeff'),
('Claim or verify primary local business profiles','Google Business','P1','Owned profiles provide a controllable local discovery surface.','New','Jeff'),
('Request correction of obsolete Didit360, Tarvico, Wisdom Avenue, or old-phone records','Identity cleanup','P1','Conflicting public identities can weaken trust and route prospects incorrectly.','New','Jeff'),
('Submit sitemap and inspect nine service pages after deployment','Citation','P1','Confirms search systems can discover the approved service architecture.','New','Jeff'),
('Prepare one permissioned Rhode Island wedding or venue story','Venue relationship','P2','Firsthand local proof supports discovery without relying on review volume.','New','Jeff'),
('Prepare a permissioned corporate headshot case study','Partnership','P2','A real B2B proof asset can improve qualification and referral confidence.','New','Jeff');

INSERT OR IGNORE INTO competitors (domain, name, category, market, priority) VALUES
('lindsayadlerphotography.com','Lindsay Adler Photography','E','Fashion / beauty authority','P3'),
('piperbrownphotography.com','Piper Brown Photography','A','Providence wedding','P1'),
('kimkeune.com','Kim Keune','A','Greater Providence headshots','P1'),
('makaylarogersphotography.com','Makayla Rogers Photography','B','Providence boudoir','P3'),
('mduranstudio.com','M Duran Studio','A','Providence / Boston commercial','P1'),
('smithbrad.com','Brad Smith Photography','C','Regional wedding','P2'),
('jessicatonyaphotography.com','Jessica Tonya Photography','A','North Providence milestones','P1'),
('mindonphotography.com','Mind On Photography','C','New England wedding','P2'),
('bengebo.com','Ben Gebo Photography','E','Boston commercial / editorial','P2'),
('movemountains.co','Move Mountains Co.','C','Regional wedding photo / video','P1'),
('stacysmithstudios.com','Stacy Smith Studios','A','Local headshots / branding','P1'),
('jamesanthonyphotography.com','James Anthony Photography','A','Rhode Island wedding / event','P1'),
('phunfotos.com','Phun Fotos','A','Providence multi-service','P2'),
('neilanmedia.com','Neilan Media','A','Providence wedding photo / video','P1'),
('photobyfriday.com','Photo by Friday','B','Rhode Island dance / headshots','P2'),
('capriocapturedphotography.com','Caprio Captured Photography','C','Newport wedding','P2'),
('graphicole.com','Graphicole','A','Providence branding / commercial','P1');
