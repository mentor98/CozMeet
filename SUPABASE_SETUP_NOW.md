# ⚡ Supabase Setup - Do This NOW (5 Minutes)

Your app is running but registration fails because the database isn't set up yet.

## 🎯 Quick Setup

### Step 1: Open Supabase Dashboard
```
https://app.supabase.com
```

### Step 2: Select Your Project
```
Project Name: iksijgrqkxmmqipjldyj
Click to open
```

### Step 3: Run First Migration (Creates Tables)

**Click "SQL Editor" in left sidebar**

**Click "New Query"**

**Copy this SQL and paste it into the editor:**

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  bio text,
  avatar_url text,
  cover_url text,
  posts_count integer DEFAULT 0,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caption text,
  image_url text,
  video_url text,
  visibility text DEFAULT 'public',
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- Create post_saves table
CREATE TABLE IF NOT EXISTS post_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Create post_shares table
CREATE TABLE IF NOT EXISTS post_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create shortcuts table
CREATE TABLE IF NOT EXISTS shortcuts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
```

**Press Ctrl+Enter to RUN**

**Wait for ✅ success message**

---

### Step 4: Run Security Policies (Protects Data)

**Click "New Query" again**

**Copy and paste this:**

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortcuts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Public posts are viewable by everyone"
  ON posts FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE USING (auth.uid() = user_id);

-- Post likes policies
CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see likes"
  ON post_likes FOR SELECT USING (true);

CREATE POLICY "Users can unlike their likes"
  ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can comment"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comments are viewable"
  ON comments FOR SELECT USING (true);

-- Follows policies
CREATE POLICY "Follows are public"
  ON follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE USING (auth.uid() = follower_id);
```

**Press Ctrl+Enter to RUN**

**Wait for ✅ success message**

---

### Step 5: Create Storage Buckets

**Click "Storage" in left sidebar**

**Click "Create a new bucket"**

**Create Bucket 1:**
- Name: `avatars`
- Publicity: **Public**
- Click "Create bucket"

**Create Bucket 2:**
- Name: `covers`
- Publicity: **Public**
- Click "Create bucket"

**Create Bucket 3:**
- Name: `post-images`
- Publicity: **Public**
- Click "Create bucket"

---

### Step 6: Set Bucket Policies

For each bucket (avatars, covers, post-images):

1. **Click the bucket name**
2. **Go to "Policies" tab**
3. **Click "New Policy"**
4. **Select "Enable read access for all users"**
5. **Click "Review"**
6. **Click "Save policy"**

---

### Step 7: Done! ✅

Go back to your app and try registering again!

**http://localhost:5173**

---

## 🧪 Test Registration

1. Click **Register**
2. Fill in:
   - Display Name: `Test User`
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123!`
3. Click **Register**
4. ✅ Should redirect to login
5. Login with your credentials
6. ✅ Should see home page

---

## If Still Getting 400 Error

**Check Supabase Dashboard:**

1. Go to **Database > Tables**
2. Verify all 9 tables exist:
   - ✅ profiles
   - ✅ posts
   - ✅ post_likes
   - ✅ comments
   - ✅ follows
   - ✅ post_saves
   - ✅ post_shares
   - ✅ notifications
   - ✅ shortcuts

3. Go to **Storage > Buckets**
4. Verify all 3 buckets exist:
   - ✅ avatars
   - ✅ covers
   - ✅ post-images

If any are missing, run the SQL queries again.

---

## Quick Reference

| Step | Action | Status |
|------|--------|--------|
| 1 | Open Supabase | ✅ Do this |
| 2 | Run First SQL | ✅ Do this |
| 3 | Run Second SQL | ✅ Do this |
| 4 | Create 3 buckets | ✅ Do this |
| 5 | Set bucket policies | ✅ Do this |
| 6 | Test registration | ✅ Then test |

---

**Time to complete: 5-10 minutes**

**Status: Ready to setup!**
