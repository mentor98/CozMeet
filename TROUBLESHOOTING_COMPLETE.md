# 🛠️ Complete Troubleshooting Guide

## Current Status

Your app is **running and working**, but registration is hitting rate limits and errors.

---

## ⚠️ Errors Explained

| Error | Meaning | Solution |
|-------|---------|----------|
| **429** | Too many requests | Wait 10 minutes |
| **400** | Bad request | Check form data |
| **406** | Not acceptable | Clear cache |
| **422** | Invalid validation | Check email format |
| **ERR_INTERNET_DISCONNECTED** | Network issue | Check internet |

---

## ✅ Quick Fixes (Try These)

### Fix 1: Wait & Retry
```
⏳ Wait 15 minutes
Then try with NEW email
```

### Fix 2: Clear Browser Cache
```
Press: Ctrl+Shift+Delete
Select: Clear cache
Then: Refresh page (Ctrl+R)
```

### Fix 3: Use Different Email
```
Try: test123@example.com
Or: test456@example.com
Or: anything@example.com (just change the number)
```

### Fix 4: Check Internet
```
Refresh: http://localhost:5173
If fails: Check WiFi/internet connection
Restart browser if needed
```

### Fix 5: Check Supabase Status
```
Go to: https://status.supabase.com
If red/issues: Supabase is down, wait
If green: Supabase is working
```

---

## 🧪 Step-by-Step Testing

### Step 1: Wait
- [ ] Wait 15 minutes from last registration attempt

### Step 2: Clear Cache
- [ ] Press Ctrl+Shift+Delete
- [ ] Select "Cached images and files"
- [ ] Click "Clear"

### Step 3: Refresh Page
- [ ] Go to http://localhost:5173/register
- [ ] Press Ctrl+R to refresh

### Step 4: Try Registration
- [ ] Email: `testuser_new@example.com`
- [ ] Password: `Test123!`
- [ ] Name: `Test User`
- [ ] Username: `testuser_new`
- [ ] Click Register

### Step 5: Expected Result
- ✅ Should show "Redirecting to login" or take you to login page
- ✅ Try logging in with credentials
- ✅ Should see home page with feed

---

## 🔍 If Still Not Working

### Check 1: Supabase Database
```
Go to: https://app.supabase.com
Go to: Database > Tables
Verify exists:
  ✅ profiles
  ✅ posts
  ✅ post_likes
  ✅ comments
  ✅ follows
  ✅ post_saves
  ✅ post_shares
  ✅ notifications
  ✅ shortcuts
```

### Check 2: Supabase Auth Settings
```
Go to: Settings > Authentication
Verify:
  ✅ Email provider: ENABLED
  ✅ Allow signups: ON
  ✅ Email confirmations: OFF (for dev)
```

### Check 3: Browser Console
```
Press: F12 (Developer Tools)
Go to: Console tab
Look for: Red error messages
Report those errors
```

### Check 4: Network Tab
```
Press: F12 (Developer Tools)
Go to: Network tab
Try registering again
Look for: Red failed requests
Check the error details
```

---

## 🚀 If Everything Checks Out

Once registration works:

1. **Login** with your credentials
2. **Create a post** (text only first)
3. **Upload an image** to test storage
4. **Like a post** to test likes
5. **Comment** to test comments
6. **Follow a user** to test follow system
7. **Share a post** to test sharing

---

## 📋 Verification Checklist

- [ ] Waited 15 minutes
- [ ] Cleared browser cache
- [ ] Using different email
- [ ] Internet connection working
- [ ] Supabase database has all tables
- [ ] Auth settings correct
- [ ] Developer console has no errors
- [ ] Tried registering with valid email
- [ ] Got success/redirect message

---

## 💡 Common Issues & Fixes

### Issue: Still getting 429 error
**Fix:** Wait longer (429 = rate limited, takes time to reset)

### Issue: Getting 400 error
**Fix:** Check email format is valid (contains @)

### Issue: Page shows "loading..." forever
**Fix:** Check internet connection, refresh page

### Issue: Can login but no home page shows
**Fix:** Check profile was created in database

### Issue: Posts page is blank
**Fix:** Create your first post, then refresh

---

## 🎯 Success Indicators

You'll know it's working when:

✅ Can register with new email
✅ Can login after registration
✅ See home page after login
✅ Can create posts
✅ Can upload images
✅ Can like posts
✅ Can comment
✅ Can follow users

---

## 📞 Next Steps

1. **Wait 15 minutes** - Let rate limits reset
2. **Try these fixes** - Follow steps above
3. **Test registration** - Use new email
4. **Report back** - If still failing, share specific error

---

## ✨ Summary

**Current State:** App running, registration hitting rate limits

**Root Cause:** Too many registration attempts too quickly

**Solution:** Wait + try with new email + clear cache

**Expected Time:** 15 minutes

**Likely Outcome:** Registration will work! ✅

---

**Go ahead and follow the steps above. Should be working soon!**
