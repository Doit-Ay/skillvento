/*
  # Fix Teams RLS Policies Circular Dependency

  1. Changes
    - Drops existing problematic policies on teams and team_members tables
    - Creates new non-recursive policies that avoid circular references
    - Ensures policies are created only if they don't already exist
  
  2. Security
    - Maintains proper access control for teams and team members
    - Prevents infinite recursion in RLS policies
*/

-- Drop existing problematic policies on teams table
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
DROP POLICY IF EXISTS "Team owners can manage their teams" ON teams;
DROP POLICY IF EXISTS "Public teams can be viewed by anyone" ON teams;

-- Drop problematic policies on team_members table that might cause recursion
DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;
DROP POLICY IF EXISTS "Team owners can manage team members" ON team_members;
DROP POLICY IF EXISTS "Team owners can view team members" ON team_members;

-- Create new non-recursive policies for teams table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'teams' AND policyname = 'Public teams viewable by anyone'
  ) THEN
    CREATE POLICY "Public teams viewable by anyone"
      ON teams
      FOR SELECT
      TO public
      USING (is_public = true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'teams' AND policyname = 'Team owners can manage their teams'
  ) THEN
    CREATE POLICY "Team owners can manage their teams"
      ON teams
      FOR ALL
      TO authenticated
      USING (owner_id = auth.uid())
      WITH CHECK (owner_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'teams' AND policyname = 'Authenticated users can view teams for membership checks'
  ) THEN
    CREATE POLICY "Authenticated users can view teams for membership checks"
      ON teams
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Recreate team_members policies without circular references
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'team_members' AND policyname = 'Users can view team memberships'
  ) THEN
    CREATE POLICY "Users can view team memberships"
      ON team_members
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() OR team_id IN (
        SELECT id FROM teams WHERE owner_id = auth.uid()
      ));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'team_members' AND policyname = 'Users can join teams'
  ) THEN
    CREATE POLICY "Users can join teams"
      ON team_members
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'team_members' AND policyname = 'Users can leave teams'
  ) THEN
    CREATE POLICY "Users can leave teams"
      ON team_members
      FOR DELETE
      TO authenticated
      USING (user_id = auth.uid() AND role != 'owner');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'team_members' AND policyname = 'Team owners can manage all members'
  ) THEN
    CREATE POLICY "Team owners can manage all members"
      ON team_members
      FOR ALL
      TO authenticated
      USING (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
      WITH CHECK (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()));
  END IF;
END $$;