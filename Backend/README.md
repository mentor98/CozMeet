# CozMeet Backend

Backend configuration and database setup for CozMeet social media platform using Supabase.

## 🏗 Architecture

CozMeet uses **Supabase** as the backend, which provides:

- PostgreSQL database
- Authentication
- Real-time capabilities
- File storage
- REST API

## 🗄 Database Schema

The application uses the following tables:

### profiles
- `id` (UUID, Primary Key)
- `username` (TEXT, UNIQUE)
- `display_name` (TEXT)
- `bio` (TEXT)
- `avatar_url` (TEXT)
- `cover_url` (TEXT)
- `posts_count` (INTEGER)
- `followers_count` (INTEGER)
- `following_count` (INTEGER)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### posts
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `caption` (TEXT)
- `image_url` (TEXT)
- `video_url` (TEXT)
- `visibility` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### post_likes
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMPTZ)
- **UNIQUE(post_id, user_id)**

### comments
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `content` (TEXT)
- `parent_comment_id` (UUID)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### follows
- `id` (UUID, Primary Key)
- `follower_id` (UUID, Foreign Key)
- `following_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMPTZ)
- **UNIQUE(follower_id, following_id)**

### post_saves
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMPTZ)
- **UNIQUE(post_id, user_id)**

### post_shares
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMPTZ)

### notifications
- `id` (UUID, Primary Key)
- `recipient_id` (UUID, Foreign Key)
- `actor_id` (UUID, Foreign Key)
- `type` (TEXT)
- `post_id` (UUID)
- `comment_id` (UUID)
- `is_read` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

### shortcuts
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `name` (TEXT)
- `image_url` (TEXT)
- `created_at` (TIMESTAMPTZ)

## 🔧 Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click "New Project"
3. Enter project name and database password
4. Wait for project to be created
5. Copy your project URL and API keys

### 2. Create Database Tables

Use the Supabase SQL editor to run the migration script:

**Database > SQL Editor > New Query**

Copy and run the contents of `migrations/001_schema.sql`

### 3. Set Up Storage Buckets

Create three public storage buckets:

1. `avatars` - For user profile pictures
2. `covers` - For profile cover images
3. `post-images` - For post images

### 4. Configure Row Level Security (RLS)

Apply RLS policies using the SQL migrations. This ensures users can only access their own data.

### 5. Set Up Authentication

1. Go to Authentication settings
2. Enable Email/Password
3. Configure redirect URLs for login/registration

## 📊 Database Migrations

All database setup is in `/migrations/` directory:

- `001_schema.sql` - Initial schema and tables
- `002_indexes.sql` - Performance indexes
- `003_rls.sql` - Row Level Security policies
- `004_seed.sql` - Demo data

## 🔐 Row Level Security Policies

### profiles
- Public: Users can read all profiles
- Private: Users can only update their own profile

### posts
- Public: Anyone can read public posts
- Private: Users can CRUD only their own posts

### post_likes
- Private: Users can only like/unlike their own

### comments
- Public: Anyone can read comments
- Private: Users can only create/edit their own

### follows
- Private: Users can only follow on their own behalf

### notifications
- Private: Users can only read their own notifications

## 🖼 Storage Configuration

### Storage Policies

Each bucket should have the following policy:

**Public Read**:
```
SELECT
  CASE 
    WHEN auth.role() = 'authenticated' THEN true
    WHEN auth.role() = 'anon' THEN true
    ELSE false
  END
```

**Authenticated Upload**:
```
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
  VALUES (
    'post-images',
    new.name,
    auth.uid(),
    new.metadata
  )
  WHERE auth.role() = 'authenticated'
```

**Only Own Delete**:
```
DELETE FROM storage.objects
  WHERE bucket_id = 'post-images'
  AND auth.uid()::text = owner
```

## 🚀 API Endpoints

All data operations go through Supabase REST API:

```
GET /rest/v1/profiles              # Get profiles
POST /rest/v1/profiles             # Create profile
GET /rest/v1/profiles?id=eq.UUID   # Get profile by ID
PATCH /rest/v1/profiles?id=eq.UUID # Update profile
DELETE /rest/v1/profiles?id=eq.UUID # Delete profile
```

## 🔄 Real-time Features

Enable real-time subscriptions for:

- Posts (new posts)
- Comments (new comments)
- Notifications (new notifications)
- Post likes (like count updates)

## 📱 File Upload

### Image Optimization

For production, implement:

1. Image compression before upload
2. Multiple resolutions (thumbnail, medium, large)
3. WebP format support
4. CDN caching

### File Size Limits

- Avatar: 5MB max
- Cover: 10MB max
- Post images: 20MB max

## 🔐 Security Best Practices

1. **Never expose service role key** in frontend code
2. **Always use RLS** to enforce permissions
3. **Validate file types** on upload
4. **Sanitize user input** before storage
5. **Use HTTPS** in production
6. **Implement rate limiting** on API endpoints
7. **Hash sensitive data** before storage

## 📈 Performance Optimization

### Database Indexes

Key indexes for performance:

```sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
```

### Query Optimization

- Use pagination for large result sets
- Select only required columns
- Use filters and limits
- Consider caching frequently accessed data

## 🐛 Troubleshooting

### Connection Issues
- Verify Supabase URL and API key
- Check network connectivity
- Ensure browser allows mixed content (HTTPS)

### RLS Errors
- Verify user is authenticated
- Check RLS policy syntax
- Review user permissions

### Storage Issues
- Verify bucket exists and is public
- Check file size limits
- Ensure CORS is configured

## 📚 Documentation

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

## 📝 Environment Variables

```env
SUPABASE_URL=          # Your Supabase project URL
SUPABASE_ANON_KEY=     # Public API key
SUPABASE_SERVICE_ROLE= # Service role key (server only)
```

## 🤝 Contributing

For database changes:

1. Create a new migration file
2. Test migration on local Supabase
3. Document schema changes
4. Update this README

## 📄 License

This project is licensed under the MIT License.
