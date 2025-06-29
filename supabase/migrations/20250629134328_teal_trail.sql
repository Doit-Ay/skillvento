/*
  # Team Collaboration Features

  1. New Tables
    - `teams`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `avatar_url` (text)
      - `owner_id` (uuid, foreign key to users)
      - `is_public` (boolean)
      - `invite_code` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `team_members`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key to teams)
      - `user_id` (uuid, foreign key to users)
      - `role` (text: owner, admin, member)
      - `joined_at` (timestamp)
    
    - `team_certificates`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key to teams)
      - `certificate_id` (uuid, foreign key to certificates)
      - `added_by` (uuid, foreign key to users)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for team management
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar_url text,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public boolean NOT NULL DEFAULT false,
  invite_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team_certificates table
CREATE TABLE IF NOT EXISTS team_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  certificate_id uuid NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  added_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, certificate_id)
);

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_certificates ENABLE ROW LEVEL SECURITY;

-- Policies for teams
CREATE POLICY "Team owners can manage their teams"
  ON teams
  USING (owner_id = auth.uid());

CREATE POLICY "Public teams can be viewed by anyone"
  ON teams
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Team members can view their teams"
  ON teams
  FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Policies for team_members
CREATE POLICY "Team owners and admins can manage team members"
  ON team_members
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team members can view other team members"
  ON team_members
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave teams"
  ON team_members
  FOR DELETE
  USING (user_id = auth.uid() AND role != 'owner');

-- Policies for team_certificates
CREATE POLICY "Team members can view team certificates"
  ON team_certificates
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can add certificates to teams"
  ON team_certificates
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ) AND
    certificate_id IN (
      SELECT id FROM certificates WHERE user_id = auth.uid()
    ) AND
    added_by = auth.uid()
  );

CREATE POLICY "Team owners and admins can remove certificates"
  ON team_certificates
  FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ) OR
    certificate_id IN (
      SELECT id FROM certificates WHERE user_id = auth.uid()
    )
  );

-- Create function to notify team members when a new certificate is added
CREATE OR REPLACE FUNCTION notify_team_certificate_added()
RETURNS TRIGGER AS $$
DECLARE
  team_name TEXT;
  certificate_title TEXT;
  member_id UUID;
BEGIN
  -- Get team name
  SELECT name INTO team_name FROM teams WHERE id = NEW.team_id;
  
  -- Get certificate title
  SELECT title INTO certificate_title FROM certificates WHERE id = NEW.certificate_id;
  
  -- Notify all team members except the one who added the certificate
  FOR member_id IN
    SELECT user_id FROM team_members 
    WHERE team_id = NEW.team_id AND user_id != NEW.added_by
  LOOP
    -- Check if user wants team update notifications
    IF EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = member_id AND 
      (notification_preferences->>'team_updates')::boolean = true
    ) THEN
      -- Create notification
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        action_url
      ) VALUES (
        member_id,
        'New Team Certificate',
        'A new certificate "' || certificate_title || '" was added to team "' || team_name || '".',
        'team_update',
        '/teams/' || NEW.team_id
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for team certificate notifications
CREATE TRIGGER team_certificate_added
AFTER INSERT ON team_certificates
FOR EACH ROW
EXECUTE FUNCTION notify_team_certificate_added();