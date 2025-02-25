/*
  # Add health status tracking

  1. Changes
    - Add health_status column to medical_reports table
      - Can be either 'improving' or 'deteriorating'
      - Required field (NOT NULL)

  2. Security
    - Maintains existing RLS policies
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medical_reports' AND column_name = 'health_status'
  ) THEN
    ALTER TABLE medical_reports 
    ADD COLUMN health_status text 
    CHECK (health_status IN ('improving', 'deteriorating'));
  END IF;
END $$;