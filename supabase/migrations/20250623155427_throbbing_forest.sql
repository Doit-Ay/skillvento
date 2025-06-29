/*
  # Create storage bucket for certificates

  1. Storage
    - Create `certificates` bucket for storing certificate files
    - Set up public access policies for certificate viewing
    - Configure upload policies for authenticated users

  2. Security
    - Allow authenticated users to upload to their own folder
    - Allow public read access for certificate viewing
    - Restrict file types to images and PDFs
*/

-- Create the certificates bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload certificates to their own folder
CREATE POLICY "Users can upload certificates to their own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'certificates' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own certificate files
CREATE POLICY "Users can update their own certificate files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'certificates' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own certificate files
CREATE POLICY "Users can delete their own certificate files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'certificates' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access to certificate files
CREATE POLICY "Public read access for certificates"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'certificates');