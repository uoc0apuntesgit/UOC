-- ====================================================
-- UOC PLANNER — Seed Data
-- Run AFTER schema.sql
-- ====================================================

-- ----------------------------------------
-- USERS
-- ----------------------------------------
INSERT INTO users (name) VALUES ('Raul'), ('Miguel Angel')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------
-- COURSES (typical UOC GEI subjects)
-- ----------------------------------------
INSERT INTO courses (code, name, credits, color) VALUES
  ('75.441', 'Lógica',                     6, '#6366f1'),
  ('75.442', 'Estadística',                6, '#f59e0b'),
  ('75.443', 'Programación',               6, '#10b981'),
  ('75.444', 'Redes de Computadores',      6, '#3b82f6'),
  ('75.445', 'Inglés Técnico',             6, '#ec4899'),
  ('75.446', 'Sistemas Operativos',        6, '#8b5cf6'),
  ('75.447', 'Bases de Datos',             6, '#14b8a6')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------
-- SAMPLE TASKS (Semester 2026/S1)
-- ----------------------------------------
-- We reference users by lookup subqueries
INSERT INTO tasks (course_id, user_id, title, start_date, end_date, type, progress)
SELECT
  c.id,
  u.id,
  t.title,
  t.start_date::TIMESTAMPTZ,
  t.end_date::TIMESTAMPTZ,
  t.type,
  t.progress
FROM (VALUES
  -- Lógica
  ('75.441','Raul','PEC 1 — Lógica proposicional','2026-02-16','2026-02-28','PEC',0),
  ('75.441','Raul','PEC 2 — Lógica de predicados','2026-03-16','2026-03-30','PEC',0),
  ('75.441','Raul','Prueba de síntesis — Lógica','2026-06-01','2026-06-07','EX',0),
  -- Estadística
  ('75.442','Raul','PEC 1 — Probabilidad','2026-02-20','2026-03-10','PEC',0),
  ('75.442','Raul','PEC 2 — Distribuciones','2026-03-23','2026-04-06','PEC',0),
  ('75.442','Raul','Prueba de síntesis — Estadística','2026-06-08','2026-06-14','EX',0),
  -- Programación
  ('75.443','Raul','PRA 1 — Fundamentos Python','2026-02-18','2026-03-04','PRA',0),
  ('75.443','Raul','PRA 2 — POO','2026-03-18','2026-04-01','PRA',0),
  ('75.443','Raul','PEC 1 — Algoritmia','2026-04-14','2026-04-28','PEC',0),
  -- Redes
  ('75.444','Raul','PEC 1 — Modelos OSI','2026-02-25','2026-03-11','PEC',0),
  ('75.444','Raul','PEC 2 — Capa de red','2026-04-01','2026-04-15','PEC',0),
  ('75.444','Raul','PRAC — Laboratorio Wireshark','2026-05-01','2026-05-20','PRA',0),
  -- Inglés
  ('75.445','Raul','PS — Speaking A','2026-03-01','2026-03-15','PS',0),
  ('75.445','Raul','PS — Writing B','2026-04-10','2026-04-24','PS',0)
) AS t(course_code, user_name, title, start_date, end_date, type, progress)
JOIN courses c ON c.code = t.course_code
JOIN users   u ON u.name = t.user_name;
-- Miguel Angel tasks (subset)
INSERT INTO tasks (course_id, user_id, title, start_date, end_date, type, progress)
SELECT
  c.id, u.id,
  t.title, t.start_date::TIMESTAMPTZ, t.end_date::TIMESTAMPTZ, t.type, t.progress
FROM (VALUES
  ('75.441','Miguel Angel','PEC 1 — Lógica proposicional','2026-02-16','2026-02-28','PEC',0),
  ('75.441','Miguel Angel','PEC 2 — Lógica de predicados','2026-03-16','2026-03-30','PEC',0),
  ('75.442','Miguel Angel','PEC 1 — Probabilidad','2026-02-20','2026-03-10','PEC',0),
  ('75.442','Miguel Angel','PEC 2 — Distribuciones','2026-03-23','2026-04-06','PEC',0),
  ('75.443','Miguel Angel','PRA 1 — Fundamentos Python','2026-02-18','2026-03-04','PRA',0),
  ('75.443','Miguel Angel','PRA 2 — POO','2026-03-18','2026-04-01','PRA',0)
) AS t(course_code, user_name, title, start_date, end_date, type, progress)
JOIN courses c ON c.code = t.course_code
JOIN users   u ON u.name = t.user_name;
