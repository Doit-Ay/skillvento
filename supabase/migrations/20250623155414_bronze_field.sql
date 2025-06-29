/*
  # Create certificates table

  1. New Tables
    - `certificates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text, required)
      - `description` (text)
      - `organization` (text, required)
      - `issued_on` (date, required)
      - `expiry_date` (date)
      - `file_url` (text, required)
      - `certificate_type` (text, required)
      - `tags` (text array)
      - `domain` (text, required)
      - `is_verified` (boolean, default false)
      - `is_public` (boolean, default false)
      - `blockchain_hash` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `certificates` table
    - Add policies for users to manage their own certificates
    - Add policy for public certificate viewing
*/

CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  organization text NOT NULL,
  issued_on date NOT NULL,
  expiry_date date,
  file_url text NOT NULL,
  certificate_type text NOT NULL CHECK (certificate_type IN ('pdf', 'image')),
  tags text[] DEFAULT '{}',
  domain text NOT NULL,
  is_verified boolean DEFAULT false,
  is_public boolean DEFAULT false,
  blockchain_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own certificates"
  ON public.certificates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certificates"
  ON public.certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certificates"
  ON public.certificates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certificates"
  ON public.certificates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public certificates can be viewed by anyone"
  ON public.certificates
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS certificates_user_id_idx ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS certificates_domain_idx ON public.certificates(domain);
CREATE INDEX IF NOT EXISTS certificates_public_idx ON public.certificates(is_public) WHERE is_public = true;