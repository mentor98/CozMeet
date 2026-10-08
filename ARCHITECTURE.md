# CozMeet Architecture

Complete technical architecture documentation for CozMeet.

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / Client                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React App (TypeScript)                                    │ │
│  │  ├── Pages (Home, Profile, Explore, Settings, etc.)      │ │
│  │  ├── Components (Cards, Feed, Comments, etc.)            │ │
│  │  ├── Hooks (useAuth, usePosts, useLikes, etc.)           │ │
│  │  ├── Store (Zustand for state management)                │ │
│  │  └── Utils (Formatting, validation, etc.)                │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Supabase JavaScript Client                                │ │
│  │  ├── Authentication                                        │ │
│  │  ├── Database (PostgREST)                                  │ │
│  │  ├── Storage                                               │ │
│  │  └── Realtime                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │                                           │
         │ HTTPS/REST API                           │ WebSocket
         │                                           │
┌────────▼─────────────────────────────────────────▼──────────────┐
│                     Supabase Platform                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Authentication Service                                    │ │
│  │  ├── Email/Password                                       │ │
│  │  ├── Session Management                                   │ │
│  │  └── JWT Tokens                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                       │ │
│  │  ├── Tables (Profiles, Posts, Comments, etc.)             │ │
│  │  ├── Row Level Security (RLS)                             │ │
│  │  └── Indexes for Performance                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  PostgREST API                                             │ │
│  │  ├── Auto-generated REST endpoints                         │ │
│  │  └── Query capabilities (filter, sort, limit)             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Storage Service                                           │ │
│  │  ├── Buckets (avatars, covers, post-images)              │ │
│  │  └── CDN for image delivery                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Realtime Service                                          │ │
│  │  └── WebSocket for live updates                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🗄 Database Architecture

### Data Flow

```
User Registration
├── Supabase Auth (auth.users)
├── Trigger creates profile
└── Profile stored in profiles table

Create Post
├── User submits caption + image
├── Image uploaded to Storage
├── Post record created in database
├── RLS ensures user_id = auth.uid()
└── Post visible in feed

Like Post
├── User clicks like
├── Record created in post_likes
├── Count incremented optimistically
├── Trigger updates posts count (future)
└── Notification sent to post owner

Comment on Post
├── User submits comment
├── Record created in comments table
├── Notification sent to post owner
└── Displayed in post comment section

Follow User
├── User clicks follow
├── Record created in follows table
├── Follower count updated
└── Notification sent to followed user
```

### Table Relationships

```
                    ┌─────────────────┐
                    │    auth.users   │
                    │   (Supabase)    │
                    └────────┬────────┘
                             │
                             │ 1:1
                             ▼
                    ┌─────────────────┐
                    │    profiles     │
                    └─────────────────┘
                             │
                    ┌────────┼────────┐
                    │        │        │
                    │ 1:many │        │
                    ▼        │        │
            ┌─────────────┐  │        │
            │   posts     │  │        │
            └─────────────┘  │        │
              │       │      │        │
         1:many│      │      │        │
              ▼       ▼      │        │
       ┌────────────┐  ┌──────────┐  │
       │post_likes  │  │comments  │  │
       └────────────┘  └──────────┘  │
              │           │          │
              └───────┬───┘          │
                      │             │
                  1:many│           │
                      ▼            │
          ┌──────────────────────┐ │
          │  notifications      │ │
          └──────────────────────┘ │
                                   │
                 1:many             │
                      └─────────┬──┘
                                ▼
                        ┌──────────────┐
                        │   follows    │
                        └──────────────┘
                                │
                                │ 1:many
                                ▼
                        ┌──────────────┐
                        │ post_saves   │
                        └──────────────┘
```

## 🔐 Security Architecture

### Row Level Security (RLS)

```
SELECT
├── profiles: Public (anyone can view)
├── posts: Public posts visible to all
│          Private posts only to owner
│          (Friends posts visible to followers - future)
├── post_likes: Public (likes visible to all)
├── comments: Public (comments visible to all)
├── follows: Public (follows visible to all)
├── post_saves: Private (only owner can view)
├── notifications: Private (only recipient can view)
└── shortcuts: Private (only owner can view)

INSERT
├── profiles: Self only (during signup)
├── posts: Owner only
├── post_likes: Self only
├── comments: Self only
├── follows: Self as follower only
├── post_saves: Self only
├── notifications: System only
└── shortcuts: Owner only

UPDATE
├── profiles: Self only
├── posts: Owner only
├── comments: Owner only
└── notifications: Recipient can mark as read

DELETE
├── posts: Owner only
├── post_likes: User who liked only
├── comments: Owner only
├── follows: Follower only
├── post_saves: User who saved only
└── shortcuts: Owner only
```

