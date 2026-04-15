-- DB_PROJECTS_MIGRATION.sql
-- Run this ONCE in pgAdmin on LiftMaintenanceDB AFTER DB_COMPAT_MIGRATION.sql (if used).
-- Adds Project -> Installation -> Testing -> Handover -> Warranty workflow.

BEGIN;

-- 0) Technicians master (for assignment)
CREATE TABLE IF NOT EXISTS technicians (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  role        TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_technicians_active ON technicians (is_active);

-- 1) Projects (one project can have many lifts)
CREATE TABLE IF NOT EXISTS projects (
  id           BIGSERIAL PRIMARY KEY,
  project_code TEXT, -- optional human code
  project_name TEXT NOT NULL,
  customer_id  BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  site_id      BIGINT REFERENCES sites(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','ON_HOLD','COMPLETED','CANCELLED')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects (customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_site ON projects (site_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);

-- 2) Project lifts (milestones)
CREATE TABLE IF NOT EXISTS project_lifts (
  id                    BIGSERIAL PRIMARY KEY,
  project_id             BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  lift_id                BIGINT REFERENCES lifts(id) ON DELETE SET NULL,
  lift_code              TEXT NOT NULL, -- same as lifts.job_no
  location_label         TEXT,
  installation_start_date DATE,
  installation_end_date   DATE,
  testing_start_date      DATE,
  testing_end_date        DATE,
  handover_date           DATE,
  warranty_months         INTEGER NOT NULL DEFAULT 12 CHECK (warranty_months >= 0),
  warranty_start_date     DATE,
  warranty_end_date       DATE,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_project_lift_code UNIQUE (lift_code)
);

CREATE INDEX IF NOT EXISTS idx_project_lifts_project ON project_lifts (project_id);
CREATE INDEX IF NOT EXISTS idx_project_lifts_lift ON project_lifts (lift_id);

-- 3) Technician assignments (many techs per project-lift)
CREATE TABLE IF NOT EXISTS project_lift_assignments (
  id              BIGSERIAL PRIMARY KEY,
  project_lift_id BIGINT NOT NULL REFERENCES project_lifts(id) ON DELETE CASCADE,
  technician_id   BIGINT NOT NULL REFERENCES technicians(id) ON DELETE RESTRICT,
  assignment_role TEXT NOT NULL CHECK (assignment_role IN ('INSTALL','TEST','SUPPORT')),
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unassigned_at   TIMESTAMPTZ,
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_assignments_lift_role ON project_lift_assignments (project_lift_id, assignment_role);
CREATE INDEX IF NOT EXISTS idx_assignments_tech ON project_lift_assignments (technician_id);

-- updated_at trigger helper (reuse if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $fn$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_technicians_updated_at') THEN
    CREATE TRIGGER trg_technicians_updated_at
    BEFORE UPDATE ON technicians
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_projects_updated_at') THEN
    CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_project_lifts_updated_at') THEN
    CREATE TRIGGER trg_project_lifts_updated_at
    BEFORE UPDATE ON project_lifts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

COMMIT;
