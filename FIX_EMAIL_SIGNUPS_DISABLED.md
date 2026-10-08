# ✅ Fix "Email signups are disabled" Error

## What Happened?

You disabled **email signups** when you should have disabled **email confirmation**.

These are TWO DIFFERENT settings!

---

## 🔧 How to Fix (1 minute)

### Step 1: Open Supabase
Go to: https://app.supabase.com

### Step 2: Go to Authentication Settings
- Click **Settings** (gear icon)
- Click **Authentication**

### Step 3: Find Providers Section
Look for: **Providers** section

### Step 4: Enable Email Provider
Find: **Email** provider
Check/Toggle: **Enabled** → **ON**
Click: **Save**

---

## 📋 Correct Settings to Use

**ENABLE (turn ON):**
- ✅ Email (Provider) - must be ON
- ✅ Allow signups - must be ON

**DISABLE (turn OFF):**
- ❌ Require email confirmation - turn this OFF

---

## 🎯 Step-by-Step Correct Path

1. **Supabase Dashboard**
   - https://app.supabase.com
   - Select project

2. **Settings → Authentication**
   - Click Settings (gear icon)
   - Click "Authentication"

3. **Providers Section**
   - Find "Email" provider
   - Toggle **Enabled: ON** (must be ON)
   - Toggle **Allow signups: ON** (must be ON)

4. **User Settings Section** (if exists)
   - Find "Email Confirmations"
   - Toggle: **OFF** (for development)

5. **Save**
   - Click "Save" button

---

## ✅ What Should Be Enabled

| Setting | Status | Why |
|---------|--------|-----|
| Email Provider | ✅ ON | Required for email registration |
| Allow signups | ✅ ON | Required for new users |
| Email confirmation | ❌ OFF | For unlimited testing |

---

## 📸 Visual Guide

```
Providers
├── Email
│   ├── Enabled: ✅ ON (must be on)
│   ├── Allow signups: ✅ ON (must be on)
│   └── Other settings...
└── Other providers

User Settings
├── Email Confirmations: ❌ OFF (for development)
└── Other settings...
```

---

## 🚀 After Fix

Go to http://localhost:5173 and try registering again!

Should work now: ✅

---

## 💡 Key Difference

**Email Provider (ENABLE):**
- Allows users to sign up with email
- If OFF → "Email signups are disabled" error
- Must be ON

**Email Confirmation (DISABLE for dev):**
- Requires users to verify email
- If ON → Rate limits apply
- Turn OFF for unlimited development testing

---

**Status: Fix your Supabase settings above!**

Time needed: 1 minute
