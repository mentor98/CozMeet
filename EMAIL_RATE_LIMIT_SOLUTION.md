# 📧 Email Rate Limit Exceeded - Solution

## What Happened?

Supabase limits email registrations to prevent spam/abuse:
- **Max 3 registrations per hour** from same email
- **Max registrations per unique email per hour**

You've hit this limit trying to register multiple times.

---

## ✅ Solutions

### Solution 1: Wait 1 Hour ⏳
Simply wait and try again later. Rate limit resets after 1 hour.

### Solution 2: Use Different Email 📧
Try registering with a DIFFERENT email address:

Instead of: `test@example.com`
Try: `test2@example.com` or `test123@example.com` or any other

### Solution 3: Use Temporary Email 🔄
Use a temporary email service (doesn't need verification):

- **10minutemail.com**
- **tempmail.io**
- **guerrillamail.com**
- **mailinator.com**

Just use a different temp email each time.

### Solution 4: Disable Email Verification (Dev Mode)

In Supabase Dashboard:
1. Go to **Settings** → **Auth**
2. Find **Email Confirmations**
3. Set to **Require email confirmation: OFF**
4. Now registrations work without email verification

This is for development only. Enable it back for production.

---

## 🧪 Recommended: Use Test Account

**Instead of registering multiple times, use one test account:**

1. **Use different email:** `testuser123@example.com`
2. **Password:** `Test123!`
3. **Name:** Test User
4. **Username:** testuser123

Then test features without re-registering.

---

## 📊 Rate Limit Details

| Limit | Value |
|-------|-------|
| Registrations per email per hour | 3 |
| Reset time | 1 hour |
| Error message | "Email rate limit exceeded" |
| Solution | Use different email or wait |

---

## 🚀 Quick Fix Right Now

**Pick ONE:**

### Option A: Use Different Email
```
Email: test2@example.com
Password: Test123!
Name: Test User 2
Username: testuser2
```

### Option B: Use Temp Email
```
Go to: 10minutemail.com
Copy temporary email
Use in registration form
```

### Option C: Disable Email Verification
```
Supabase Dashboard
Settings → Auth
Email Confirmations: OFF
```

---

## ✅ Then Test Features

After registering with ONE account:

1. **Login** ✅
2. **Create Post** ✅
3. **Upload Image** ✅
4. **Like Post** ✅
5. **Comment** ✅
6. **Follow User** ✅

No need to keep registering!

---

## 🔒 For Production

**Always enable email verification:**
- Supabase Dashboard
- Settings → Auth
- Email Confirmations: ON
- This prevents fake accounts

---

## 💡 Pro Tip

Save your test credentials somewhere:
```
Email: test123@example.com
Password: Test123!
Username: testuser123
```

Then you can test everything without re-registering.

---

**Status: This is normal behavior** ✅

Rate limits protect your backend from spam/abuse.

Choose **Option A** (different email) and you're good to go!
