-- Run this ONCE in pgAdmin (Query Tool) on your LiftMaintenanceDB.
-- Purpose: keep your NEW normalized schema, but make it compatible with the current UI.

BEGIN;

-- 1) Make AMC contract dates nullable (UI can set AMC Type first, dates later)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='contracts' AND column_name='start_date'
  ) THEN
    ALTER TABLE contracts ALTER COLUMN start_date DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='contracts' AND column_name='end_date'
  ) THEN
    ALTER TABLE contracts ALTER COLUMN end_date DROP NOT NULL;
  END IF;
END $$;

-- 2) Add UI-support columns on contracts (if missing)
ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS amc_type TEXT,
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT,
  ADD COLUMN IF NOT EXISTS contract_value NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS service_interval_days INT,
  ADD COLUMN IF NOT EXISTS amc_notes TEXT;

-- 3) Create service_logs table (UI uses Service Logs; later we can migrate to service_visits)
CREATE TABLE IF NOT EXISTS service_logs (
  id BIGSERIAL PRIMARY KEY,
  lift_id BIGINT NOT NULL REFERENCES lifts(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  technician_name TEXT NOT NULL,
  work_done TEXT NULL,
  remarks TEXT NULL,
  cost NUMERIC(10,2) NULL,
  next_service_due DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_service_logs_lift_date ON service_logs(lift_id, service_date DESC);

COMMIT;
