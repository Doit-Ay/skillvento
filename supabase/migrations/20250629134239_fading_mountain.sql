/*
  # Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `message` (text)
      - `type` (text: certificate_expiry, learning_recommendation, team_update, system)
      - `is_read` (boolean)
      - `action_url` (text, optional)
      - `created_at` (timestamp)
  
  2. Changes
    - Add notification_preferences to profiles table
  
  3. Security
    - Enable RLS on notifications table
    - Add policies for users to manage their notifications
*/

-- Add notification_preferences to profiles table
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"certificate_expiry": true, "learning_recommendations": true, "team_updates": true, "platform_news": true}'::jsonb;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  action_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- Create function to check for expiring certificates and create notifications
CREATE OR REPLACE FUNCTION check_expiring_certificates()
RETURNS void AS $$
DECLARE
  cert RECORD;
  user_prefs RECORD;
BEGIN
  FOR cert IN
    SELECT c.*, p.id as profile_id, p.notification_preferences
    FROM certificates c
    JOIN profiles p ON c.user_id = p.id
    WHERE 
      c.expiry_date IS NOT NULL AND 
      c.expiry_date > CURRENT_DATE AND 
      c.expiry_date <= (CURRENT_DATE + INTERVAL '30 days')
  LOOP
    -- Check if user wants expiry notifications
    IF (cert.notification_preferences->>'certificate_expiry')::boolean = true THEN
      -- Check if notification already exists
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE 
          user_id = cert.user_id AND 
          type = 'certificate_expiry' AND 
          message LIKE '%' || cert.id || '%' AND
          created_at > (CURRENT_DATE - INTERVAL '7 days')
      ) THEN
        -- Create notification
        INSERT INTO notifications (
          user_id, 
          title, 
          message, 
          type, 
          action_url
        ) VALUES (
          cert.user_id,
          'Certificate Expiring Soon',
          'Your certificate "' || cert.title || '" from ' || cert.organization || ' will expire on ' || cert.expiry_date || '.',
          'certificate_expiry',
          '/dashboard?certificate=' || cert.id
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run the function daily (would be set up in production)
-- SELECT cron.schedule('0 0 * * *', 'SELECT check_expiring_certificates()');