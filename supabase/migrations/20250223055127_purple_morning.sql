/*
  # Fix Authentication and RLS Policies

  1. Changes
    - Add policies for user registration
    - Fix RLS policies for doctors and patients tables
    - Allow authenticated users to create their profiles
    - Ensure proper access control for medical reports

  2. Security
    - Enable RLS on all tables
    - Add policies for profile creation during registration
    - Maintain existing access control for viewing and updating
*/

-- First, ensure RLS is enabled
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Doctors can view their own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can view their patients" ON patients;
DROP POLICY IF EXISTS "Doctors can manage their patients" ON patients;
DROP POLICY IF EXISTS "Patients can view their own profile" ON patients;
DROP POLICY IF EXISTS "Doctors can manage reports for their patients" ON medical_reports;
DROP POLICY IF EXISTS "Patients can view their own reports" ON medical_reports;

-- Allow authenticated users to create their profile
CREATE POLICY "Users can create their doctor profile"
  ON doctors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create their patient profile"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Doctors can view and update their own profile
CREATE POLICY "Doctors can view their own profile"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile"
  ON doctors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Doctors can view and manage their patients
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
    OR auth.uid() = user_id
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

-- Patients can view their own profile
CREATE POLICY "Patients can view their own profile"
  ON patients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Medical reports policies
CREATE POLICY "Doctors can manage reports for their patients"
  ON medical_reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
      AND doctors.id = medical_reports.doctor_id
    )
  );

CREATE POLICY "Patients can view their own reports"
  ON medical_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.user_id = auth.uid()
      AND patients.id = medical_reports.patient_id
    )
  );