# CozMeet Deployment Guide

Guide to deploy CozMeet to production.

## 🎯 Pre-Deployment Checklist

### Code Quality
- [ ] No console.log() statements (except errors)
- [ ] No TODO comments left in code
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] ESLint errors fixed
- [ ] No security vulnerabilities

### Security
- [ ] Environment variables properly configured
- [ ] Never committed secrets to git
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] RLS policies verified
- [ ] Rate limiting configured

### Performance
- [ ] Build size < 500KB gzipped
- [ ] Lighthouse score > 80
- [ ] Database indexes created
- [ ] Images optimized
- [ ] Code splitting implemented

### Database
- [ ] Backups enabled
- [ ] RLS policies tested
- [ ] Indexes created
- [ ] Storage buckets public
- [ ] Seed data cleaned (optional)

## 🏗 Production Build

### Step 1: Build Frontend

```bash
cd Frontend
npm run build
```

This creates optimized `dist/` folder:
- Minified JavaScript
- Optimized images
- Source maps (optional)
- ~300-500KB total (gzipped)

### Step 2: Verify Build

```bash
npm run preview
```

Visit `http://localhost:4173` and test:
- [ ] Pages load
- [ ] Buttons work
- [ ] Images display
- [ ] No console errors

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Best for: Quick deployment, automatic CI/CD**

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
cd Frontend
vercel --prod
```

#### Step 3: Configure

- Select project name
- Link to GitHub (optional but recommended)
- Set environment variables

#### Step 4: Add Environment Variables

In Vercel dashboard:

1. Go to **Settings > Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` = your URL
   - `VITE_SUPABASE_ANON_KEY` = your key

3. Redeploy

**Result**: App deployed to `your-app.vercel.app`

### Option 2: Netlify

**Best for: GitHub integration, automatic deploys**

#### Step 1: Connect GitHub

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click **New site from Git**
4. Select GitHub
5. Select repository

#### Step 2: Configure Build

```
Build command: npm run build
Publish directory: dist
```

#### Step 3: Add Environment Variables

In Netlify dashboard:

1. Go to **Site settings > Build & deploy > Environment**
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. Trigger rebuild

**Result**: App deploys automatically on git push

### Option 3: AWS S3 + CloudFront

**Best for: Cost-effective, high-traffic apps**

#### Step 1: Create S3 Bucket

```bash
aws s3 mb s3://cozmeet-production
```

#### Step 2: Upload Build Files

```bash
aws s3 sync dist/ s3://cozmeet-production
```

#### Step 3: Configure CloudFront

1. Go to AWS CloudFront Console
2. Create distribution
3. Set origin to S3 bucket
4. Enable HTTPS
5. Set default root to `index.html`

#### Step 4: Configure Domain

Point domain to CloudFront distribution

### Option 4: Docker + Heroku

**Best for: Full control, custom configuration**

#### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production

EXPOSE 5173

CMD ["npm", "run", "preview"]
```

#### Step 2: Deploy

```bash
heroku create cozmeet
heroku config:set VITE_SUPABASE_URL=your_url
heroku config:set VITE_SUPABASE_ANON_KEY=your_key
git push heroku main
```

## 🌍 Domain Configuration

### Step 1: Buy Domain

Options:
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

### Step 2: Point DNS

**For Vercel:**
- Add `CNAME` record
- Value: `cname.vercel-dns.com`

**For Netlify:**
- Add custom domain in settings
- Follow Netlify's DNS instructions

**For CloudFront:**
- Create `CNAME` or `A` record
- Point to CloudFront distribution

### Step 3: SSL Certificate

Most platforms auto-generate SSL:
- Vercel: Automatic
- Netlify: Automatic
- CloudFront: Via AWS Certificate Manager

## 🔐 Production Environment Variables

### Required

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (public anon key)
```

### Optional

```env
VITE_API_URL=https://api.cozmeet.com
VITE_ENVIRONMENT=production
```

### Never Expose

