/*
  # Profile Extensions Migration

  1. New Tables
    - `academic_info` - Store educational background
    - `professional_experience` - Store work experience
    - `contact_info` - Store contact details
  
  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
  
  3. Changes
    - Extend profile functionality with detailed information storage
*/

-- Academic Information Table
CREATE TABLE IF NOT EXISTS academic_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  degree text NOT NULL,
  institution text NOT NULL,
  field_of_study text,
  start_date date,
  end_date date,
  grade text,
  description text,
  is_current boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Professional Experience Table
CREATE TABLE IF NOT EXISTS professional_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL,
  location text,
  start_date date,
  end_date date,
  is_current boolean DEFAULT false,
  description text,
  skills text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact Information Table
CREATE TABLE IF NOT EXISTS contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text,
  address text,
  city text,
  state text,
  country text,
  postal_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE academic_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

-- Academic Info Policies
CREATE POLICY "Users can read own academic info"
  ON academic_info
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own academic info"
  ON academic_info
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own academic info"
  ON academic_info
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own academic info"
  ON academic_info
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Professional Experience Policies
CREATE POLICY "Users can read own professional experience"
  ON professional_experience
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own professional experience"
  ON professional_experience
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own professional experience"
  ON professional_experience
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own professional experience"
  ON professional_experience
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Contact Info Policies
CREATE POLICY "Users can read own contact info"
  ON contact_info
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contact info"
  ON contact_info
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contact info"
  ON contact_info
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contact info"
  ON contact_info
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS academic_info_user_id_idx ON academic_info(user_id);
CREATE INDEX IF NOT EXISTS professional_experience_user_id_idx ON professional_experience(user_id);
CREATE INDEX IF NOT EXISTS contact_info_user_id_idx ON contact_info(user_id);