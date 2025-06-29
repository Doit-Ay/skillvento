/*
  # Advanced Portfolio Customization

  1. New Tables
    - `portfolio_themes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `primary_color` (text)
      - `secondary_color` (text)
      - `accent_color` (text)
      - `is_premium` (boolean)
      - `preview_url` (text)
  
  2. Changes
    - Add portfolio_theme to profiles table
    - Add portfolio_layout to profiles table
  
  3. Security
    - Enable RLS on portfolio_themes table
    - Add policies for users to view themes
*/

-- Add portfolio customization fields to profiles table
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS portfolio_theme text DEFAULT 'default',
ADD COLUMN IF NOT EXISTS portfolio_layout text DEFAULT 'standard';

-- Create portfolio_themes table
CREATE TABLE IF NOT EXISTS portfolio_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  primary_color text NOT NULL,
  secondary_color text NOT NULL,
  accent_color text NOT NULL,
  is_premium boolean NOT NULL DEFAULT false,
  preview_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on portfolio_themes
ALTER TABLE portfolio_themes ENABLE ROW LEVEL SECURITY;

-- Policies for portfolio_themes
CREATE POLICY "Anyone can view portfolio themes"
  ON portfolio_themes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert default themes
INSERT INTO portfolio_themes (name, description, primary_color, secondary_color, accent_color, is_premium, preview_url)
VALUES
  ('Default', 'Clean and professional design with a blue color scheme', '#3B82F6', '#8B5CF6', '#10B981', false, '/themes/default.jpg'),
  ('Minimal', 'Simple and elegant design with lots of white space', '#1F2937', '#4B5563', '#6B7280', false, '/themes/minimal.jpg'),
  ('Creative', 'Bold and artistic design for creative professionals', '#EC4899', '#8B5CF6', '#F59E0B', true, '/themes/creative.jpg'),
  ('Tech', 'Modern design for tech professionals with a dark theme', '#10B981', '#3B82F6', '#6366F1', true, '/themes/tech.jpg'),
  ('Classic', 'Traditional layout with a timeless design', '#1E40AF', '#1F2937', '#DC2626', false, '/themes/classic.jpg'),
  ('Vibrant', 'Colorful and energetic design that stands out', '#F59E0B', '#EF4444', '#8B5CF6', true, '/themes/vibrant.jpg')
ON CONFLICT DO NOTHING;