### Authentication Flow

```
1. User submits email/password
   │
   ▼
2. Supabase Auth validates
   │
   ├─ Valid ──┐
   │          │
   └─ Invalid ▼ Error message
             │
             ▼
3. Session created
   ├── JWT token generated
   ├── Stored in localStorage
   └── Attached to API requests

4. API requests include token
   │
   ▼
5. Supabase validates token
   │
   ├─ Valid ──┐
   │          │
   └─ Invalid ▼ 401 Unauthorized
             │
             ▼
6. RLS policies applied
   ├── Check auth.uid()
   ├── Compare with row user_id
   └── Allow/deny access

7. Data returned to client
```

## 📊 Component Architecture

### Component Hierarchy

```
App
├── Router
│   ├── Header (persistent)
│   │   ├── Logo
│   │   ├── Search
│   │   └── Navigation
│   │
│   └── Routes
│       ├── Home
│       │   ├── Left Sidebar
│       │   │   ├── ProfileCard
│       │   │   └── ShortcutsCard
│       │   ├── Center Feed
│       │   │   ├── CreatePost
│       │   │   ├── FeedFilter
│       │   │   └── PostCard (many)
│       │   │       ├── PostHeader
│       │   │       ├── PostContent
│       │   │       ├── PostActions
│       │   │       └── CommentSection
│       │   │           ├── CommentList
│       │   │           └── CommentInput
│       │   └── Right Sidebar
│       │       ├── ActivityCard
│       │       └── SuggestedUsers
│       │
│       ├── Login
│       ├── Register
│       ├── Profile
│       │   ├── ProfileHeader
│       │   ├── ProfileStats
│       │   └── UserPosts
│       ├── Settings
│       ├── Explore
│       └── 404
```

### Component Reusability

```
Common Components (Used in Multiple Places)
├── Avatar                    (All places with user pics)
├── Button (Follow/Like)      (Multiple interactions)
├── Card                      (Profile, Post, Activity)
├── LoadingSkeleton          (All async sections)
├── Toast                    (Notifications)
└── Modal                    (Future: confirmations)

Page-Specific Components
├── Home (Feed, CreatePost)
├── Profile (UserHeader, PostList)
├── Settings (FormFields)
└── Explore (CategoryFilter)
```

## 🔄 Data Flow

### Post Creation Flow

```
User Input
  │
  ├─ Caption text
  ├─ Image file
  └─ Visibility selection
  │
  ▼
Client-side Validation
  ├─ Caption not empty
  ├─ Image format valid (JPG, PNG, WEBP)
  └─ File size < 20MB
  │
  ▼
Upload Image to Storage
  ├─ Generate unique filename
  ├─ Upload to post-images bucket
  └─ Get public URL
  │
  ▼
Insert Post Record
  ├─ user_id = current user
  ├─ caption = user input
  ├─ image_url = storage URL
  ├─ visibility = selected
  └─ created_at = NOW()
  │
  ▼
RLS Policy Check
  ├─ auth.uid() = user_id
  └─ Allow INSERT
  │
  ▼
Post Visible in Feed
  └─ Realtime update subscribers notified
```

### Like Flow (Optimistic UI)

```
User clicks Like
  │
  ▼
Optimistic Update
  ├─ Increment like count visually
  └─ Show as liked
  │
  ▼
Send INSERT to post_likes
  │
  ├─ Success
  │   └─ Keep optimistic state
  │
  └─ Error
      ├─ Decrement like count
      ├─ Show error toast
      └─ Revert to unlike state
```

### Follow Flow

```
User clicks Follow
  │
  ▼
INSERT into follows
  ├─ follower_id = current user
  └─ following_id = target user
  │
  ▼
RLS Policy Check
  ├─ auth.uid() = follower_id
  ├─ follower_id != following_id
  └─ Allow INSERT
  │
  ▼
Create Notification
  └─ Type: FOLLOW
  │
  ▼
Update Counts
  ├─ Increment current user's following_count
  └─ Increment target user's followers_count
  │
  ▼
Unfollow (DELETE)
  ├─ Remove from follows table
  ├─ Decrement counts
  └─ Delete notification
```

## 📱 State Management

### Zustand Stores

```
authStore
├── user: Profile | null
├── isAuthenticated: boolean
├── setUser: (user) => void
└── logout: () => void

// Used in useAuth hook
// Synced with Supabase auth state
```

### Local Component State

