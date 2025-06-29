/*
  # Create subscriptions table for Pro plans

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `plan_id` (text, plan identifier)
      - `plan_name` (text, human readable plan name)
      - `certificate_limit` (integer, number of certificates allowed)
      - `price_paid` (integer, amount paid in rupees)
      - `original_price` (integer, original price before discount)
      - `discount_applied` (integer, discount percentage)
      - `promo_code` (text, promo code used)
      - `status` (text, subscription status)
      - `starts_at` (timestamptz, subscription start date)
      - `expires_at` (timestamptz, subscription expiry date)
      - `payment_id` (text, payment gateway transaction id)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policies for users to view and manage their own subscriptions
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL,
  plan_name text NOT NULL,
  certificate_limit integer NOT NULL,
  price_paid integer NOT NULL,
  original_price integer NOT NULL,
  discount_applied integer DEFAULT 0,
  promo_code text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  payment_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_expires_at_idx ON subscriptions(expires_at);

-- Function to automatically update upload_limit when subscription is created/updated
CREATE OR REPLACE FUNCTION update_user_upload_limit()
RETURNS trigger AS $$
BEGIN
  -- Update the user's upload limit based on their active subscription
  UPDATE profiles 
  SET upload_limit = NEW.certificate_limit,
      subscription_tier = 'pro',
      updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update upload limit when subscription changes
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW 
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION update_user_upload_limit();

-- Function to reset upload limit when subscription expires
CREATE OR REPLACE FUNCTION reset_expired_subscriptions()
RETURNS void AS $$
BEGIN
  -- Reset upload limit for expired subscriptions
  UPDATE profiles 
  SET upload_limit = 25,
      subscription_tier = 'free',
      updated_at = now()
  WHERE id IN (
    SELECT user_id 
    FROM subscriptions 
    WHERE status = 'active' 
    AND expires_at < now()
  );
  
  -- Mark expired subscriptions
  UPDATE subscriptions 
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'active' 
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;