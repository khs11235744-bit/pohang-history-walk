CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  invite_hash TEXT NOT NULL UNIQUE,
  student TEXT NOT NULL,
  topic TEXT NOT NULL,
  payload TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'revision', 'reviewed')),
  reviewer TEXT,
  review_note TEXT,
  reviewed_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);
