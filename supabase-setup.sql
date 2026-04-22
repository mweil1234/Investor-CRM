-- =============================================================
-- Biz Development CRM — Supabase Setup
-- =============================================================
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This creates the contacts table, enables Row Level Security,
-- and sets up a public policy so authenticated/anon users can CRUD.
-- =============================================================

-- 1. Create the contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  title         TEXT DEFAULT '',
  company       TEXT DEFAULT '',
  dri           TEXT DEFAULT '',
  support       TEXT DEFAULT '',
  status        TEXT DEFAULT '',
  priority      TEXT DEFAULT '' CHECK (priority IN ('', 'HOT', 'WARM', 'COLD')),
  last_contact  TEXT DEFAULT '',
  contact_date  DATE,
  source        TEXT DEFAULT '',
  project       TEXT DEFAULT '',
  notes         TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  email         TEXT DEFAULT '',
  pitch_status  TEXT DEFAULT '' CHECK (pitch_status IN ('', 'Pitched previously', 'Never been pitched', 'Existing Investor')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS (required by Supabase)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 3. Create a permissive policy for all operations
--    Since we handle auth at the app level (password gate),
--    we allow all operations for the anon key.
CREATE POLICY "Allow all access" ON contacts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- 5. Create indexes for common queries
CREATE INDEX idx_contacts_priority ON contacts (priority);
CREATE INDEX idx_contacts_pitch_status ON contacts (pitch_status);
CREATE INDEX idx_contacts_dri ON contacts (dri);
CREATE INDEX idx_contacts_name ON contacts (name);
