# 🖼️ Setup Storage Buckets for Images

Image uploads are now enabled in the code! To make them work, you need to create storage buckets in Supabase.

## Step-by-Step Setup

### Step 1: Go to Supabase Dashboard

1. Open https://app.supabase.com/
2. Login to your account
3. Select your project: `iksijgrqkxmmqipjldyj`
4. Click **Storage** in the left sidebar

### Step 2: Create Storage Buckets

You need to create **3 buckets**. For each bucket:

1. Click **Create a new bucket**
2. Enter the exact name (case-sensitive)
3. Make sure **Public** is selected ✅
4. Click **Create**

---

## Bucket 1: `post-images`

**Name:** `post-images`  
**Public:** ✅ YES  
**Purpose:** User post images

### Steps:
1. Click **Create a new bucket**
2. In "Bucket name" field, type: `post-images`
3. Click the toggle for **Public** (should turn blue/green)
4. Click **Create bucket**

---

## Bucket 2: `avatars`

**Name:** `avatars`  
**Public:** ✅ YES  
**Purpose:** Profile avatar images

### Steps:
1. Click **Create a new bucket**
2. In "Bucket name" field, type: `avatars`
3. Click the toggle for **Public**
4. Click **Create bucket**

---

## Bucket 3: `covers`

**Name:** `covers`  
**Public:** ✅ YES  
**Purpose:** Profile cover/header images

### Steps:
1. Click **Create a new bucket**
2. In "Bucket name" field, type: `covers`
3. Click the toggle for **Public**
4. Click **Create bucket**

---

## Verify Buckets Are Created

In the Storage page, you should see:

```
📦 post-images   (Public)
📦 avatars       (Public)
📦 covers        (Public)
```

---

## Important: Bucket Naming

⚠️ **Names are CASE-SENSITIVE!**

✅ Correct:
- `post-images` (lowercase with hyphen)
- `avatars` (all lowercase)
- `covers` (all lowercase)

❌ Wrong:
- `Post-Images` (capital P)
- `Avatars` (capital A)
- `post_images` (underscore instead of hyphen)

---

## Test Image Upload

Once buckets are created:

1. **Refresh browser**: `Ctrl+R`
2. **Create a post**:
   - Add text: "Test post with image"
   - Click image icon 🖼️
   - Select an image file
   - See preview
3. **Click Post**
4. Image should upload and display! ✅

---

## Troubleshooting

### "Bucket not found" error
- Check bucket name spelling (case-sensitive)
- Verify bucket is set to PUBLIC
- Refresh browser

### Image uploads but doesn't display
- Check if image_url is being saved in database
- Verify bucket is PUBLIC (not private)
- Check browser console (F12) for errors

### 403 Forbidden error
- Bucket might not be PUBLIC
- Go to Supabase → Storage → bucket → Settings
- Make sure Public is toggled ON

---

## Alternative: Check Existing Buckets

If you already created buckets (like "Document"), you can:

1. Go to Supabase Storage
2. Click on bucket name
3. Click "Settings" tab
4. Check/edit bucket name and public status
5. Rename to `post-images`, `avatars`, or `covers` as needed

---

## Success Indicators ✅

After setup, you should be able to:
- ✅ Click image icon when creating post
- ✅ Select an image file
- ✅ See image preview
- ✅ Click Post
- ✅ Image uploads to Supabase
- ✅ Image displays in post on feed
- ✅ Image persists after page refresh

---

## Need More Help?

1. **Check bucket status**: Supabase → Storage → verify all 3 buckets exist
2. **Check browser console**: F12 → Console tab → look for upload errors
3. **Check database**: Posts table should have `image_url` column populated

---

**Status: Image uploads ready once buckets are created! 🚀**

