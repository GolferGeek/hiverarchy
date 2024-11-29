-- Create policies for profile_logos bucket
BEGIN;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profile logos insert policy" ON storage.objects;
DROP POLICY IF EXISTS "Profile logos select policy" ON storage.objects;
DROP POLICY IF EXISTS "Profile logos update policy" ON storage.objects;
DROP POLICY IF EXISTS "Profile logos delete policy" ON storage.objects;

-- Policy for inserting objects
CREATE POLICY "Profile logos insert policy" ON storage.objects
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (bucket_id = 'profile_logos' OR bucket_id = 'profile_logos/')
  );

-- Policy for selecting/viewing objects
CREATE POLICY "Profile logos select policy" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'profile_logos' OR bucket_id = 'profile_logos/'
  );

-- Policy for updating objects
CREATE POLICY "Profile logos update policy" ON storage.objects
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (bucket_id = 'profile_logos' OR bucket_id = 'profile_logos/')
  );

-- Policy for deleting objects
CREATE POLICY "Profile logos delete policy" ON storage.objects
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND (bucket_id = 'profile_logos' OR bucket_id = 'profile_logos/')
  );

COMMIT; 