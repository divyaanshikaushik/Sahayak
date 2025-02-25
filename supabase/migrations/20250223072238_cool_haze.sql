/*
  # Add visit reason to medical reports

  1. Changes
    - Add `visit_reason` column to `medical_reports` table
    - Add check constraint to ensure only valid visit reasons are stored
    - Set default value to 'regular_checkup'

  2. Valid visit reasons:
    - regular_checkup
    - first_meet
    - casual_checkup
    - emergency
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medical_reports' AND column_name = 'visit_reason'
  ) THEN
    ALTER TABLE medical_reports 
    ADD COLUMN visit_reason text NOT NULL 
    DEFAULT 'regular_checkup'
    CHECK (visit_reason IN ('regular_checkup', 'first_meet', 'casual_checkup', 'emergency'));
  END IF;
END $$;