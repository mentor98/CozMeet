# 🔧 Fix 406 Error - Profile Not Loading

The 406 error means "Not Acceptable" - it's a header/CORS issue when querying the profiles table.

## ✅ Quick Fixes

### Fix 1: Check Supabase CORS Settings

1. Go to: https://app.supabase.com
2. Go to: **Settings** → **API**
3. Look for **CORS Settings**
4. Make sure these are in the list:
   - `http://localhost:5173`
   - `http://localhost:*`
   - Or: `*` (allow all)
5. Click **Save**

### Fix 2: Restart Browser

1. Close browser completely
2. Clear all browser data (Ctrl+Shift+Delete)
3. Reopen browser
4. Go to http://localhost:5173
5. Try login again

### Fix 3: Verify Profiles Table Exists

1. Go to https://app.supabase.com
2. Go to: **Database** → **Tables**
3. Look for **profiles** table
4. Click it
5. Should show columns: id, username, display_name, bio, etc.

If not there, run this SQL in **SQL Editor**:

```sql
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Profiles viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can create own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

### Fix 4: Check RLS Policies

1. Go to https://app.supabase.com
2. **Database** → **Tables** → **profiles**
3. Click **RLS** button
4. Should see these policies:
   - "Profiles viewable by everyone" (SELECT)
   - "Users can create own profile" (INSERT)
   - "Users can update own profile" (UPDATE)

If missing, run the SQL above.

### Fix 5: Clear App Cache

1. Press: **F12** (Developer Tools)
2. Go to: **Application** tab
3. Left sidebar: **Local Storage**
4. Right-click entry for localhost:5173
5. Click **Delete**
6. Also clear **Cookies** for localhost:5173
7. Close DevTools
8. Refresh page
9. Try login again

---

## 🎯 Most Likely Cause

The **profiles table might not have the correct RLS policies** or **your user might not have been created correctly**.

---

## ✅ Verification Checklist

- [ ] CORS settings include localhost:5173
- [ ] Profiles table exists
- [ ] Profiles table has RLS enabled
- [ ] RLS policies exist (3 of them)
- [ ] Browser cache cleared
- [ ] Can see users in Auth dashboard

---

## 🚀 After Fixes

1. Close browser completely
2. Reopen http://localhost:5173
3. Try login again
4. Should work now! ✅

---

## If Still Not Working

1. Check browser console (F12 → Console)
2. Look for error details
3. Check Supabase dashboard for any error messages
4. Verify user exists in Auth → Users
5. Verify profile exists in Tables → profiles

---

**Try Fix 1 & 2 first - those usually work!**
