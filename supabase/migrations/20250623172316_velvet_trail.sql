/*
  # Add INSERT policy for profiles table

  1. Security
    - Add policy for authenticated users to insert their own profile
    - Ensures users can only create a profile for themselves using their auth.uid()
*/

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);