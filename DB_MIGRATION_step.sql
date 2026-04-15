-- Run this in pgAdmin Query Tool (LiftMaintenanceDB) BEFORE starting the server.
-- It makes sure your tables have the columns that the new code expects.

-- 1) LIFTS: AMC columns
ALTER TABLE IF EXISTS lifts
  ADD COLUMN IF NOT EXISTS amc_type varchar(50) NOT NULL DEFAULT 'LABOUR_ONLY',
  ADD COLUMN IF NOT EXISTS amc_start_date date NULL,
  ADD COLUMN IF NOT EXISTS amc_end_date date NULL,
  ADD COLUMN IF NOT EXISTS billing_cycle varchar(20) NOT NULL DEFAULT 'ANNUAL',
  ADD COLUMN IF NOT EXISTS contract_value numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_interval_days integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS amc_notes text NULL;

-- 2) SERVICE_LOGS: cost + technician_name (if your table is older)
ALTER TABLE IF EXISTS service_logs
  ADD COLUMN IF NOT EXISTS technician_name varchar(255) NULL,
  ADD COLUMN IF NOT EXISTS cost numeric(10,2) NULL;

-- Optional: make technician_name required only if you already have data cleaned
-- ALTER TABLE service_logs ALTER COLUMN technician_name SET NOT NULL;

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_service_logs_lift_date ON service_logs(lift_id, service_date DESC);
