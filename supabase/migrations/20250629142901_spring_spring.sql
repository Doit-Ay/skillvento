/*
  # Fix team members policies and functions

  1. Changes
    - Drop problematic policies on team_members to avoid recursion
    - Drop existing functions before recreating them with new return types
    - Create RPC functions for team membership operations
    - Create simplified RLS policies to avoid recursion
    - Grant proper permissions to authenticated users

  2. Security
    - Use SECURITY DEFINER functions to bypass RLS when needed
    - Maintain access control through function-level checks
    - Ensure proper RLS policies for team_members table
*/

-- Drop existing problematic policies on team_members to avoid recursion
DROP POLICY IF EXISTS "Team members can view same team members" ON team_members;
DROP POLICY IF EXISTS "Users can view team memberships" ON team_members;

-- Drop existing functions before recreating them
DROP FUNCTION IF EXISTS public.get_user_team_memberships(uuid);
DROP FUNCTION IF EXISTS public.get_team_members_with_profiles(uuid);

-- Create RPC function to get user team memberships without RLS recursion
CREATE FUNCTION public.get_user_team_memberships(p_user_id uuid)
RETURNS TABLE (
    team_id uuid,
    user_id uuid,
    role text,
    joined_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tm.team_id,
        tm.user_id,
        tm.role,
        tm.joined_at
    FROM
        public.team_members tm
    WHERE
        tm.user_id = p_user_id;
END;
$$;

-- Create RPC function to get team members with their profiles
CREATE FUNCTION public.get_team_members_with_profiles(p_team_id uuid)
RETURNS TABLE (
    id uuid,
    team_id uuid,
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
        tm.team_id,
        tm.user_id,
        tm.role,
        tm.joined_at,
        to_jsonb(p.*) - 'id' as profiles
    FROM
        public.team_members tm
        LEFT JOIN public.profiles p ON p.id = tm.user_id
    WHERE
        tm.team_id = p_team_id
        AND (
            -- User is a member of this team
            EXISTS (
                SELECT 1 FROM public.team_members tm2 
                WHERE tm2.team_id = p_team_id 
                AND tm2.user_id = auth.uid()
            )
            OR
            -- Team is public
            EXISTS (
                SELECT 1 FROM public.teams t 
                WHERE t.id = p_team_id 
                AND t.is_public = true
            )
        );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_team_memberships(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_members_with_profiles(uuid) TO authenticated;

-- Create simplified RLS policies for team_members that avoid recursion
CREATE POLICY "Users can view their own memberships"
    ON team_members
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Team owners can view all team members"
    ON team_members
    FOR SELECT
    TO authenticated
    USING (
        team_id IN (
            SELECT id FROM teams WHERE owner_id = auth.uid()
        )
    );

-- Ensure the teams table has proper policies for the RPC functions to work
DO $$
BEGIN
    -- Check if the policy exists before creating it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'teams' 
        AND policyname = 'Enable read access for team members'
    ) THEN
        CREATE POLICY "Enable read access for team members"
            ON teams
            FOR SELECT
            TO authenticated
            USING (
                is_public = true 
                OR owner_id = auth.uid()
                OR id IN (
                    SELECT team_id FROM team_members WHERE user_id = auth.uid()
                )
            );
    END IF;
END $$;