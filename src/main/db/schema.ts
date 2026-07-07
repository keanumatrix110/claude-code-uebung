export const SCHEMA_SQL = `
-- Finanzplaner Datenbankschema
-- Alle Geldbeträge werden als Integer in Cent gespeichert (keine Floats!).

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_fixed_cost INTEGER NOT NULL DEFAULT 0 CHECK (is_fixed_cost IN (0, 1)),
  color TEXT NOT NULL DEFAULT '#4C6EF5',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (name, type)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  note TEXT,
  recurring_id INTEGER REFERENCES recurring_transactions(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

CREATE TABLE IF NOT EXISTS transaction_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  changed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_transaction ON transaction_audit_log(transaction_id);

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 28),
  start_date TEXT NOT NULL,
  end_date TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  last_generated_month TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  target_amount_cents INTEGER NOT NULL CHECK (target_amount_cents > 0),
  target_date TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS savings_contributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id INTEGER NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_contributions_goal ON savings_contributions(goal_id);

CREATE TABLE IF NOT EXISTS investments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stock', 'etf', 'fund', 'bond', 'crypto', 'other')),
  ticker TEXT,
  quantity REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS investment_valuations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  investment_id INTEGER NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  value_cents INTEGER NOT NULL CHECK (value_cents >= 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (investment_id, date)
);

CREATE INDEX IF NOT EXISTS idx_valuations_investment ON investment_valuations(investment_id);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Audit-Trigger: protokollieren jede inhaltliche Änderung einer Buchung.
CREATE TRIGGER IF NOT EXISTS trg_transactions_audit_date
AFTER UPDATE OF date ON transactions
WHEN OLD.date IS NOT NEW.date
BEGIN
  INSERT INTO transaction_audit_log (transaction_id, field, old_value, new_value)
  VALUES (NEW.id, 'date', OLD.date, NEW.date);
END;

CREATE TRIGGER IF NOT EXISTS trg_transactions_audit_amount
AFTER UPDATE OF amount_cents ON transactions
WHEN OLD.amount_cents IS NOT NEW.amount_cents
BEGIN
  INSERT INTO transaction_audit_log (transaction_id, field, old_value, new_value)
  VALUES (NEW.id, 'amount_cents', OLD.amount_cents, NEW.amount_cents);
END;

CREATE TRIGGER IF NOT EXISTS trg_transactions_audit_type
AFTER UPDATE OF type ON transactions
WHEN OLD.type IS NOT NEW.type
BEGIN
  INSERT INTO transaction_audit_log (transaction_id, field, old_value, new_value)
  VALUES (NEW.id, 'type', OLD.type, NEW.type);
END;

CREATE TRIGGER IF NOT EXISTS trg_transactions_audit_category_id
AFTER UPDATE OF category_id ON transactions
WHEN OLD.category_id IS NOT NEW.category_id
BEGIN
  INSERT INTO transaction_audit_log (transaction_id, field, old_value, new_value)
  VALUES (NEW.id, 'category_id', OLD.category_id, NEW.category_id);
END;

CREATE TRIGGER IF NOT EXISTS trg_transactions_audit_description
AFTER UPDATE OF description ON transactions
WHEN OLD.description IS NOT NEW.description
BEGIN
  INSERT INTO transaction_audit_log (transaction_id, field, old_value, new_value)
  VALUES (NEW.id, 'description', OLD.description, NEW.description);
END;

CREATE TRIGGER IF NOT EXISTS trg_transactions_audit_note
AFTER UPDATE OF note ON transactions
WHEN OLD.note IS NOT NEW.note
BEGIN
  INSERT INTO transaction_audit_log (transaction_id, field, old_value, new_value)
  VALUES (NEW.id, 'note', OLD.note, NEW.note);
END;

CREATE TRIGGER IF NOT EXISTS trg_transactions_touch_updated_at
AFTER UPDATE ON transactions
WHEN OLD.updated_at IS NEW.updated_at
BEGIN
  UPDATE transactions SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;
`
