/*
  # Enhanced Diagnostics Features

  1. New Tables
    - `document_summaries`
      - For storing uploaded documents and their summaries
      - Supports both PDFs and images
      - Links to medical reports
  
  2. Changes
    - Add health parameters to medical_reports table
    - Add document storage capabilities
*/

-- Add health parameters to medical_reports
ALTER TABLE medical_reports ADD COLUMN IF NOT EXISTS health_parameters jsonb DEFAULT '{}'::jsonb;

-- Create document_summaries table
CREATE TABLE IF NOT EXISTS document_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES medical_reports NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('pdf', 'image')),
  summary text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE document_summaries ENABLE ROW LEVEL SECURITY;

-- Policies for document_summaries
CREATE POLICY "Doctors can manage document summaries"
  ON document_summaries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medical_reports mr
      JOIN doctors d ON d.id = mr.doctor_id
      WHERE d.user_id = auth.uid()
      AND mr.id = document_summaries.report_id
    )
  );

CREATE POLICY "Patients can view their document summaries"
  ON document_summaries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medical_reports mr
      JOIN patients p ON p.id = mr.patient_id
      WHERE p.user_id = auth.uid()
      AND mr.id = document_summaries.report_id
    )
  );