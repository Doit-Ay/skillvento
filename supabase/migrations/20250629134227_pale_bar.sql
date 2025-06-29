/*
  # Certificate Verification System

  1. New Tables
    - `verification_requests`
      - `id` (uuid, primary key)
      - `certificate_id` (uuid, foreign key to certificates)
      - `requester_email` (text)
      - `verification_code` (text)
      - `status` (text: pending, approved, rejected)
      - `created_at` (timestamp)
      - `verified_at` (timestamp)
  
  2. Changes
    - Add `verification_code` column to certificates table
    - Add `verification_status` column to certificates table
    - Add `verification_date` column to certificates table
  
  3. Security
    - Enable RLS on verification_requests table
    - Add policies for certificate owners to manage verification requests
*/

-- Add verification fields to certificates table
ALTER TABLE IF EXISTS certificates 
ADD COLUMN IF NOT EXISTS verification_code text,
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_date timestamptz;

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  requester_email text NOT NULL,
  verification_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz
);

-- Enable RLS on verification_requests
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Policies for verification_requests
CREATE POLICY "Certificate owners can view verification requests"
  ON verification_requests
  FOR SELECT
  USING (
    certificate_id IN (
      SELECT id FROM certificates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Certificate owners can create verification requests"
  ON verification_requests
  FOR INSERT
  WITH CHECK (
    certificate_id IN (
      SELECT id FROM certificates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Certificate owners can update verification requests"
  ON verification_requests
  FOR UPDATE
  USING (
    certificate_id IN (
      SELECT id FROM certificates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Certificate owners can delete verification requests"
  ON verification_requests
  FOR DELETE
  USING (
    certificate_id IN (
      SELECT id FROM certificates WHERE user_id = auth.uid()
    )
  );

-- Create function to generate verification code for certificates
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_code IS NULL THEN
    NEW.verification_code := upper(substring(md5(random()::text) from 1 for 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate verification code
CREATE TRIGGER set_verification_code
BEFORE INSERT ON certificates
FOR EACH ROW
EXECUTE FUNCTION generate_verification_code();