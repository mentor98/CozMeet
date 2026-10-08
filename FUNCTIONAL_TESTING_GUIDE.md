# CozMeet Functional Testing Guide

## ✅ Complete Implementation Status

All core features have been implemented and connected to Supabase:

### ✓ Implemented Features:
- **Authentication**: Register/Login with profile creation
- **Posts**: Create posts with text + images, fetch from database
- **Likes**: Like/unlike posts with real-time count updates
- **Comments**: Add comments to posts (real-time fetch)
- **Follow**: Follow/unfollow users from suggestions
- **Share**: Share posts (copies link + records share)
- **Image Upload**: Upload images to Supabase Storage

---

## 🚀 Getting Started (5 Minutes)

### Step 1: Setup Supabase Database

1. Open: https://app.supabase.com
2. Select your project: **iksijgrqkxmmqipjldyj**

#### Run Migrations (in order):

**Migration 1 - Schema:**
- Go to **SQL Editor** → **New Query**
- Copy content from: `Backend/migrations/001_schema.sql`
- Paste and click **RUN** (Ctrl+Enter)
- Wait for ✓ success

**Migration 2 - Row Level Security:**
- New Query again
- Copy from: `Backend/migrations/002_rls.sql`
- Paste and **RUN**
- Wait for ✓ success

**Migration 3 - Sample Data:**
- New Query again
- Copy from: `Backend/migrations/003_seed.sql`
- Paste and **RUN**
- Wait for ✓ success

### Step 2: Create Storage Buckets

1. Go to **Storage** (left sidebar)
2. Click **Create a new bucket**

Create 3 PUBLIC buckets:
- `avatars`
- `covers`
- `post-images`

For each bucket:
- Click bucket name
- Go to **Policies** tab
- Click **New Policy**
- Select "Enable read access for all users"
- Click **Review** → **Save policy**

### Step 3: Verify Database Tables

Go to **Database** → **Tables** and verify:
- ✓ profiles
- ✓ posts
- ✓ post_likes
- ✓ comments
- ✓ follows
- ✓ post_saves
- ✓ post_shares
- ✓ notifications
- ✓ shortcuts

---

## 🧪 Testing Workflow

### Test 1: Authentication

**Register New Account:**
1. Go to: http://localhost:5173/
2. Click **Register**
3. Fill in:
   - Display Name: `John Doe`
   - Username: `johndoe`
   - Email: `john@example.com`
   - Password: `Test123!`
   - Confirm Password: `Test123!`
4. Click **Register**
5. Should redirect to Login page
6. Login with your credentials

**Expected Result:** ✓ Profile appears on Home page

### Test 2: Create Posts

**With Text Only:**
1. Click "Share something..." box
2. Type: "This is my first post!"
3. Leave visibility as "Public"
4. Click **Post**
5. Should appear at top of feed

**With Image:**
1. Click "Share something..." box
2. Type: "Check out this photo!"
3. Click image icon
4. Select an image from your computer
5. Preview appears
6. Click **Post**
7. Image uploads to Supabase Storage
8. Post appears with image

**Expected Result:** ✓ Posts appear in feed with correct data

### Test 3: Like/Unlike

1. Hover over a post
2. Click **❤️ Like** button
3. Count increases from 0 → 1
4. Heart fills with red color
5. Click again to unlike
6. Count decreases from 1 → 0
7. Heart becomes outline

**Expected Result:** ✓ Like state toggles correctly

### Test 4: Comments

1. Click **💬 Comments** button
2. Comment section appears
3. Type in comment box: "Great post!"
4. Click **Post**
5. Comment appears below post
6. Shows your avatar, name, timestamp

**Expected Result:** ✓ Comment displays with user info

### Test 5: Follow Users

1. Scroll to **Suggested For you** (right sidebar)
2. Click **Follow** button on a user
3. Button changes to **Following**
4. Color changes to grey
5. Click again to unfollow
6. Button changes back to **Follow**

**Expected Result:** ✓ Follow state toggles correctly

### Test 6: Share Posts

