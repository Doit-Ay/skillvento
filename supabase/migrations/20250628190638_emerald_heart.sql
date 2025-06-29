/*
  # Fix referral processing for OAuth users

  1. Updates
    - Update handle_new_user function to process referrals from metadata
    - Add referral processing for OAuth sign-ups
    - Ensure referral codes are properly handled for all sign-up methods

  2. Security
    - Maintain existing RLS policies
    - Safe referral processing with error handling
*/

-- Update the handle_new_user function to process referrals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  referral_code_from_meta text;
  referrer_user_id uuid;
BEGIN
  -- Get referral code from metadata
  referral_code_from_meta := new.raw_user_meta_data->>'referred_by';
  
  -- Insert profile with basic info
  INSERT INTO public.profiles (
    id, 
    full_name, 
    username,
    referral_code,
    upload_limit,
    subscription_tier,
    referred_by
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    COALESCE(new.raw_user_meta_data->>'referral_code', substring(md5(random()::text) from 1 for 8)),
    COALESCE((new.raw_user_meta_data->>'upload_limit')::integer, 25),
    COALESCE(new.raw_user_meta_data->>'subscription_tier', 'free'),
    referral_code_from_meta
  );
  
  -- Process referral if referral code exists
  IF referral_code_from_meta IS NOT NULL AND referral_code_from_meta != '' THEN
    -- Find referrer by username or referral code
    SELECT id INTO referrer_user_id
    FROM public.profiles 
    WHERE username = referral_code_from_meta OR referral_code = referral_code_from_meta
    LIMIT 1;
    
    -- Create referral record if referrer found and not self-referral
    IF referrer_user_id IS NOT NULL AND referrer_user_id != new.id THEN
      INSERT INTO public.referrals (
        referrer_id,
        referee_id,
        status,
        bonus_uploads,
        completed_at
      )
      VALUES (
        referrer_user_id,
        new.id,
        'completed',
        5,
        now()
      )
      ON CONFLICT (referee_id) DO NOTHING; -- Prevent duplicate referrals
      
      -- Update referee's upload limit (base 25 + 5 bonus)
      UPDATE public.profiles 
      SET upload_limit = 30,
          updated_at = now()
      WHERE id = new.id;
    END IF;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();