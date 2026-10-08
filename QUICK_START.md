# CozMeet - Quick Start Guide

## Current Status ✅

- **Frontend**: Running at http://localhost:5173
- **Auth**: Login/Register working
- **Database**: Connected and synced
- **Posts**: Text-only posts now working
- **Likes, Comments, Follows**: All features implemented

---

## What's Fixed 🔧

1. ✅ Removed all `.single()` calls (causing 406 errors)
2. ✅ Fixed React hook ordering issues
3. ✅ Added fallback profile generation
4. ✅ Simplified profile queries with `.limit(1)`
5. ✅ Text-only post creation now working

---

## To Get Everything Working 🚀

### Step 1: Delete Wrong Storage Bucket
If you created a bucket called "Document", delete it from Supabase Storage. We need specific bucket names.

### Step 2: Create Required Storage Buckets

Go to **Supabase Dashboard → Storage** and create these 3 buckets:

| Name | Public | Purpose |
|------|--------|---------|
| `post-images` | ✅ Yes | Post images |
| `avatars` | ✅ Yes | Profile avatars |
| `covers` | ✅ Yes | Cover photos |

**Steps for each bucket:**
1. Click **Create a new bucket**
2. Enter the exact name (case-sensitive)
3. Choose **Public**
4. Click Create

### Step 3: Test Text Posts

1. Refresh browser: **Ctrl+R**
2. Login with your account
3. In the home feed, type a message
4. Click **Post**
5. Should appear instantly on the feed ✅

### Step 4: Enable Image Uploads (Optional)

Once storage buckets exist, image uploads will work automatically. Just:
1. Click the image icon when creating a post
2. Select an image
3. Post as normal

---

## Testing Checklist ✅

After setup, test these features:

- [ ] Login/Register working
- [ ] Text posts creating successfully
- [ ] Posts appearing in feed
- [ ] Likes working
- [ ] Comments working
- [ ] Follow button working
- [ ] Navigation working
- [ ] Profile pages loading

---

## Troubleshooting

### "Failed to create post" error
- Check browser console (F12) for exact error
- Verify you're logged in
- Try refreshing page

### Images not uploading
- Verify storage buckets exist (exactly named)
- Check bucket is set to PUBLIC
- Refresh browser and try again

### Profile loading slowly
- First load takes ~3 seconds (normal)
- Uses fallback profile if DB unreachable
- Subsequent loads are instant

### 406 "Not Acceptable" errors
- Already fixed in this version
- If still seeing: clear browser cache (Ctrl+Shift+Delete)
- Refresh the page

---

## API Endpoints Status

| Feature | Status |
|---------|--------|
| Auth (Register/Login) | ✅ Working |
| Posts (Create) | ✅ Working |
| Posts (Read) | ✅ Working |
| Likes | ✅ Working |
| Comments | ✅ Working |
| Follows | ✅ Working |
| Images | ⏳ Requires bucket setup |
| Notifications | 📋 Planned |

---

## Need Help?

1. **Check the browser console** (F12) for error messages
2. **Check Supabase Dashboard** - verify tables exist
3. **Verify storage buckets** - must be PUBLIC and exact names
4. **Refresh the page** - browser caching can cause issues

---

## Next Steps (Advanced)

- Implement real-time notifications
- Add video support
- Add user mentions
- Add hashtag search
- Add DM system

