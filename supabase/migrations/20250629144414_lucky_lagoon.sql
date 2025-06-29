/*
  # Fix Teams RLS Infinite Recursion

  1. Problem
    - The current RLS policy on `teams` table creates infinite recursion
    - Policy references `team_members` which may reference back to `teams`

  2. Solution
    - Drop existing problematic policies
    - Create new simplified policies that avoid circular references
    - Use direct ownership checks and public visibility
    - Handle team membership checks in application logic instead of RLS

  3. Changes
    - Remove complex team membership policy from teams table
    - Keep simple owner and public visibility policies
    - Ensure team_members policies don't create circular references
*/

-- Drop existing problematic policies on teams table
DROP POLICY IF EXISTS "Team members can view teams they belong to" ON teams;
DROP POLICY IF EXISTS "Public teams are viewable by anyone" ON teams;
DROP POLICY IF EXISTS "Team owners can view and manage their teams" ON teams;

-- Create new simplified policies for teams table
CREATE POLICY "Team owners can manage their teams"
  ON teams
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Public teams are viewable"
  ON teams
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Ensure team_members policies are safe and don't reference teams table
DROP POLICY IF EXISTS "Team owners can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can join teams" ON team_members;
DROP POLICY IF EXISTS "Users can leave teams (non-owners)" ON team_members;
DROP POLICY IF EXISTS "Users can view their own team memberships" ON team_members;

-- Create safe team_members policies
CREATE POLICY "Users can view their own memberships"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave teams"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND role != 'owner');

-- Team owners can manage members (using service role or function)
CREATE POLICY "Service role can manage team members"
  ON team_members
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create a function to safely get user teams without RLS recursion
CREATE OR REPLACE FUNCTION get_user_teams(user_id uuid)
RETURNS TABLE (
  team_id uuid,
  team_name text,
  team_description text,
  team_avatar_url text,
  team_owner_id uuid,
  team_is_public boolean,
  team_invite_code text,
  team_created_at timestamptz,
  team_updated_at timestamptz,
  user_role text,
  joined_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as team_id,
    t.name as team_name,
    t.description as team_description,
    t.avatar_url as team_avatar_url,
    t.owner_id as team_owner_id,
    t.is_public as team_is_public,
    t.invite_code as team_invite_code,
    t.created_at as team_created_at,
    t.updated_at as team_updated_at,
    CASE 
      WHEN t.owner_id = user_id THEN 'owner'::text
      ELSE COALESCE(tm.role, 'member'::text)
    END as user_role,
    COALESCE(tm.joined_at, t.created_at) as joined_at
  FROM teams t
  LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = get_user_teams.user_id
  WHERE t.owner_id = get_user_teams.user_id 
     OR tm.user_id = get_user_teams.user_id
     OR t.is_public = true;
END;
$$;

-- Create a function to safely get team details with members
CREATE OR REPLACE FUNCTION get_team_with_members(team_id uuid, requesting_user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  avatar_url text,
  owner_id uuid,
  is_public boolean,
  invite_code text,
  created_at timestamptz,
  updated_at timestamptz,
  member_id uuid,
  member_user_id uuid,
  member_role text,
  member_joined_at timestamptz,
  member_full_name text,
  member_username text,
  member_avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has access to this team
  IF NOT EXISTS (
    SELECT 1 FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id
    WHERE t.id = team_id 
    AND (
      t.owner_id = requesting_user_id 
      OR tm.user_id = requesting_user_id 
      OR t.is_public = true
    )
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.description,
    t.avatar_url,
    t.owner_id,
    t.is_public,
    t.invite_code,
    t.created_at,
    t.updated_at,
    tm.id as member_id,
    tm.user_id as member_user_id,
    tm.role as member_role,
    tm.joined_at as member_joined_at,
    p.full_name as member_full_name,
    p.username as member_username,
    p.avatar_url as member_avatar_url
  FROM teams t
  LEFT JOIN team_members tm ON t.id = tm.team_id
  LEFT JOIN profiles p ON tm.user_id = p.id
  WHERE t.id = team_id;
END;
$$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION get_user_teams(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_with_members(uuid, uuid) TO authenticated;