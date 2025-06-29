/*
  # Create profiles table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `username` (text, unique)
      - `avatar_url` (text)
      - `bio` (text)
      - `social_links` (jsonb)
      - `upload_limit` (integer, default 25)
      - `referral_code` (text, unique)
      - `referred_by` (text)
      - `subscription_tier` (text, default 'free')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for users to view and update their own profile
    - Add policy for public profile viewing by username
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  username text UNIQUE,
  avatar_url text,
  bio text,
  social_links jsonb DEFAULT '{}',
  upload_limit integer DEFAULT 25,
  referral_code text UNIQUE,
  referred_by text,
  subscription_tier text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public profiles can be viewed by username"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (username IS NOT NULL);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, referral_code)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    substring(md5(random()::text) from 1 for 8)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();