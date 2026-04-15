BEGIN;

-- 1) Technician auth fields (phone + PIN)
ALTER TABLE technicians
  ADD COLUMN IF NOT EXISTS pin_salt TEXT,
  ADD COLUMN IF NOT EXISTS pin_hash TEXT,
  ADD COLUMN IF NOT EXISTS must_change_pin BOOLEAN NOT NULL DEFAULT TRUE;

-- Helpful unique index (optional): prevent duplicate phone entries
-- Uncomment if you want strict uniqueness.
-- CREATE UNIQUE INDEX IF NOT EXISTS ux_technicians_phone ON technicians (phone) WHERE phone IS NOT NULL;

-- 2) Sessions for mobile sync (Bearer token)
CREATE TABLE IF NOT EXISTS technician_sessions (
  id BIGSERIAL PRIMARY KEY,
  technician_id BIGINT NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tech_sessions_tech ON technician_sessions (technician_id);
CREATE INDEX IF NOT EXISTS idx_tech_sessions_expires ON technician_sessions (expires_at);

-- 3) Assignment workflow fields (so technicians can Start/Complete)
ALTER TABLE project_lift_assignments
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ASSIGNED',
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Keep statuses clean
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_project_lift_assignments_status'
  ) THEN
    ALTER TABLE project_lift_assignments
      ADD CONSTRAINT ck_project_lift_assignments_status
      CHECK (status IN ('ASSIGNED','IN_PROGRESS','DONE','CANCELLED'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_assignments_tech_status ON project_lift_assignments (technician_id, status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON project_lift_assignments (due_date);

COMMIT;
