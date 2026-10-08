# CozMeet - Social Media Platform

A production-ready social media web application built with React, TypeScript, and Supabase.

**Tagline**: Connect. Share. Discover.

## 📸 Features

### Core Features
- 🔐 **Authentication**: Email/password registration and login with session management
- 📝 **Posts**: Create, read, update, and delete posts with rich text and images
- ❤️ **Interactions**: Like, comment, and share posts with real-time counts
- 👥 **Follow System**: Follow/unfollow users, track followers and following
- 👤 **User Profiles**: View and edit profiles with cover images, bio, and statistics
- 🔔 **Notifications**: Real-time notifications for likes, comments, follows, and shares
- 🔍 **Search**: Find users, posts, and explore trending content
- 📱 **Responsive Design**: Fully responsive from mobile to desktop
- 💾 **Saved Posts**: Bookmark posts for later viewing
- 🏷️ **Hashtags**: Support for hashtags in posts and search

### Advanced Features
- Activity feed showing what others are doing
- Suggested users to follow
- Shortcuts for quick access to interests
- Multiple visibility levels (public, private, friends)
- Comment threading (prepared for implementation)
- Real-time updates with Supabase Realtime
- Image optimization and CDN delivery
- Row-level security for data privacy

## 🗂 Project Structure

```
BlogSite/
├── Frontend/                      # React TypeScript application
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   │   ├── common/           # Common/utility components
│   │   │   ├── layout/           # Layout components (Header, Navigation)
│   │   │   ├── profile/          # Profile-related components
│   │   │   ├── feed/             # Feed and post components
│   │   │   ├── comments/         # Comment components
│   │   │   ├── activity/         # Activity feed components
│   │   │   └── suggestions/      # Suggestion components
│   │   ├── pages/                # Page components (Home, Login, Profile, etc.)
│   │   ├── hooks/                # Custom React hooks (useAuth, usePosts, etc.)
│   │   ├── lib/                  # Library utilities (Supabase client)
│   │   ├── store/                # Zustand state management
│   │   ├── types/                # TypeScript type definitions
│   │   ├── utils/                # Utility functions (formatting, etc.)
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Global styles with Tailwind
│   ├── index.html                # HTML template
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── vite.config.ts            # Vite build configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── .env.example              # Environment variables template
│   └── README.md                 # Frontend documentation
│
└── Backend/                       # Supabase database configuration
    ├── migrations/               # SQL migration scripts
    │   ├── 001_schema.sql       # Database tables and schema
    │   ├── 002_rls.sql          # Row-level security policies
    │   ├── 003_seed.sql         # Demo/seed data
    ├── setup-guide.md            # Step-by-step Supabase setup
    └── README.md                 # Backend documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account (free at [supabase.com](https://supabase.com))
- Git

### 1. Clone and Navigate

```bash
cd BlogSite/Frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

Follow the complete setup guide at `/Backend/setup-guide.md`:

1. Create Supabase project
2. Run SQL migrations
3. Create storage buckets
4. Configure authentication

### 4. Environment Variables

Create `.env` file in Frontend folder:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Start Development Server

```bash
npm run dev
```

Application opens at `http://localhost:5173`

### 6. Create Test Account

- Click "Register"
- Enter email, password, display name, username
- Click "Register"
- Start creating posts!

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite (⚡ Fast development)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Supabase JavaScript SDK

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **API**: Supabase REST API

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Environment Management**: .env files

## 📋 Database Schema

### Tables

**profiles** - User profile information
- User details, avatar, cover image
- Statistics (posts, followers, following)

**posts** - Social media posts
- Caption, image URL, visibility
- Timestamps and user association

**post_likes** - Post engagement
- Tracks which users liked which posts
- Unique constraint prevents duplicate likes

**comments** - Post comments
- Comment text, parent comment (for threading)
- User and post association

**follows** - Social connections
- Follower-following relationships
- Self-following prevented

**post_saves** - Bookmarked posts
- User's saved/bookmarked posts
- Unique constraint prevents duplicates

**post_shares** - Post sharing tracking
- Analytics on post sharing

**notifications** - User notifications
- Types: LIKE, COMMENT, FOLLOW, SHARE, MENTION
- Read/unread tracking

