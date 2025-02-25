/*
  # Add appointments table and remove active status

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `doctor_id` (uuid, references doctors)
      - `patient_id` (uuid, references patients)
      - `scheduled_for` (timestamptz)
      - `visit_reason` (text)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `appointments` table
    - Add policies for doctors and patients
*/

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors NOT NULL,
  patient_id uuid REFERENCES patients NOT NULL,
  scheduled_for timestamptz NOT NULL,
  visit_reason text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  CHECK (scheduled_for > created_at)
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies for appointments
CREATE POLICY "Doctors can manage appointments for their patients"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
      AND doctors.id = appointments.doctor_id
    )
  );

CREATE POLICY "Patients can view their own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.user_id = auth.uid()
      AND patients.id = appointments.patient_id
    )
  );