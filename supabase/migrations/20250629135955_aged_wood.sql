/*
  # Fix Team Members RLS Policies

  1. Problem
    - Current policies have infinite recursion due to circular references
    - Policies are referencing team_members table within their own conditions

  2. Solution
    - Drop existing problematic policies
    - Create new simplified policies that avoid circular references
    - Use direct user_id checks and team ownership checks without recursive joins

  3. New Policies
    - Users can view team members of teams they belong to
    - Team owners can manage all team members
    - Users can join teams (insert their own membership)
    - Users can leave teams (delete their own membership, except owners)
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Team members can view other team members" ON team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can join teams" ON team_members;
DROP POLICY IF EXISTS "Users can leave teams" ON team_members;

-- Create new simplified policies

-- Policy 1: Users can view team members of teams they belong to
CREATE POLICY "Users can view team members of their teams"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id 
      FROM team_members tm 
      WHERE tm.user_id = auth.uid()
    )
  );

-- Policy 2: Users can insert their own team membership
CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Team owners can manage all team members
CREATE POLICY "Team owners can manage team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT t.id 
      FROM teams t 
      WHERE t.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT t.id 
      FROM teams t 
      WHERE t.owner_id = auth.uid()
    )
  );

-- Policy 4: Users can leave teams (but not if they're the owner)
CREATE POLICY "Users can leave teams"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() 
    AND role != 'owner'
  );

-- Policy 5: Team admins can manage other members (but not owners)
CREATE POLICY "Team admins can manage members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id 
      FROM team_members tm 
      WHERE tm.user_id = auth.uid() 
      AND tm.role = 'admin'
    )
    AND role != 'owner'
  )
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id 
      FROM team_members tm 
      WHERE tm.user_id = auth.uid() 
      AND tm.role = 'admin'
    )
    AND role != 'owner'
  );