```env
# ❌ NEVER in frontend
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_PASSWORD=...
SIGNING_SECRET=...
```

## 📊 Monitoring & Analytics

### Step 1: Error Tracking

Setup Sentry:

```bash
npm install @sentry/react
```

In `main.tsx`:

```ts
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'your_sentry_dsn',
  environment: 'production',
})
```

### Step 2: Performance Monitoring

Tools:
- Vercel Analytics (built-in)
- Google Analytics
- LogRocket
- New Relic

### Step 3: Uptime Monitoring

Services:
- UptimeRobot
- Pingdom
- Datadog

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm ci
      
      - run: npm run build
      
      - uses: actions/upload-artifact@v2
        with:
          name: dist
          path: dist/
      
      - run: npm run preview
```

## 🔄 Rollback Plan

### If Deployment Fails

**Vercel:**
```bash
vercel rollback
```

**Netlify:**
- Dashboard > Deploys > Select previous > Publish

**Manual:**
- Re-run last known good build
- Restore from backup

## 📈 Post-Deployment

### Step 1: Verify

- [ ] Site loads without errors
- [ ] Login works
- [ ] Can create posts
- [ ] Images upload correctly
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] No console errors

### Step 2: Performance

- [ ] Lighthouse score > 80
- [ ] Core Web Vitals good
- [ ] API response time < 500ms
- [ ] Database queries fast

### Step 3: Security

- [ ] HTTPS working
- [ ] No exposed secrets
- [ ] CORS properly configured
- [ ] Rate limiting enabled

### Step 4: Monitoring

- [ ] Error tracking working
- [ ] Analytics collecting data
- [ ] Alerts configured
- [ ] Backups scheduled

## 🐛 Troubleshooting

### "Build fails in CI/CD"

- Check Node version matches
- Verify all dependencies installed
- Run `npm ci` instead of `npm install`
- Check environment variables set

### "Blank page after deploy"

- Check browser console
- Verify environment variables
- Check build includes all assets
- Run production build locally to test

### "Supabase connection fails"

- Verify API URL is correct
- Check anon key is correct
- Verify domain in auth redirect URLs
- Check CORS settings

### "Images not loading"

- Verify storage bucket is public
- Check file paths in database
- Test CDN URL directly
- Check storage policies

### "Pages 404 on refresh"

- Configure 404 → index.html redirect
- For Vercel: automatic
- For Netlify: automatic
- For S3: create redirect rule

## 📝 Post-Deployment Maintenance

### Daily

- Monitor error logs
- Check uptime
- Review performance metrics

### Weekly

- Check database size
- Review storage usage
- Analyze user behavior

### Monthly

- Plan feature updates
- Review security logs
- Update dependencies
- Performance optimization

### Quarterly

- Major version updates
- Feature releases
- Security audits
- Infrastructure review

## 🚀 Scaling

### As Traffic Grows

1. **Database**
   - Upgrade Supabase tier
   - Add read replicas
   - Optimize slow queries

2. **CDN**
   - Enable CloudFront
   - Configure caching headers
   - Minify assets

3. **Frontend**
   - Implement lazy loading
   - Code splitting
   - Service workers

4. **Monitoring**
   - Enhanced error tracking
   - Real-time alerts
   - Performance profiling

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [AWS Documentation](https://aws.amazon.com/documentation)
- [Supabase Hosting](https://supabase.com/docs/guides/hosting)

## ✅ Deployment Checklist

### Pre-Deploy

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Build successful
- [ ] No console errors
- [ ] Performance optimized
- [ ] Environment variables configured
- [ ] Secrets not in code

### Deploy

- [ ] Build uploaded
- [ ] Environment variables set
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] DNS propagated

### Post-Deploy

- [ ] Site loads correctly
- [ ] All features work
- [ ] Mobile responsive
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Backups enabled
- [ ] Documentation updated

---

**🎉 Your app is now live!**

For updates:
1. Make code changes
2. Test locally
3. Push to GitHub/git
4. CI/CD automatically deploys
5. Monitor for issues
