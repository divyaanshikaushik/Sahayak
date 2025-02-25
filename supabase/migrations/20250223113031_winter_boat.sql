/*
  # Update patients table schema

  1. Changes
    - Make user_id column optional in patients table
    - Update RLS policies to reflect new schema

  2. Security
    - Maintain RLS policies for doctor access
    - Remove patient authentication policies
*/

-- Make user_id column optional
ALTER TABLE patients 
  ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their patient profile" ON patients;
DROP POLICY IF EXISTS "Patients can view their own profile" ON patients;

-- Update policies for doctors
DROP POLICY IF EXISTS "Doctors can view their patients" ON patients;
DROP POLICY IF EXISTS "Doctors can manage their patients" ON patients;

CREATE POLICY "Doctors can view their patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
      AND doctors.id = patients.doctor_id
    )
  );

CREATE POLICY "Doctors can manage their patients"
  ON patients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
      AND doctors.id = patients.doctor_id
    )
  );