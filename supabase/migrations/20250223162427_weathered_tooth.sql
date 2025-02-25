/*
  # Create storage bucket for medical documents

  1. New Storage Bucket
    - Creates a 'medical-documents' bucket for storing patient reports and images
    - Sets up appropriate RLS policies for secure access

  2. Security
    - Enable RLS on the bucket
    - Add policies for:
      - Doctors can upload and manage documents
      - Patients can only view their own documents
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', false)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Doctors can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can update their documents" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can delete their documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;

-- Create policies for the medical-documents bucket
CREATE POLICY "Doctors can upload documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'medical-documents' AND
  EXISTS (
    SELECT 1 FROM public.doctors
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can update their documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'medical-documents' AND
  EXISTS (
    SELECT 1 FROM public.doctors
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can delete their documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'medical-documents' AND
  EXISTS (
    SELECT 1 FROM public.doctors
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'medical-documents' AND
  (
    -- Doctors can view all documents
    EXISTS (
      SELECT 1 FROM public.doctors
      WHERE user_id = auth.uid()
    )
    OR
    -- Patients can view their own documents
    EXISTS (
      SELECT 1 FROM public.medical_reports mr
      JOIN public.patients p ON p.id = mr.patient_id
      WHERE p.user_id = auth.uid()
      AND position('reports/' in name::text) > 0
    )
  )
);