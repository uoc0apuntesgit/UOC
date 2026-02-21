-- ====================================================
-- UOC PLANNER — Database Schema
-- Run this in the Supabase SQL editor
-- ====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------
-- USERS (Raul & Miguel Angel)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name     TEXT NOT NULL UNIQUE,
  password TEXT
);

-- ----------------------------------------
-- COURSES (Asignaturas)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id      SERIAL PRIMARY KEY,
  code    TEXT UNIQUE,
  name    TEXT NOT NULL,
  credits INTEGER DEFAULT 6,
  color   TEXT NOT NULL DEFAULT '#3b82f6'
);

-- ----------------------------------------
-- TASKS (Tareas, PECs, PRAs, Exámenes)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id   INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  user_id     UUID    REFERENCES users(id)   ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  start_date  TIMESTAMPTZ NOT NULL,
  end_date    TIMESTAMPTZ NOT NULL,
  progress    INTEGER     DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  type        TEXT        CHECK (type IN ('PEC','PRA','EX','PS','LECTURA')),
  completed   BOOLEAN     DEFAULT FALSE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------------------
-- ROW LEVEL SECURITY (optional)
-- ----------------------------------------
ALTER TABLE users   ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks   ENABLE ROW LEVEL SECURITY;

-- Public read for courses (shared catalog)
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read users"   ON users   FOR SELECT USING (true);

-- Tasks: any authenticated user can read all (shared planning)
CREATE POLICY "Read all tasks"   ON tasks FOR SELECT USING (true);
CREATE POLICY "Insert own tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Update own tasks" ON tasks FOR UPDATE USING (true);
