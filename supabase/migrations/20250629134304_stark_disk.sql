/*
  # Learning Path Recommendations

  1. New Tables
    - `learning_recommendations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text)
      - `provider` (text)
      - `url` (text)
      - `domain` (text)
      - `confidence_score` (numeric)
      - `is_dismissed` (boolean)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on learning_recommendations table
    - Add policies for users to manage their recommendations
*/

-- Create learning_recommendations table
CREATE TABLE IF NOT EXISTS learning_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  provider text NOT NULL,
  url text NOT NULL,
  domain text NOT NULL,
  confidence_score numeric NOT NULL DEFAULT 0,
  is_dismissed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on learning_recommendations
ALTER TABLE learning_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies for learning_recommendations
CREATE POLICY "Users can view their own learning recommendations"
  ON learning_recommendations
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own learning recommendations"
  ON learning_recommendations
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create function to generate learning recommendations based on user certificates
CREATE OR REPLACE FUNCTION generate_learning_recommendations()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  user_domains TEXT[];
  domain TEXT;
  recommendation_data JSONB;
  recommendations JSONB[] := ARRAY[
    '{"domain": "Web Development", "recommendations": [
      {"title": "Advanced React Patterns", "description": "Learn advanced React patterns and best practices", "provider": "Frontend Masters", "url": "https://frontendmasters.com/courses/advanced-react-patterns/"},
      {"title": "Full Stack for Front-End Engineers", "description": "Learn the backend skills you need as a frontend developer", "provider": "Frontend Masters", "url": "https://frontendmasters.com/courses/fullstack-v2/"},
      {"title": "TypeScript Fundamentals", "description": "Learn TypeScript from the ground up", "provider": "Frontend Masters", "url": "https://frontendmasters.com/courses/typescript-v3/"}
    ]}',
    '{"domain": "Data Science", "recommendations": [
      {"title": "Machine Learning A-Z", "description": "Learn Machine Learning techniques from beginner to advanced", "provider": "Udemy", "url": "https://www.udemy.com/course/machinelearning/"},
      {"title": "Python for Data Science and Machine Learning", "description": "Learn how to use Python for Data Science and Machine Learning", "provider": "Udemy", "url": "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/"},
      {"title": "Deep Learning Specialization", "description": "Master Deep Learning and break into AI", "provider": "Coursera", "url": "https://www.coursera.org/specializations/deep-learning"}
    ]}',
    '{"domain": "Cloud Computing", "recommendations": [
      {"title": "AWS Certified Solutions Architect", "description": "Prepare for the AWS Solutions Architect certification", "provider": "A Cloud Guru", "url": "https://acloudguru.com/course/aws-certified-solutions-architect-associate-saa-c02"},
      {"title": "Google Cloud Platform Fundamentals", "description": "Learn the fundamentals of Google Cloud Platform", "provider": "Coursera", "url": "https://www.coursera.org/learn/gcp-fundamentals"},
      {"title": "Azure Fundamentals", "description": "Learn the fundamentals of Microsoft Azure", "provider": "Microsoft Learn", "url": "https://docs.microsoft.com/en-us/learn/paths/az-900-describe-cloud-concepts/"}
    ]}',
    '{"domain": "Cybersecurity", "recommendations": [
      {"title": "CompTIA Security+", "description": "Prepare for the CompTIA Security+ certification", "provider": "CompTIA", "url": "https://www.comptia.org/certifications/security"},
      {"title": "Ethical Hacking", "description": "Learn ethical hacking and penetration testing", "provider": "Udemy", "url": "https://www.udemy.com/course/learn-ethical-hacking-from-scratch/"},
      {"title": "Web Security Academy", "description": "Learn web security with hands-on labs", "provider": "PortSwigger", "url": "https://portswigger.net/web-security"}
    ]}'
  ]::JSONB[];
BEGIN
  -- For each user
  FOR user_record IN
    SELECT p.id, p.notification_preferences, array_agg(DISTINCT c.domain) as domains
    FROM profiles p
    JOIN certificates c ON p.id = c.user_id
    WHERE (p.notification_preferences->>'learning_recommendations')::boolean = true
    GROUP BY p.id, p.notification_preferences
  LOOP
    user_domains := user_record.domains;
    
    -- For each domain the user has certificates in
    FOREACH domain IN ARRAY user_domains
    LOOP
      -- Find matching recommendations
      FOR recommendation_data IN
        SELECT r->'recommendations' as recs
        FROM jsonb_array_elements(recommendations::jsonb) as arr
        CROSS JOIN LATERAL jsonb_array_elements(arr) as r
        WHERE r->>'domain' = domain
      LOOP
        -- For each recommendation in this domain
        FOR i IN 0..jsonb_array_length(recommendation_data)-1
        LOOP
          -- Check if recommendation already exists
          IF NOT EXISTS (
            SELECT 1 FROM learning_recommendations
            WHERE 
              user_id = user_record.id AND
              title = recommendation_data->i->>'title' AND
              (is_dismissed = false OR created_at > (CURRENT_DATE - INTERVAL '30 days'))
          ) THEN
            -- Create recommendation
            INSERT INTO learning_recommendations (
              user_id,
              title,
              description,
              provider,
              url,
              domain,
              confidence_score
            ) VALUES (
              user_record.id,
              recommendation_data->i->>'title',
              recommendation_data->i->>'description',
              recommendation_data->i->>'provider',
              recommendation_data->i->>'url',
              domain,
              0.8 -- Default confidence score
            );
          END IF;
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run the function weekly (would be set up in production)
-- SELECT cron.schedule('0 0 * * 0', 'SELECT generate_learning_recommendations()');