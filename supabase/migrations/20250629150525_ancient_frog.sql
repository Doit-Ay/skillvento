/*
  # Fix ambiguous user_id reference in get_user_teams function

  1. Database Functions
    - Drop and recreate `get_user_teams` function with properly qualified column references
    - Drop and recreate `get_team_with_members` function with properly qualified column references
  
  2. Changes Made
    - Qualify all `user_id` references with appropriate table aliases
    - Ensure no ambiguous column references exist
    - Maintain same function signatures and return types
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_user_teams(uuid);
DROP FUNCTION IF EXISTS get_team_with_members(uuid, uuid);

-- Recreate get_user_teams function with proper column qualification
CREATE OR REPLACE FUNCTION get_user_teams(user_id uuid)
RETURNS TABLE (
  team_id uuid,
  user_role text,
  joined_at timestamptz,
  team_name text,
  team_description text,
  team_avatar_url text,
  team_owner_id uuid,
  team_is_public boolean,
  team_invite_code text,
  team_created_at timestamptz,
  team_updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.team_id,
    tm.role as user_role,
    tm.joined_at,
    t.name as team_name,
    t.description as team_description,
    t.avatar_url as team_avatar_url,
    t.owner_id as team_owner_id,
    t.is_public as team_is_public,
    t.invite_code as team_invite_code,
    t.created_at as team_created_at,
    t.updated_at as team_updated_at
  FROM team_members tm
  JOIN teams t ON tm.team_id = t.id
  WHERE tm.user_id = get_user_teams.user_id;
END;
$$;

-- Recreate get_team_with_members function with proper column qualification
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
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = get_team_with_members.team_id 
    AND tm.user_id = get_team_with_members.requesting_user_id
  ) AND NOT EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.id = get_team_with_members.team_id 
    AND t.is_public = true
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
  WHERE t.id = get_team_with_members.team_id;
END;
$$;