**shortcuts** - Quick access links
- User-defined shortcuts to content

See `/Backend/README.md` for complete schema details.

## 🔐 Security Features

- ✅ Row-level security (RLS) on all tables
- ✅ User authentication with Supabase Auth
- ✅ Environment variables for sensitive data
- ✅ Input validation and sanitization
- ✅ Secure file upload with type validation
- ✅ HTTPS in production
- ✅ No service role key in frontend code
- ✅ Proper CORS configuration

## 📱 Responsive Design

- **Desktop**: Full 3-column layout
  - Left sidebar (280px) with profile and shortcuts
  - Center feed (600px) with posts
  - Right sidebar (280px) with activity and suggestions

- **Tablet**: 2-column layout
  - Sidebar + Feed (right sidebar hidden)

- **Mobile**: Single column
  - Full-width feed
  - Optimized navigation
  - Touch-friendly buttons

## 🎨 Design System

### Colors
- **Primary Blue**: #1D7FF7
- **Light Blue**: #E3F0FF
- **Dark Text**: #1a1a1a
- **Secondary Text**: #646464
- **Light Gray**: #f5f5f5
- **Border Gray**: #e0e0e0

### Components
- Rounded cards (12px border radius)
- Consistent spacing (4px grid)
- Smooth transitions and hover states
- Clean typography hierarchy

## 🎯 Key Pages

### Home
- Feed with posts from followed users
- Create post interface
- Activity sidebar
- Suggested users sidebar

### Login
- Email/password authentication
- Link to register

### Register
- Create new account
- Set display name and username

### Profile
- View user profile and statistics
- See user's posts
- Follow/unfollow button
- Edit profile (own profile only)

### Explore
- Discover trending posts
- Browse by category
- See popular content

### Settings
- Edit profile information
- Change bio and display name
- Upload profile picture
- Logout

## 🚢 Production Deployment

### Build

```bash
npm run build
```

Creates optimized production build in `dist/` folder.

### Deploy Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   - Connect GitHub repository
   - Auto-deploys on push

3. **AWS/Azure/GCP**
   - Upload `dist/` folder
   - Configure environment variables

### Production Checklist

- [ ] Environment variables set correctly
- [ ] HTTPS enabled
- [ ] Database backups enabled
- [ ] Supabase backups configured
- [ ] Error logging set up
- [ ] Performance monitoring enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Spam prevention enabled

## 📊 Performance

- **Vite**: Fast development and production builds
- **Tree-shaking**: Unused code removed in production
- **Code splitting**: Lazy load routes
- **Image optimization**: CDN delivery via Supabase Storage
- **Caching**: Browser and server caching enabled
- **Database indexes**: Optimized queries for performance

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to Supabase"**
- Check `.env` file has correct credentials
- Verify API key is public/anon key (not service role)
- Restart dev server

**"Authentication fails"**
- Check email is verified
- Verify redirect URLs in Supabase settings
- Clear browser cookies

**"Images won't upload"**
- Check storage bucket exists and is public
- Verify storage policies are applied
- Check file size (max 20MB for posts)

**"Posts not visible"**
- Check RLS policies are correct
- Verify posts have `visibility = 'public'`
- Check user has proper authentication

See `/Frontend/README.md` and `/Backend/README.md` for detailed troubleshooting.

## 📚 Documentation

- **Frontend**: See `Frontend/README.md`
- **Backend**: See `Backend/README.md`
- **Setup Guide**: See `Backend/setup-guide.md`

## 🤝 Contributing

To contribute:

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Create pull request

## 📝 License

MIT License - Feel free to use this project for personal or commercial use.

## 🆘 Support

For issues:
1. Check the README files
2. Check the setup guide
3. Review Supabase logs
4. Check browser console for errors

## 🎉 What's Next?

After setup, consider adding:
- [ ] Real-time messaging (chat)
- [ ] Video upload support
- [ ] Polls and voting
- [ ] Content moderation
- [ ] Advanced search with filters
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Two-factor authentication

## 📞 Contact

For questions or suggestions, feel free to reach out.

---

**Built with ❤️ for the social web**

**Made with**: React • TypeScript • Vite • Tailwind CSS • Supabase
