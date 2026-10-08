# CozMeet Supabase Setup Guide

Complete step-by-step guide to set up CozMeet with Supabase.

## Prerequisites

- Supabase account (free tier available)
- Basic understanding of SQL
- Git and Node.js installed locally

## Step 1: Create Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Enter:
   - **Project Name**: cozmeet
   - **Database Password**: Create a strong password and save it
   - **Region**: Choose closest to your location
4. Click **"Create new project"**
5. Wait for project initialization (5-10 minutes)

## Step 2: Get Project Credentials

1. Go to **Settings > API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **public anon key** → `VITE_SUPABASE_ANON_KEY`
3. Save to `.env` file in Frontend folder

Example `.env`:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Create Database Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New Query"**
3. Copy entire contents of `migrations/001_schema.sql`
4. Paste into the editor
5. Click **"Run"**
6. Wait for completion ✓

## Step 4: Apply Row Level Security

1. Go to **SQL Editor**
2. Click **"New Query"**
3. Copy entire contents of `migrations/002_rls.sql`
4. Paste and click **"Run"**
5. Verify all policies are created ✓

## Step 5: Seed Demo Data

1. Go to **SQL Editor**
2. Click **"New Query"**
3. Copy entire contents of `migrations/003_seed.sql`
4. Paste and click **"Run"**
5. Check notification for success ✓

## Step 6: Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Click **"New Bucket"** for each:

### Bucket 1: avatars
- **Name**: avatars
- **Publicity**: Public
- **Create**

### Bucket 2: covers
- **Name**: covers
- **Publicity**: Public
- **Create**

### Bucket 3: post-images
- **Name**: post-images
- **Publicity**: Public
- **Create**

## Step 7: Configure Storage Policies

For each bucket, add read and write access:

### For each bucket:

1. Go to **Storage > [bucket-name] > Policies**
2. Click **"New Policy"**
3. Choose **"Create policy from template"**
4. For **avatars** and **covers**:
   - Select: **Enable read access for all users**
   - Click **"Review"** then **"Save policy"**
   - Select: **Enable write access for authenticated users only**
   - Click **"Review"** then **"Save policy"**

5. For **post-images**:
   - Select: **Enable read access for all users**
   - Select: **Enable write access for authenticated users only**

## Step 8: Configure Authentication

1. Go to **Authentication > Providers**
2. Enable **"Email"**
3. Go to **Authentication > URL Configuration**
4. Set **Site URL**:
   - Development: `http://localhost:5173`
   - Production: Your domain
5. Add **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/`
   - Your production URLs

## Step 9: Frontend Setup

1. Navigate to Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with credentials:
   ```env
   VITE_SUPABASE_URL=your_url_here
   VITE_SUPABASE_ANON_KEY=your_key_here
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. App opens at `http://localhost:5173`

## Step 10: Test the Application

1. Click **"Register"** on login page
2. Create demo account:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Display Name: `Test User`
   - Username: `testuser`
3. Click **"Register"**
4. You're logged in!

## Step 11: Verify Everything Works

- [ ] Registration works
- [ ] Login works
- [ ] Can create posts
- [ ] Can upload images
- [ ] Can like posts
- [ ] Can comment on posts
- [ ] Can follow users
- [ ] Profile page loads
- [ ] Settings page loads
- [ ] Notifications appear

## Common Issues & Solutions

### Issue: "Unable to connect to Supabase"
**Solution**: 
- Check `.env` file has correct URL and API key
- Verify API key is the public **anon key**, not service role key
- Restart dev server after updating `.env`

### Issue: "Authentication failed"
**Solution**:
- Ensure email is verified (check spam folder)
- Check authentication settings in Supabase dashboard
- Verify redirect URLs are configured

### Issue: "File upload fails"
**Solution**:
- Check storage bucket exists and is public
- Verify storage policies are applied
- Check file size is under limit (20MB for posts)

### Issue: "Can't see other users' posts"
**Solution**:
- Check RLS policies are applied correctly
- Verify posts have `visibility = 'public'`
- Check user has proper authentication token

### Issue: "403 Forbidden" errors
**Solution**:
- Likely RLS policy issue
- Run `002_rls.sql` again to reapply policies
- Check database roles and permissions

## Development Tips

### Test with Multiple Users
1. Create multiple user accounts
2. Log in/out between accounts
3. Test follow/unfollow features
4. Test post interactions

### Database Monitoring
1. Go to **SQL Editor > New Query**
2. Run: `SELECT * FROM posts;`
3. View real-time data

### Check Logs
1. Go to **Database > Logs**
2. View query performance
3. Debug slow queries

## Deployment

### For Production:

1. Build frontend:
   ```bash
   npm run build
   ```

2. Update `.env`:
   ```env
   VITE_SUPABASE_URL=production_url
   VITE_SUPABASE_ANON_KEY=production_key
   ```

3. Deploy to hosting service:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS

## Next Steps

- [ ] Implement real-time notifications
- [ ] Add image compression
- [ ] Implement full-text search
- [ ] Add hashtag system
- [ ] Implement messaging
- [ ] Add notifications page
- [ ] Add explore page with trending
- [ ] Implement search functionality

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## Support

For issues:
1. Check Supabase logs: **Logs > Query Performance**
2. Check browser console for errors
3. Review RLS policies in **Authentication > Policies**
4. Check storage permissions in **Storage > Policies**

## Security Checklist

- [ ] Never expose service role key
- [ ] Always use anon key in frontend
- [ ] Enable RLS on all tables
- [ ] Configure storage policies
- [ ] Set strong database password
- [ ] Enable 2FA on Supabase account
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Sanitize user input
- [ ] Validate file uploads

---

✅ Once all steps complete, CozMeet is ready to use!

For detailed information, see `/Backend/README.md`
