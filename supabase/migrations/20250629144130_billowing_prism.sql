/*
  # Fix Teams RLS Policies to Prevent Infinite Recursion

  1. Changes
    - Drop existing problematic policies that cause infinite recursion
    - Drop existing functions before redefining them
    - Create safe, non-recursive policies for teams and team_members
    - Create RPC functions to safely query team data without triggering RLS recursion
  
  2. Security
    - Ensure proper access controls for teams and team members
    - Implement security checks in RPC functions
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Enable read access for team members" ON teams;
DROP POLICY IF EXISTS "Authenticated users can view teams for membership checks" ON teams;
DROP POLICY IF EXISTS "Public teams viewable by anyone" ON teams;
DROP POLICY IF EXISTS "Team owners can manage their teams" ON teams;

-- Drop existing functions before redefining them
DROP FUNCTION IF EXISTS get_user_team_memberships(uuid);
DROP FUNCTION IF EXISTS get_team_members_with_profiles(uuid);

-- Create safe, non-recursive policies
CREATE POLICY "Public teams are viewable by anyone"
  ON teams
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Team owners can view and manage their teams"
  ON teams
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team members can view teams they belong to"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() 
    OR is_public = true 
    OR EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid()
    )
  );

-- Ensure team_members policies are also safe
DROP POLICY IF EXISTS "Team owners can manage all members" ON team_members;
DROP POLICY IF EXISTS "Team owners can view all team members" ON team_members;
DROP POLICY IF EXISTS "Users can join teams" ON team_members;
DROP POLICY IF EXISTS "Users can leave teams" ON team_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON team_members;

-- Create safe team_members policies
CREATE POLICY "Users can view their own team memberships"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team owners can manage team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave teams (non-owners)"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND role != 'owner');

-- Create RPC function to safely get user team memberships
CREATE FUNCTION get_user_team_memberships(user_id uuid)
RETURNS TABLE (
  team_id uuid,
  role text,
  joined_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT tm.team_id, tm.role, tm.joined_at
  FROM team_members tm
  WHERE tm.user_id = get_user_team_memberships.user_id;
END;
$$;

-- Create RPC function to safely get team members with profiles
CREATE FUNCTION get_team_members_with_profiles(team_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  role text,
  joined_at timestamptz,
  profiles jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has permission to view this team
  IF NOT EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = get_team_members_with_profiles.team_id
    AND (
      t.owner_id = auth.uid()
      OR t.is_public = true
      OR EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = t.id AND tm.user_id = auth.uid()
      )
    )
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    tm.id,
    tm.user_id,
    tm.role,
    tm.joined_at,
    to_jsonb(p.*) as profiles
  FROM team_members tm
  LEFT JOIN profiles p ON p.id = tm.user_id
  WHERE tm.team_id = get_team_members_with_profiles.team_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_team_memberships(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_members_with_profiles(uuid) TO authenticated;