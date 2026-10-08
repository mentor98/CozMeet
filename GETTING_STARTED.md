# CozMeet - Getting Started Guide

Welcome to CozMeet! This guide will get you up and running in minutes.

## 📋 What is CozMeet?

CozMeet is a modern, production-ready social media platform where users can:
- Create and share posts with images
- Follow other users and see their posts
- Like, comment, and share posts
- Build their profile and connect with others
- Discover trending content and suggested users

## 🎯 5-Minute Quick Start

### Step 1: Set Up Supabase (5 mins)

1. Go to [supabase.com](https://supabase.com) and click **New Project**
2. Create project with name `cozmeet`
3. After creation, go to **Settings > API**
4. Copy:
   - **Project URL** → Save as `VITE_SUPABASE_URL`
   - **public anon key** → Save as `VITE_SUPABASE_ANON_KEY`

### Step 2: Run Database Migrations (3 mins)

1. In Supabase, go to **SQL Editor > New Query**
2. Copy contents of `Backend/migrations/001_schema.sql` and run
3. Create new query, copy `Backend/migrations/002_rls.sql` and run
4. Create new query, copy `Backend/migrations/003_seed.sql` and run

### Step 3: Create Storage Buckets (2 mins)

In Supabase, go to **Storage** and create 3 public buckets:
- `avatars`
- `covers`
- `post-images`

### Step 4: Start Frontend (2 mins)

```bash
cd Frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

✅ App is running at `http://localhost:5173`!

## 📖 Full Setup Guide

For detailed step-by-step instructions, see:
- **`Backend/setup-guide.md`** - Complete Supabase setup
- **`Backend/README.md`** - Backend architecture and database
- **`Frontend/README.md`** - Frontend development and structure

## 🚀 First Steps

### 1. Register an Account

1. Click **Register** on the login page
2. Enter email, password, name, and username
3. Click **Register**

### 2. Create Your Profile

1. Go to **Settings** (top-right menu)
2. Add bio and profile picture (optional)
3. Click **Save Changes**

### 3. Create a Post

1. On home page, click **"Share something..."**
2. Type caption and add image (optional)
3. Select visibility (Public/Private/Friends)
4. Click **Post**

### 4. Explore and Connect

- Go to **Explore** to see trending posts
- Click **Follow** on user profiles you like
- Like and comment on posts
- Check **Notifications** for activity

## 📁 Project Structure

```
BlogSite/
├── Frontend/          # React app - start here for coding
├── Backend/           # Database config - modify SQL migrations
└── README.md         # Project overview
```

## 🛠 Development

### Frontend Development

```bash
cd Frontend
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Lint code
npm run type-check # TypeScript check
```

### Database Queries

Test queries directly in Supabase **SQL Editor**:

```sql
-- View all posts
SELECT * FROM posts ORDER BY created_at DESC;

-- View your profile
SELECT * FROM profiles WHERE username = 'your_username';

-- View followers
SELECT * FROM follows WHERE following_id = 'your_id';
```

## 🔐 Authentication

### How It Works

1. User creates account with email/password
2. Supabase creates auth user
3. App automatically creates profile in `profiles` table
4. Session stored in browser (persists on page reload)
5. Only authenticated users see their private posts

### Test Accounts (from seed data)

Use these UUIDs in the database:
- `f47ac10b-58cc-4372-a567-0e02b2c3d479` (reinhard)
- `550e8400-e29b-41d4-a716-446655440000` (briansky)
- `550e8400-e29b-41d4-a716-446655440001` (najid)

**Note**: To test these accounts, manually create auth users via Supabase Auth UI, or modify seed data with your own user IDs.

## 🖼 Image Uploads

### How It Works

1. User selects image file
2. File validated (type and size)
3. Uploaded to Supabase Storage bucket
4. URL stored in database
5. Image displayed in posts

### File Size Limits

- Avatar: 5MB
- Cover: 10MB
- Post image: 20MB

### Supported Formats

- JPG, JPEG
- PNG
- WEBP

## 🔍 Key Features Explained

### Follow System

- Follow users to see their posts in your feed
- Followers are tracked and shown on profile
- Self-following is prevented
- Unfollow at any time

### Posts

- Public posts visible to everyone
- Private posts only visible to you
- Friends posts visible to followers (future feature)
- Posts can have image and text
- Hashtags auto-linked

### Interactions

- **Like**: Click heart to like/unlike
- **Comment**: Write comments on posts
- **Save**: Bookmark posts for later
- **Share**: Share posts to social media

### Notifications

- Notified when someone likes your post
- Notified when someone comments
- Notified when someone follows you
- Badge shows unread notifications

## 🎨 Customization

### Change Colors

Edit `Frontend/tailwind.config.js`:

```js
colors: {
  'primary-blue': '#1D7FF7',      // Main color
  'light-blue': '#E3F0FF',        // Backgrounds
  'dark-text': '#1a1a1a',         // Text color
  // ... more colors
}
```

### Change Fonts

Edit `Frontend/src/index.css`:

```css
body {
  font-family: 'Your Font', sans-serif;
}
```

### Change Content

- Update demo users in `Backend/migrations/003_seed.sql`
- Modify component text in React components
- Update app name in `Frontend/src/App.tsx`

## 🧪 Testing

### Manual Testing Checklist

- [ ] Register new account
- [ ] Login with account
- [ ] Create post with image
- [ ] Like a post
- [ ] Comment on post
- [ ] Follow a user
- [ ] Unfollow user
- [ ] View profile
- [ ] Edit profile
- [ ] Upload profile picture
- [ ] View notifications
- [ ] Search for users
- [ ] View explore page

### Debug Tips

1. **Browser Console** - Check for JavaScript errors
2. **Supabase Logs** - Check query performance
3. **Network Tab** - Check API requests
4. **React DevTools** - Inspect component state

## 🚢 Production Deployment

### Build for Production

```bash
cd Frontend
npm run build
```

Creates `dist/` folder with optimized files.

### Deploy to Vercel (Easiest)

```bash
npm install -g vercel
vercel
```

Follow prompts to deploy.

### Deploy to Netlify

1. Push to GitHub
2. Connect repo to Netlify
3. Set environment variables
4. Deploy automatically on push

### Environment Variables (Production)

Create `.env` file with production Supabase URL and key.

## 📚 Learning Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide)

## ❓ FAQs

**Q: Do I need a backend server?**
A: No! Supabase provides the backend. Frontend talks directly to Supabase.

**Q: Can I self-host?**
A: You can host frontend on Vercel/Netlify. Database must be on Supabase or self-hosted PostgreSQL.

**Q: Is it free?**
A: Frontend hosting is free (Vercel/Netlify). Supabase has generous free tier for development.

**Q: How do I add more features?**
A: Create React components in `Frontend/src/components/`, add Supabase tables as needed.

**Q: Can I use this template for production?**
A: Yes! It includes security best practices (RLS, input validation, etc.).

## 🆘 Troubleshooting

### "Port 5173 already in use"

Change port in `Frontend/vite.config.ts`:

```ts
server: {
  port: 3000, // Change to 3000
}
```

### "Cannot connect to Supabase"

- Check `.env` file exists with correct URL and key
- Verify it's the **anon key**, not service role key
- Restart dev server

### "Images won't upload"

- Check storage bucket is **public** not private
- Verify bucket name matches code (post-images, avatars, covers)
- Check file size under limit

### "RLS policy error"

- Re-run `002_rls.sql` to reapply policies
- Check user is authenticated
- Verify policy SQL is correct

## 📞 Need Help?

1. Check `README.md` in Frontend or Backend folder
2. Check `Backend/setup-guide.md` for detailed setup
3. Review Supabase logs in dashboard
4. Check browser console for errors
5. Read component source code for implementation details

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] Frontend dependencies installed
- [ ] Environment variables set
- [ ] Dev server running
- [ ] Can register account
- [ ] Can create post
- [ ] Can like/comment
- [ ] Can follow users

🎉 **Congratulations! CozMeet is ready to use!**

---

## 📖 Next Steps

1. **Customize**: Update branding, colors, and content
2. **Features**: Add new features by creating components
3. **Database**: Extend schema with new tables
4. **Deploy**: Push to production
5. **Scale**: Monitor performance and optimize

## 🎓 Learning Path

**New to this stack?** Follow this learning path:

1. **React Basics** - Learn React hooks and components
2. **TypeScript** - Learn types and interfaces
3. **Tailwind** - Learn utility-first CSS
4. **Supabase** - Learn database and authentication
5. **Build Features** - Create new pages and components

Happy coding! 🚀
