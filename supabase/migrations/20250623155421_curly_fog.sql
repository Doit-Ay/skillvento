/*
  # Create referrals table

  1. New Tables
    - `referrals`
      - `id` (uuid, primary key)
      - `referrer_id` (uuid, references auth.users)
      - `referee_id` (uuid, references auth.users, unique)
      - `status` (text, default 'pending')
      - `bonus_uploads` (integer, default 5)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS on `referrals` table
    - Add policies for referrers to view their own referrals
    - Add policy for authenticated users to insert referrals
*/

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  referee_id uuid REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed')),
  bonus_uploads integer DEFAULT 5 NOT NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrers can view their own referrals"
  ON public.referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

CREATE POLICY "Authenticated users can insert referrals"
  ON public.referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Referrers can update their own referrals"
  ON public.referrals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = referrer_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_referee_id_idx ON public.referrals(referee_id);