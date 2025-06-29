/*
  # Add thumbnail_url column to certificates table

  1. Changes
    - Add `thumbnail_url` column to `certificates` table
    - Column will store URLs for certificate thumbnail images
    - Column is nullable since existing certificates may not have thumbnails
    - Default value is NULL

  2. Notes
    - This column will be used to store thumbnail/preview images for certificates
    - Particularly useful for PDF certificates that need image previews
    - For image certificates, this may be the same as file_url
*/

-- Add thumbnail_url column to certificates table
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Add comment to document the column purpose
COMMENT ON COLUMN certificates.thumbnail_url IS 'URL to thumbnail/preview image of the certificate';