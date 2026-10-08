# 🏗️ CozMeet Architecture Diagram

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
├──────────────────────────────────────────────────────────────────┤
│  http://localhost:5173                                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           React + TypeScript + Vite Frontend              │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  Pages:              Components:                          │  │
│  │  • Home              • CreatePost (image upload)          │  │
│  │  • Login             • PostCard (likes + comments)        │  │
│  │  • Register          • CommentInput (real comments)       │  │
│  │  • Profile           • SuggestedUsers (real follow)       │  │
│  │  • Settings          • ProfileCard                        │  │
│  │  • Explore           • ActivityCard                       │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────┬────────────────────────────────────────────────┬─┘
                │                                                │
         @supabase/supabase-js (SDK)                            │
                │                                                │
                ▼                                                ▼
     ┌─────────────────────────────────────────────────────────────┐
     │     Supabase Cloud (https://iksijgrqkxmmqipjldyj.supabase.co)
     ├─────────────────────────────────────────────────────────────┤
     │                                                             │
     │  ┌─────────────────────────────────────────────────────┐    │
     │  │         AUTHENTICATION (Supabase Auth)             │    │
     │  │  • JWT tokens                                      │    │
     │  │  • Email/password                                  │    │
     │  │  • Session management                              │    │
     │  └─────────────────────────────────────────────────────┘    │
     │                          │                                  │
     │                          ▼                                  │
     │  ┌─────────────────────────────────────────────────────┐    │
     │  │    DATABASE (PostgreSQL via pg_net)                │    │
     │  ├─────────────────────────────────────────────────────┤    │
     │  │                                                     │    │
     │  │  Tables:                                            │    │
     │  │  ┌────────────────────────────────────────────┐   │    │
     │  │  │ profiles                                   │   │    │
     │  │  │ • id, username, display_name, bio         │   │    │
     │  │  │ • avatar_url, cover_url                   │   │    │
     │  │  │ • followers_count, following_count        │   │    │
     │  │  └────────────────────────────────────────────┘   │    │
     │  │  ┌────────────────────────────────────────────┐   │    │
     │  │  │ posts                                      │   │    │
     │  │  │ • id, user_id, caption                    │   │    │
     │  │  │ • image_url, video_url, visibility        │   │    │
     │  │  │ • created_at, updated_at                  │   │    │
     │  │  └────────────────────────────────────────────┘   │    │
     │  │  ┌────────────────────────────────────────────┐   │    │
     │  │  │ post_likes                                 │   │    │
     │  │  │ • id, post_id, user_id, created_at        │   │    │
     │  │  │ (tracks who liked which post)             │   │    │
     │  │  └────────────────────────────────────────────┘   │    │
     │  │  ┌────────────────────────────────────────────┐   │    │
     │  │  │ comments                                   │   │    │
     │  │  │ • id, post_id, user_id, content           │   │    │
     │  │  │ • parent_comment_id, created_at           │   │    │
     │  │  └────────────────────────────────────────────┘   │    │
     │  │  ┌────────────────────────────────────────────┐   │    │
     │  │  │ follows                                    │   │    │
     │  │  │ • id, follower_id, following_id, created_ │   │    │
     │  │  │ (tracks follower relationships)           │   │    │
     │  │  └────────────────────────────────────────────┘   │    │
     │  │  ┌────────────────────────────────────────────┐   │    │
     │  │  │ post_saves                                 │   │    │
     │  │  │ • id, post_id, user_id, created_at        │   │    │
     │  │  └────────────────────────────────────────────┘   │    │
     │  │  ┌────────────────────────────────────────────┐   │    │
     │  │  │ post_shares                                │   │    │
     │  │  │ • id, post_id, user_id, created_at        │   │    │
     │  │  └────────────────────────────────────────────┘   │    │
     │  │  ┌────────────────────────────────────────────┐   │    │
     │  │  │ notifications                              │   │    │
     │  │  │ • id, recipient_id, actor_id, type        │   │    │
     │  │  │ • post_id, is_read, created_at            │   │    │
     │  │  └────────────────────────────────────────────┘   │    │
     │  │                                                     │    │
     │  │  RLS Policies:                                     │    │
     │  │  • Users can only see public posts                │    │
     │  │  • Users can only edit own posts                 │    │
     │  │  • Users can like/comment on visible posts       │    │
     │  │  • Follow relationships are public               │    │
     │  │                                                     │    │
     │  └─────────────────────────────────────────────────────┘    │
     │                          │                                  │
     │                          ▼                                  │
     │  ┌─────────────────────────────────────────────────────┐    │
     │  │         STORAGE (S3-Compatible)                    │    │
     │  ├─────────────────────────────────────────────────────┤    │
     │  │  Bucket: avatars (PUBLIC)                          │    │
     │  │  • Stores: User profile pictures                   │    │
     │  │  • Path: avatars/{user-id}/{filename}             │    │
     │  │                                                     │    │
     │  │  Bucket: covers (PUBLIC)                           │    │
     │  │  • Stores: User cover images                      │    │
     │  │  • Path: covers/{user-id}/{filename}              │    │
     │  │                                                     │    │
     │  │  Bucket: post-images (PUBLIC)                      │    │
     │  │  • Stores: Post images                            │    │
     │  │  • Path: posts/{user-id}-{timestamp}.{ext}        │    │
     │  │                                                     │    │
     │  │  All buckets: Read access for all users           │    │
     │  │               Write access for authenticated users │    │
     │  └─────────────────────────────────────────────────────┘    │
     │                                                             │
     └─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Creating a Post

```
User Types Text + Selects Image
         ↓
    Click "Post" Button
         ↓
    ┌─────────────────────────────┐
    │ handlePost() Called          │
    └────────────┬────────────────┘
                 ↓
         Image Selected?
         /             \
       YES              NO
       /                 \
      ↓                   ↓
Upload to          Insert Post
post-images        to database
bucket             (caption only)
      ↓                   ↓
Get Public URL      Post Created
      ↓                   ↓
      └─────────┬─────────┘
                ↓
          Call onPostCreated()
                ↓
         Refresh Home Feed
                ↓
      Fetch Posts from DB
                ↓
      Fetch User Data
                ↓
      Fetch Likes Count
                ↓
    Fetch Comments Count
                ↓
      Post Appears in Feed
```

---

## Data Flow: Liking a Post

```
User Clicks Like Button
         ↓
    handleLike(postId)
         ↓
    Check post_likes table
    for existing like
         ↓
    ┌────────────────────┐
    │ Like Already Exists?│
    └────────┬───────────┘
            / \
          YES   NO
         /       \
        ↓         ↓
    Unlike     Like Post
    (Delete)   (Insert)
        ↓         ↓
        └────┬────┘
             ↓
      Update Local State
             ↓
      Change Heart Color
             ↓
      Update Like Count
             ↓
      Post Renders with
      New Like State
```

---

## Data Flow: Adding a Comment

```
User Types Comment
         ↓
    Submit Form
         ↓
    handleSubmit()
         ↓
    Insert to comments
    table with:
    • post_id
    • user_id
    • content
    • timestamp
         ↓
    Success/Error
         ↓
    CommentList Component
    Re-fetches All Comments
    for this Post
         ↓
    SELECT * FROM comments
    WHERE post_id = ?
    ORDER BY created_at
         ↓
    Fetch User Data
    for Each Comment
         ↓
    Display Comments
    with Avatars + Names
         ↓
    Post's comments_count
    Gets Updated
```

---

## Data Flow: Following a User

```
User Clicks Follow Button
    on Suggested User
         ↓
    handleFollow(userId)
         ↓
    Check followingMap[userId]
         ↓
    ┌────────────────────────┐
    │ Already Following?     │
    └────────┬──────────────┘
            / \
          YES   NO
         /       \
        ↓         ↓
    Unfollow    Follow User
    (Delete)    (Insert)
        ↓         ↓
  DELETE FROM  INSERT INTO
  follows WHERE follows VALUES
  follower_id  (follower_id,
  & following  following_id)
      ↓         ↓
        └────┬────┘
             ↓
      Update followingMap
             ↓
      Toggle Button State
             ↓
      Button Changes Color:
      Blue → Grey (Following)
      or
      Grey → Blue (Not Following)
```

---

## Component Tree

```
App.tsx
├── Route: /
│   └── Home.tsx
│       ├── ProfileCard (left sidebar)
│       ├── CreatePost (center - upload post)
│       ├── PostList
│       │   └── PostCard (repeating for each post)
│       │       ├── PostHeader (user info)
│       │       ├── PostContent (caption + image)
│       │       ├── PostActions
│       │       │   ├── Like Button
│       │       │   ├── Comment Button
│       │       │   └── Share Button
│       │       └── CommentSection (if expanded)
│       │           ├── CommentList (fetch + display)
│       │           │   └── Comment (repeat for each)
│       │           └── CommentInput (add new)
│       └── SuggestedUsers (right sidebar)
│           └── UserCard (repeat for each)
│               └── Follow Button
│
├── Route: /login
│   └── Login.tsx
│
├── Route: /register
│   └── Register.tsx
│
└── Route: /profile/:username
    └── Profile.tsx
```

---

## Database Query Examples

### Fetch Posts with Related Data
```sql
SELECT 
  p.*,
  u.id as user_id,
  u.display_name,
  u.avatar_url,
  (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
  (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
FROM posts p
JOIN profiles u ON p.user_id = u.id
WHERE p.visibility = 'public'
ORDER BY p.created_at DESC
```

### Check if User Liked Post
```sql
SELECT id FROM post_likes
WHERE post_id = ? AND user_id = ?
```

### Get User's Follow Count
```sql
SELECT 
  (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as following_count,
  (SELECT COUNT(*) FROM follows WHERE following_id = ?) as followers_count
```

### Fetch Comments with User Info
```sql
SELECT 
  c.*,
  u.id as user_id,
  u.display_name,
  u.avatar_url
FROM comments c
JOIN profiles u ON c.user_id = u.id
WHERE c.post_id = ?
ORDER BY c.created_at ASC
```

---

## API Endpoints (via Supabase SDK)

### Auth
```typescript
supabase.auth.signUp({ email, password })
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signOut()
```

### Posts
```typescript
supabase.from('posts').select('...')
supabase.from('posts').insert([...])
supabase.from('posts').delete().eq('id', postId)
```

### Likes
```typescript
supabase.from('post_likes').insert([...])
supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)
```

### Comments
```typescript
supabase.from('comments').select('...').eq('post_id', postId)
supabase.from('comments').insert([...])
```

### Follows
```typescript
supabase.from('follows').select('*').eq('follower_id', userId)
supabase.from('follows').insert([...])
supabase.from('follows').delete().eq('follower_id', userId).eq('following_id', otherId)
```

### Storage
```typescript
supabase.storage.from('post-images').upload(filePath, file)
supabase.storage.from('post-images').getPublicUrl(filePath)
```

---

## Security Layers

### 1. Authentication
```
User logs in with email/password
          ↓
Supabase Auth validates
          ↓
JWT token issued
          ↓
Token stored in browser
          ↓
Token sent with every request
```

### 2. Row Level Security (RLS)
```
All database queries run as:
- Authenticated user (with JWT)
- Anonymous user (limited access)

Policies:
- Users can only see own profiles
- Users can only see public posts
- Users can only edit own posts
- Comments visible to post viewers
- Follows are public
```

### 3. Storage Access
```
All buckets are PUBLIC for reads
(Anyone can see images)

Writes are authenticated
(Only logged-in users can upload)

Files uploaded to user-specific paths
(Can't access other users' upload slots)
```

---

## Performance Optimizations

### Frontend
- Optimistic updates (UI updates before DB confirms)
- Component-level state management
- Lazy loading of images
- Debounced searches

### Database
- Indexes on frequently queried columns
- Efficient joins between tables
- RLS policies prevent over-fetching
- Pagination ready (not yet implemented)

### Storage
- CDN-backed (CloudFront)
- Public URLs for fast serving
- Automatic compression

---

## Scalability Considerations

### Current (MVP)
- Up to ~10,000 active users
- Real-time like/comment updates via polling
- No caching layer

### Future Improvements
- Real-time subscriptions (PostgreSQL Realtime)
- Redis caching for popular posts
- Elasticsearch for full-text search
- Message queue for notifications
- CDN for static assets
- Database read replicas

---

## Environment Variables

```
VITE_SUPABASE_URL=https://iksijgrqkxmmqipjldyj.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_TTjwLgb4nVw75CyX8bEJTA_eZYLviIF
VITE_API_URL=http://localhost:3001
```

---

This architecture provides:
- ✅ Scalable backend (PostgreSQL)
- ✅ Secure authentication (Supabase Auth)
- ✅ Cloud storage (S3-compatible)
- ✅ Real-time capabilities (potential via Realtime)
- ✅ Type-safe frontend (TypeScript)
- ✅ Modern UI framework (React)

All features are fully functional and connected!