1. Click **Share** button on a post
2. Alert appears: "Post link copied to clipboard!"
3. Link is in format: `http://localhost:5173/post/[post-id]`
4. Paste the link somewhere to verify
5. Open the link → should show that specific post

**Expected Result:** ✓ Post link copied and shareable

### Test 7: Feed Filtering

1. Use sort dropdown: "Sort by: Recent"
2. Change to "Popular"
3. Feed reorders
4. Change to "Following"
5. Feed shows posts from followed users

**Expected Result:** ✓ Posts reorder correctly

### Test 8: Profile Display

**Current User Profile (Left Sidebar):**
- Shows avatar (if set)
- Shows display name
- Shows username
- Shows stats: Posts, Followers, Following
- Has "Edit Profile" button

**Expected Result:** ✓ Profile card shows current user

---

## 🔧 Troubleshooting

### App Won't Start
```bash
cd Frontend
npm install  # Install dependencies if needed
npm run dev  # Start dev server
```

### Posts Not Loading
- Check browser console (F12) for errors
- Verify Supabase credentials in `.env`
- Verify database tables were created (step in testing)

### Image Upload Fails
- Check if `post-images` bucket exists in Supabase Storage
- Verify bucket policies allow uploads
- Check browser console for specific error

### Comments Not Showing
- Refresh page (Ctrl+R)
- Verify `comments` table exists
- Check RLS policies were applied (002_rls.sql)

### Can't Follow Users
- Verify `follows` table exists
- Check that users are being fetched in suggestions
- Verify follow insert permissions

### Like Count Not Updating
- Check `post_likes` table exists
- Verify RLS policies for likes
- Clear browser cache and refresh

---

## 📊 Data Flow

### Creating a Post:
```
User fills form → Clicks Post
  ↓
Image uploaded to Storage (if selected)
  ↓
Post inserted into `posts` table
  ↓
Home page refreshes
  ↓
Post fetches user data from `profiles`
  ↓
Post fetches likes count from `post_likes`
  ↓
Post fetches comments count from `comments`
  ↓
Post renders in feed
```

### Liking a Post:
```
User clicks Like button
  ↓
Check if already liked (query `post_likes`)
  ↓
If not liked: Insert row into `post_likes`
If liked: Delete row from `post_likes`
  ↓
Update UI immediately
  ↓
Increment/decrement likes_count
  ↓
Set is_liked state
```

### Adding Comment:
```
User types and submits comment
  ↓
Insert into `comments` table
  ↓
CommentList component re-fetches all comments
  ↓
New comment appears in feed
  ↓
Post's comments_count updates
```

---

## 📱 Features Ready to Use

| Feature | Status | Implementation |
|---------|--------|-----------------|
| Register | ✅ Done | Profile auto-created in `profiles` table |
| Login | ✅ Done | Supabase Auth integration |
| Create Post | ✅ Done | Insert to `posts`, upload to Storage |
| Post with Image | ✅ Done | Image to `post-images` bucket |
| Fetch Posts | ✅ Done | Query `posts` + joins with `profiles` |
| Like Posts | ✅ Done | Insert/delete from `post_likes` |
| Comment | ✅ Done | Insert to `comments`, real-time fetch |
| Follow Users | ✅ Done | Insert/delete from `follows` |
| Share Posts | ✅ Done | Insert to `post_shares`, copy link |
| Feed Filtering | ✅ Done | Sort by recent/popular/following |
| User Suggestions | ✅ Done | Fetch unfollowed users |

---

## 🎯 Next Steps After Testing

If everything works:
1. ✅ All features are functional
2. ✅ Database is connected
3. ✅ Image uploads working
4. ✅ Follow system working
5. ✅ Comments real-time
6. ✅ Likes updating

If issues found, refer to troubleshooting section above.

---

## 📞 Contact

For issues or questions:
1. Check browser console (F12) for error messages
2. Check Supabase dashboard for database status
3. Verify all migrations ran successfully
4. Ensure storage buckets are PUBLIC

---

**Status: 🟢 All Features Implemented & Connected**
