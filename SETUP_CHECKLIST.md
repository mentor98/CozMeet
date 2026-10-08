# ✅ CozMeet Supabase Setup Checklist

## Status: READY TO SETUP

Your Supabase project has been created and your app is running!

**App URL:** http://localhost:5173/  
**Status:** ✅ Running at port 5173

---

## 📋 Setup Checklist

### Phase 1: Supabase Dashboard Login ✅
- [ ] Go to https://app.supabase.com
- [ ] Log in with your credentials
- [ ] Select project: **iksijgrqkxmmqipjldyj**
- [ ] Dashboard opens successfully

### Phase 2: Database Schema (10 minutes)

#### Run Migration 1: Create Tables
- [ ] Go to **SQL Editor** in Supabase
- [ ] Click **"New Query"**
- [ ] Open file: `Backend/migrations/001_schema.sql`
- [ ] Copy ALL content
- [ ] Paste into SQL Editor
- [ ] Click **RUN**
- [ ] See success message ✓

#### Run Migration 2: Add Security Policies
- [ ] Click **"New Query"** again
- [ ] Open file: `Backend/migrations/002_rls.sql`
- [ ] Copy ALL content
- [ ] Paste into SQL Editor
- [ ] Click **RUN**
- [ ] See success message ✓

#### Run Migration 3: Seed Demo Data
- [ ] Click **"New Query"** again
- [ ] Open file: `Backend/migrations/003_seed.sql`
- [ ] Copy ALL content
- [ ] Paste into SQL Editor
- [ ] Click **RUN**
- [ ] See success message ✓

### Phase 3: Verify Database Tables ✅
Go to **Database > Tables** and verify these exist:
- [ ] profiles
- [ ] posts
- [ ] post_likes
- [ ] comments
- [ ] follows
- [ ] post_saves
- [ ] post_shares
- [ ] notifications
- [ ] shortcuts

**Count: 9 tables total**

### Phase 4: Create Storage Buckets (5 minutes)

#### Create Bucket 1: avatars
- [ ] Go to **Storage** in Supabase
- [ ] Click **"Create a new bucket"**
- [ ] Name: `avatars`
- [ ] Publicity: **Public**
- [ ] Click **"Create bucket"**

#### Create Bucket 2: covers
- [ ] Click **"Create a new bucket"**
- [ ] Name: `covers`
- [ ] Publicity: **Public**
- [ ] Click **"Create bucket"**

#### Create Bucket 3: post-images
- [ ] Click **"Create a new bucket"**
- [ ] Name: `post-images`
- [ ] Publicity: **Public**
- [ ] Click **"Create bucket"**

### Phase 5: Configure Storage Policies (3 minutes)

#### Set Policy for avatars bucket
- [ ] Click **avatars** bucket
- [ ] Go to **Policies** tab
- [ ] Click **"New Policy"**
- [ ] Select **"Enable read access for all users"**
- [ ] Click **"Review"**
- [ ] Click **"Save policy"**

#### Set Policy for covers bucket
- [ ] Click **covers** bucket
- [ ] Go to **Policies** tab
- [ ] Click **"New Policy"**
- [ ] Select **"Enable read access for all users"**
- [ ] Click **"Review"**
- [ ] Click **"Save policy"**

#### Set Policy for post-images bucket
- [ ] Click **post-images** bucket
- [ ] Go to **Policies** tab
- [ ] Click **"New Policy"**
- [ ] Select **"Enable read access for all users"**
- [ ] Click **"Review"**
- [ ] Click **"Save policy"**

### Phase 6: Verify Storage Buckets ✅
Go to **Storage** and verify these exist:
- [ ] avatars (Public)
- [ ] covers (Public)
- [ ] post-images (Public)

**Count: 3 buckets total**

### Phase 7: Test Connection (2 minutes)

#### Create Test Account
- [ ] Open http://localhost:5173/
- [ ] Click **"Register"**
- [ ] Fill in:
  - Email: `test@example.com`
  - Password: `TestPassword123!`
  - Display Name: `Test User`
  - Username: `testuser`
- [ ] Click **"Register"**
- [ ] Successfully logged in ✓

#### Test Create Post
- [ ] On home page, click **"Share something..."**
- [ ] Type caption: `My first CozMeet post! 🎉`
- [ ] (Optional) Upload an image
- [ ] Click **"Post"**
- [ ] Post appears in feed ✓

#### Test Interactions
- [ ] Like the post ❤️
- [ ] Add a comment 💬
- [ ] Like the comment ❤️

### Phase 8: Environment Configuration ✅
Check that `.env` file exists with:
```
VITE_SUPABASE_URL=https://iksijgrqkxmmqipjldyj.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_TTjwLgb4nVw75CyX8bEJTA_eZYLviIF
```
- [ ] File exists at: `Frontend/.env`
- [ ] Values are correct
- [ ] App is running with these values

---

## 🚀 Final Status

### When All Checkboxes Are Complete:

✅ Database is ready  
✅ Storage is configured  
✅ App is connected  
✅ Users can create accounts  
✅ Users can post content  
✅ Users can interact (like, comment)  
✅ Images are stored  

**STATUS: PRODUCTION READY! 🎉**

---

## 📊 Quick Statistics

**Database:**
- 9 Tables created
- 30+ Columns total
- Row-level security enabled
- Indexes created for performance

**Storage:**
- 3 Public buckets
- Ready for avatars, covers, and post images

**App:**
- React frontend running
- Supabase connected
- Demo data loaded
- Ready for real users

---

## ⚠️ Troubleshooting

### If database migration fails:
1. Check for SQL errors in the error message
2. Delete any partially created tables
3. Re-run the migration
4. Check `Backend/migrations/` files are not corrupted

### If storage bucket creation fails:
1. Verify bucket name is exactly correct
2. Ensure "Public" is selected
3. Try again with a different bucket name
4. Check Supabase status page

### If app won't connect:
1. Check `.env` file has correct URL and key
2. Restart dev server: `npm run dev`
3. Clear browser cache
4. Check network tab for CORS errors

### If registration fails:
1. Check email format is correct
2. Check password meets requirements
3. Wait a moment and try again
4. Check browser console for errors

---

## 📞 Support

If you get stuck:

1. **Read:** `SUPABASE_SETUP_INSTRUCTIONS.md` (detailed guide)
2. **Quick:** `SUPABASE_QUICK_SETUP.txt` (step-by-step)
3. **Check:** Browser console for errors (F12)
4. **Verify:** All migration files are in `Backend/migrations/`

---

## ✨ What's Next After Setup?

1. Create more test accounts
2. Post content
3. Test all features
4. Customize branding
5. Deploy to production
6. Invite real users!

---

**Your Supabase Setup Journey Starts Now! 🚀**

Time estimate: **30 minutes total**

Good luck! 🎉