```
useState for:
├── Loading states
├── Form inputs
├── UI toggles (show/hide)
├── Pagination
└── Local filters

useCallback for:
├── Event handlers
├── Memoized functions
└── Preventing unnecessary renders
```

## 🔄 Real-time Updates (Future Implementation)

```
Supabase Realtime
├── Subscribe to table changes
├── Listen for:
│   ├── INSERT (new posts, comments)
│   ├── UPDATE (post edits, like counts)
│   └── DELETE (post/comment deletion)
├── Receive changes via WebSocket
└── Update UI automatically

Implementation:
supabase
  .from('posts')
  .on('*', payload => {
    // Handle changes
  })
  .subscribe()
```

## 🚀 Performance Optimization

### Frontend

```
Code Splitting
├── Route-based lazy loading
├── Component lazy loading
└── Dynamic imports

Caching
├── Browser cache for images
├── IndexedDB for offline data
└── localStorage for auth

Rendering
├── React.memo for pure components
├── useCallback for stable functions
├── useMemo for expensive calculations
└── Virtualization for large lists (future)

Assets
├── Image optimization
├── WebP format support
├── CDN delivery
└── Minification (Vite)
```

### Database

```
Indexes
├── posts.user_id
├── posts.created_at
├── post_likes.post_id
├── comments.post_id
├── follows.follower_id
├── notifications.recipient_id
└── etc.

Query Optimization
├── Pagination (limit/offset)
├── Select only needed columns
├── Batch operations
└── Connection pooling (Supabase)
```

## 🔄 Request/Response Cycle

### API Request Flow

```
1. React Component
   └─ Calls hook (usePosts, useAuth, etc.)
      │
      ▼
2. Custom Hook
   └─ Calls Supabase client
      │
      ▼
3. Supabase JavaScript SDK
   └─ Constructs query (filter, select, order)
      │
      ▼
4. PostgREST API
   ├─ auth token validation
   ├─ RLS policy check
   └─ Execute SQL query
      │
      ▼
5. PostgreSQL Database
   ├─ Execute query
   ├─ Apply indexes
   └─ Return results
      │
      ▼
6. PostgREST API
   └─ Format JSON response
      │
      ▼
7. Supabase SDK
   └─ Return data to hook
      │
      ▼
8. React Hook
   └─ setState with data
      │
      ▼
9. Component
   └─ Re-render with new data
```

## 🌐 API Endpoints (Auto-generated by PostgREST)

```
GET    /rest/v1/profiles                  # List all
GET    /rest/v1/profiles?id=eq.{uuid}     # Get one
POST   /rest/v1/profiles                  # Create
PATCH  /rest/v1/profiles?id=eq.{uuid}     # Update
DELETE /rest/v1/profiles?id=eq.{uuid}     # Delete

Query Parameters
├── select=column1,column2      # Select columns
├── filter=name.eq.value        # Filter
├── order=created_at.desc       # Sort
├── limit=10                    # Limit
└── offset=0                    # Pagination

Example:
GET /rest/v1/posts?select=*,user:profiles(username)&visibility=eq.public&order=created_at.desc&limit=10
```

## 📈 Scaling Considerations

### Current (Single Tenant)

```
- Single Supabase project
- Shared database
- Suitable for < 10K users
```

### Future (Multi-Tenant)

```
Option 1: Row-based isolation
├── Add tenant_id column
├── Filter by tenant_id in RLS
└── Keep single database

Option 2: Database-based isolation
├── Separate database per tenant
├── More isolation
└── Increased complexity

Option 3: Schema-based isolation
├── Separate schema per tenant
├── Middle ground
└── Requires enterprise Postgres
```

## 📚 Technology Stack Justification

| Technology | Why Chosen |
|-----------|-----------|
| React | Component-based, large ecosystem |
| TypeScript | Type safety, better developer experience |
| Vite | Fast builds, instant HMR |
| Tailwind | Utility-first, fast styling, small bundle |
| Supabase | Real-time, secure, serverless |
| PostgreSQL | Relational, reliable, ACID compliant |
| PostgREST | Auto-generated API, fast queries |

## 🔄 Deployment Architecture

### Development

```
Local Machine
├── React dev server (Vite)
├── Hot module replacement
└── Local .env file
```

### Production

```
CDN / Static Hosting
├── Vercel / Netlify / S3
├── Optimized build
├── Environment variables
└── Auto-HTTPS

Supabase Cloud
├── Managed PostgreSQL
├── Auto backups
├── Auto scaling
└── CDN for storage
```

---

This architecture is designed for:
- ✅ Scalability
- ✅ Security
- ✅ Performance
- ✅ Maintainability
- ✅ Developer experience
