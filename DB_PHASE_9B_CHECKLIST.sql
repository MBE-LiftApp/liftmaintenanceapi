BEGIN;

-- =========================================================
-- PHASE 9B - CHECKLIST SYSTEM
-- =========================================================

-- 1) Template table for reusable checklist definitions
CREATE TABLE IF NOT EXISTS checklist_templates (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(200) NOT NULL,
    phase VARCHAR(50) NOT NULL DEFAULT 'GENERAL', -- INSTALLATION / TESTING / HANDOVER / MAINTENANCE / GENERAL
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2) Template items table
CREATE TABLE IF NOT EXISTS checklist_template_items (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 1,
    item_text TEXT NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    item_type VARCHAR(30) NOT NULL DEFAULT 'BOOLEAN', -- BOOLEAN / TEXT / NUMBER
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_template_items_template_id
    ON checklist_template_items(template_id);

-- 3) Add checklist template link to assignments
ALTER TABLE project_lift_assignments
    ADD COLUMN IF NOT EXISTS checklist_template_id INTEGER NULL REFERENCES checklist_templates(id) ON DELETE SET NULL;

ALTER TABLE project_lift_assignments
    ADD COLUMN IF NOT EXISTS checklist_status VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED'; 
    -- NOT_STARTED / IN_PROGRESS / COMPLETED

ALTER TABLE project_lift_assignments
    ADD COLUMN IF NOT EXISTS checklist_completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0;

-- 4) Assignment checklist instances
CREATE TABLE IF NOT EXISTS assignment_checklist_items (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES project_lift_assignments(id) ON DELETE CASCADE,
    template_item_id INTEGER NULL REFERENCES checklist_template_items(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 1,
    item_text TEXT NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    item_type VARCHAR(30) NOT NULL DEFAULT 'BOOLEAN',
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    text_value TEXT NULL,
    number_value NUMERIC(18,2) NULL,
    done_by_technician_id INTEGER NULL REFERENCES technicians(id) ON DELETE SET NULL,
    done_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignment_checklist_items_assignment_id
    ON assignment_checklist_items(assignment_id);

-- 5) Optional checklist notes / issue log
CREATE TABLE IF NOT EXISTS assignment_checklist_notes (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES project_lift_assignments(id) ON DELETE CASCADE,
    technician_id INTEGER NULL REFERENCES technicians(id) ON DELETE SET NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignment_checklist_notes_assignment_id
    ON assignment_checklist_notes(assignment_id);

-- =========================================================
-- DEFAULT TEMPLATES
-- =========================================================

-- INSTALLATION
INSERT INTO checklist_templates (code, name, phase, description)
VALUES
('INSTALL_STD', 'Standard Installation Checklist', 'INSTALLATION', 'Default installation checklist')
ON CONFLICT (code) DO NOTHING;

INSERT INTO checklist_template_items (template_id, sort_order, item_text, is_required, item_type)
SELECT t.id, v.sort_order, v.item_text, v.is_required, v.item_type
FROM checklist_templates t
JOIN (
    VALUES
    (1, 'Site access confirmed', TRUE, 'BOOLEAN'),
    (2, 'Drawings verified', TRUE, 'BOOLEAN'),
    (3, 'Lift shaft dimensions checked', TRUE, 'BOOLEAN'),
    (4, 'Machine room readiness confirmed', TRUE, 'BOOLEAN'),
    (5, 'Guide rails installed / checked', TRUE, 'BOOLEAN'),
    (6, 'Cabin frame installed / checked', TRUE, 'BOOLEAN'),
    (7, 'Landing doors aligned', TRUE, 'BOOLEAN'),
    (8, 'Wiring completed / checked', TRUE, 'BOOLEAN'),
    (9, 'Safety devices checked', TRUE, 'BOOLEAN'),
    (10, 'Housekeeping completed', TRUE, 'BOOLEAN'),
    (11, 'Remarks', FALSE, 'TEXT')
) AS v(sort_order, item_text, is_required, item_type) ON TRUE
WHERE t.code = 'INSTALL_STD'
  AND NOT EXISTS (
      SELECT 1
      FROM checklist_template_items x
      WHERE x.template_id = t.id
  );

-- TESTING
INSERT INTO checklist_templates (code, name, phase, description)
VALUES
('TEST_STD', 'Standard Testing Checklist', 'TESTING', 'Default testing checklist')
ON CONFLICT (code) DO NOTHING;

INSERT INTO checklist_template_items (template_id, sort_order, item_text, is_required, item_type)
SELECT t.id, v.sort_order, v.item_text, v.is_required, v.item_type
FROM checklist_templates t
JOIN (
    VALUES
    (1, 'Power supply confirmed', TRUE, 'BOOLEAN'),
    (2, 'Control panel tested', TRUE, 'BOOLEAN'),
    (3, 'Door operation tested', TRUE, 'BOOLEAN'),
    (4, 'Emergency stop tested', TRUE, 'BOOLEAN'),
    (5, 'Intercom / alarm tested', TRUE, 'BOOLEAN'),
    (6, 'Travel test completed', TRUE, 'BOOLEAN'),
    (7, 'Leveling test completed', TRUE, 'BOOLEAN'),
    (8, 'Brake test completed', TRUE, 'BOOLEAN'),
    (9, 'Safety gear tested', TRUE, 'BOOLEAN'),
    (10, 'Test run signed off', TRUE, 'BOOLEAN'),
    (11, 'Remarks', FALSE, 'TEXT')
) AS v(sort_order, item_text, is_required, item_type) ON TRUE
WHERE t.code = 'TEST_STD'
  AND NOT EXISTS (
      SELECT 1
      FROM checklist_template_items x
      WHERE x.template_id = t.id
  );

-- MAINTENANCE
INSERT INTO checklist_templates (code, name, phase, description)
VALUES
('MAINT_STD', 'Standard Maintenance Checklist', 'MAINTENANCE', 'Default maintenance checklist')
ON CONFLICT (code) DO NOTHING;

INSERT INTO checklist_template_items (template_id, sort_order, item_text, is_required, item_type)
SELECT t.id, v.sort_order, v.item_text, v.is_required, v.item_type
FROM checklist_templates t
JOIN (
    VALUES
    (1, 'Machine room cleaned', TRUE, 'BOOLEAN'),
    (2, 'Controller checked', TRUE, 'BOOLEAN'),
    (3, 'Door sensors checked', TRUE, 'BOOLEAN'),
    (4, 'Door operator checked', TRUE, 'BOOLEAN'),
    (5, 'Guide shoes / rollers checked', TRUE, 'BOOLEAN'),
    (6, 'Lubrication completed', TRUE, 'BOOLEAN'),
    (7, 'Brake inspected', TRUE, 'BOOLEAN'),
    (8, 'Emergency light / alarm checked', TRUE, 'BOOLEAN'),
    (9, 'Ride quality checked', TRUE, 'BOOLEAN'),
    (10, 'Service report remarks entered', TRUE, 'TEXT')
) AS v(sort_order, item_text, is_required, item_type) ON TRUE
WHERE t.code = 'MAINT_STD'
  AND NOT EXISTS (
      SELECT 1
      FROM checklist_template_items x
      WHERE x.template_id = t.id
  );

COMMIT;