-- ============================================================================
-- Row Level Security Policies for CozMeet
-- ============================================================================

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Allow public read access to all profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- POSTS POLICIES
-- ============================================================================

-- Allow public read for public posts
CREATE POLICY "Public posts are viewable by everyone" ON posts
  FOR SELECT
  USING (visibility = 'public');

-- Allow users to read their own private posts
CREATE POLICY "Users can read own posts" ON posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to read posts from users they follow (future enhancement)
-- For now, implement this at application level

-- Allow users to create posts
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- POST_LIKES POLICIES
-- ============================================================================

-- Allow everyone to read likes
CREATE POLICY "Likes are viewable by everyone" ON post_likes
  FOR SELECT
  USING (true);

-- Allow authenticated users to create likes
CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes
CREATE POLICY "Users can unlike posts" ON post_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS POLICIES
-- ============================================================================

-- Allow everyone to read comments
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT
  USING (true);

-- Allow authenticated users to create comments
CREATE POLICY "Users can comment on posts" ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FOLLOWS POLICIES
-- ============================================================================

-- Allow everyone to read follows
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT
  USING (true);

-- Allow users to follow others (but not themselves)
CREATE POLICY "Users can follow others" ON follows
  FOR INSERT
  WITH CHECK (
    auth.uid() = follower_id 
    AND follower_id != following_id
  );

-- Allow users to unfollow
CREATE POLICY "Users can unfollow" ON follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================================================
-- POST_SAVES POLICIES
-- ============================================================================

-- Allow users to read their own saves
CREATE POLICY "Users can read own saves" ON post_saves
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to save posts
CREATE POLICY "Users can save posts" ON post_saves
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to remove saves
CREATE POLICY "Users can remove saved posts" ON post_saves
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- POST_SHARES POLICIES
-- ============================================================================

-- Allow everyone to read shares (for analytics)
CREATE POLICY "Shares are viewable by everyone" ON post_shares
  FOR SELECT
  USING (true);

-- Allow authenticated users to share posts
CREATE POLICY "Users can share posts" ON post_shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Allow users to read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT
  USING (auth.uid() = recipient_id);

-- Allow system to create notifications (use service role)
-- This is typically done via a trigger or backend function

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE
  USING (auth.uid() = recipient_id);

-- ============================================================================
-- SHORTCUTS POLICIES
-- ============================================================================

-- Allow users to read their own shortcuts
CREATE POLICY "Users can read own shortcuts" ON shortcuts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create shortcuts
CREATE POLICY "Users can create shortcuts" ON shortcuts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their shortcuts
CREATE POLICY "Users can update own shortcuts" ON shortcuts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their shortcuts
CREATE POLICY "Users can delete own shortcuts" ON shortcuts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Row Level Security policies applied successfully!';
END
$$;
