/*
  # Initial Schema Setup for Medical Diagnostic System

  1. New Tables
    - `doctors`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `specialty` (text)
      - `license_number` (text)
      - `created_at` (timestamp)
    
    - `patients`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `doctor_id` (uuid, references doctors)
      - `full_name` (text)
      - `date_of_birth` (date)
      - `medical_history` (text)
      - `created_at` (timestamp)
    
    - `medical_reports`
      - `id` (uuid, primary key)
      - `doctor_id` (uuid, references doctors)
      - `patient_id` (uuid, references patients)
      - `image_url` (text)
      - `symptoms` (text)
      - `analysis` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for doctors and patients
    - Doctors can:
      - View their own profile
      - View and manage their patients
      - Create and view medical reports for their patients
    - Patients can:
      - View their own profile
      - View their own medical reports
*/

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text NOT NULL,
  specialty text NOT NULL,
  license_number text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  doctor_id uuid REFERENCES doctors NOT NULL,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  medical_history text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create medical_reports table
CREATE TABLE IF NOT EXISTS medical_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors NOT NULL,
  patient_id uuid REFERENCES patients NOT NULL,
  image_url text NOT NULL,
  symptoms text NOT NULL,
  analysis text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

-- Policies for doctors table
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

-- Policies for patients table
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
    OR
    auth.uid() = user_id
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

CREATE POLICY "Patients can view their own profile"
  ON patients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for medical_reports table
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