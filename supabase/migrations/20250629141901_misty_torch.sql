/*
  # Fix team RPC functions and RLS recursion

  1. New Functions
    - `get_user_team_memberships` - Get user's team memberships with team details
    - `get_team_members_with_profiles` - Get team members with their profile information
  
  2. Security
    - Both functions use SECURITY DEFINER to bypass RLS recursion issues
    - Grant execute permissions to authenticated users
  
  3. Purpose
    - Resolve infinite recursion in team_members RLS policies
    - Provide efficient team data retrieval without RLS conflicts
*/

-- Function to get user's team memberships with team details
CREATE OR REPLACE FUNCTION public.get_user_team_memberships(p_user_id uuid)
RETURNS TABLE (
    team_id uuid,
    role text,
    joined_at timestamp with time zone,
    teams jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tm.team_id,
        tm.role,
        tm.joined_at,
        to_jsonb(t.*) AS teams
    FROM
        public.team_members tm
    JOIN
        public.teams t ON tm.team_id = t.id
    WHERE
        tm.user_id = p_user_id;
END;
$$;

-- Function to get team members with their profile information
CREATE OR REPLACE FUNCTION public.get_team_members_with_profiles(p_team_id uuid)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    role text,
    joined_at timestamp with time zone,
    profiles jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tm.id,
        tm.user_id,
        tm.role,
        tm.joined_at,
        to_jsonb(p.*) AS profiles
    FROM
        public.team_members tm
    LEFT JOIN
        public.profiles p ON tm.user_id = p.id
    WHERE
        tm.team_id = p_team_id
    ORDER BY
        tm.joined_at ASC;
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_team_memberships(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_members_with_profiles(uuid) TO authenticated;