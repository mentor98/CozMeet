-- ============================================================================
-- Storage Bucket Setup for CozMeet
-- ============================================================================

-- Note: Storage buckets must be created via Supabase dashboard or API
-- This is a reference script for what needs to be done

-- Buckets needed:
-- 1. post-images (for user post images)
-- 2. avatars (for user profile avatars)
-- 3. covers (for user cover images)

-- Via SQL (if supported):
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('post-images', 'post-images', true),
  ('avatars', 'avatars', true),
  ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Allow public read on post-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "Allow authenticated upload to post-images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public read on avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated upload to avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public read on covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Allow authenticated upload to covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'covers' AND 
    auth.role() = 'authenticated'
  );
