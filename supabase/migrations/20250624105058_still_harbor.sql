/*
  # Add dual format support for certificates

  1. Changes
    - Add `pdf_url` column to store PDF version
    - Add `image_url` column to store image version
    - Update existing certificates to use new structure
    - Both formats will always be available for download

  2. Security
    - Maintain existing RLS policies
    - No changes to access control
*/

-- Add new columns for dual format support
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS pdf_url text,
ADD COLUMN IF NOT EXISTS image_url text;

-- Add comments to document the columns
COMMENT ON COLUMN certificates.pdf_url IS 'URL to PDF version of the certificate';
COMMENT ON COLUMN certificates.image_url IS 'URL to image version of the certificate';

-- For existing certificates, set the appropriate URLs based on certificate_type
UPDATE certificates 
SET 
  pdf_url = CASE WHEN certificate_type = 'pdf' THEN file_url ELSE NULL END,
  image_url = CASE WHEN certificate_type = 'image' THEN file_url ELSE NULL END
WHERE pdf_url IS NULL AND image_url IS NULL;