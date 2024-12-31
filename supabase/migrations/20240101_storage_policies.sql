-- Enable storage policies for authenticated users
BEGIN;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificates');

-- Policy to allow authenticated users to update their own files
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'certificates');

-- Policy to allow authenticated users to read all files
CREATE POLICY "Allow authenticated users to read all files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'certificates');

-- Policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'certificates');

COMMIT;
