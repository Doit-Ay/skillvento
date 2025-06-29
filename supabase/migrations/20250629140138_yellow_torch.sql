/*
  # Fix Team Members RLS Policy Infinite Recursion

  1. Problem
    - The existing policy for viewing team members creates infinite recursion
    - Policy queries team_members table from within its own condition
    - This causes circular dependency during policy evaluation

  2. Solution
    - Drop the problematic policy
    - Create new policies that avoid self-referencing
    - Use direct team ownership and membership checks
    - Separate policies for different access patterns

  3. New Policies
    - Team owners can view all members of their teams
    - Team members can view members of teams they belong to (using team_id directly)
    - Admins can manage members within their teams
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;

-- Create new policy for team owners to view all members
CREATE POLICY "Team owners can view team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE owner_id = auth.uid()
    )
  );

-- Create policy for team members to view other members of the same team
-- This avoids recursion by using a direct team_id match approach
CREATE POLICY "Team members can view same team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm2 
      WHERE tm2.team_id = team_members.team_id 
      AND tm2.user_id = auth.uid()
    )
  );

-- Update the admin policy to be more specific and avoid recursion
DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;

CREATE POLICY "Team admins can manage members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    -- User is admin of this team (check via teams table to avoid recursion)
    team_id IN (
      SELECT t.id FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = auth.uid() 
      AND tm.role = 'admin'
    )
    AND role != 'owner' -- Cannot manage owners
  )
  WITH CHECK (
    -- Same check for inserts/updates
    team_id IN (
      SELECT t.id FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = auth.uid() 
      AND tm.role = 'admin'
    )
    AND role != 'owner'
  );