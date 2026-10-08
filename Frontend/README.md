# CozMeet Frontend

A modern, responsive social media platform built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

- **Authentication**: Email/password registration and login
- **Posts**: Create, read, and delete posts with image uploads
- **Interactions**: Like, comment, and share posts
- **Follow System**: Follow/unfollow users
- **User Profiles**: View and edit user profiles
- **Activity Feed**: See what others are doing
- **Search**: Find users, posts, and hashtags
- **Real-time Updates**: Live notifications and activity
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠 Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **State Management**: Zustand

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
```

### 4. Start the development server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── layout/          # Layout components
│   ├── profile/         # Profile-related components
│   ├── feed/            # Feed components
│   ├── comments/        # Comment components
│   ├── activity/        # Activity components
│   └── suggestions/     # Suggestion components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── lib/                 # Library utilities
├── store/               # Zustand stores
├── types/               # TypeScript types
├── utils/               # Utility functions
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## 🔑 Key Features

### Authentication
- Email/password registration
- Email/password login
- Session persistence
- Protected routes

### Posts
- Create posts with text and images
- View posts in feed
- Delete own posts
- Like/unlike posts
- Comment on posts
- Share posts
- Save posts

### Follow System
- Follow/unfollow users
- View follower/following lists
- Suggested users

### User Profiles
- Public profile pages
- Editable profile settings
- Profile statistics
- User bio and cover image

### Activity
- See who likes your posts
- See who follows you
- Real-time notifications
- Activity history

## 🔐 Security

- Never expose Supabase keys in code
- Use environment variables for sensitive data
- Implement Row Level Security (RLS) on Supabase
- Sanitize user input
- Use HTTPS in production

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize colors:

```js
colors: {
  'primary-blue': '#1D7FF7',
  'light-blue': '#E3F0FF',
  'dark-text': '#1a1a1a',
  'secondary-text': '#646464',
}
```

### Typography
Modify font settings in `index.css`

## 📱 Responsive Design

- **Desktop**: Full 3-column layout (280px + 600px + 280px)
- **Tablet**: 2-column layout (sidebar + feed)
- **Mobile**: Single column feed

## 🚢 Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 📝 Environment Variables

```env
VITE_SUPABASE_URL=          # Your Supabase project URL
VITE_SUPABASE_ANON_KEY=     # Your Supabase anonymous key
VITE_API_URL=               # Backend API URL
```

## 🐛 Troubleshooting

### Port already in use
Change the port in `vite.config.ts`:

```ts
server: {
  port: 3000, // Change to a different port
}
```

### Build fails
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions, please create an issue in the repository.
