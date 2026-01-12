# Deployment Guide - Vercel

Complete guide to deploy your Riyaaz Classroom app to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- PostgreSQL database (see database options below)

---

## Part 1: Prepare Your Database

### Option 1: Supabase (Recommended for Beginners)

1. Go to https://supabase.com
2. Create new project
3. Wait for provisioning (~2 minutes)
4. Go to **Settings > Database**
5. Copy **Connection String** (URI mode)
6. Replace `[YOUR-PASSWORD]` with your database password

Your connection string looks like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### Option 2: Neon

1. Go to https://neon.tech
2. Create new project
3. Copy connection string from dashboard

### Option 3: Railway

1. Go to https://railway.app
2. New Project > Provision PostgreSQL
3. Copy DATABASE_URL from variables tab

---

## Part 2: Push to GitHub

### If you haven't initialized git yet:

```bash
cd classroom
git init
git add .
git commit -m "Initial commit - Riyaaz Classroom MVP"
```

### Create GitHub repository:

1. Go to https://github.com/new
2. Name: `riyaaz-classroom` (or any name)
3. Don't initialize with README (we already have files)
4. Copy the remote URL

### Push your code:

```bash
git remote add origin https://github.com/YOUR-USERNAME/riyaaz-classroom.git
git branch -M main
git push -u origin main
```

---

## Part 3: Deploy to Vercel

### Initial Deployment

1. Go to https://vercel.com
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Configure Build Settings (usually auto-detected):

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Add Environment Variables:

Click **"Environment Variables"** and add:

#### 1. DATABASE_URL
```
postgresql://postgres:password@host:5432/database
```
(Use your actual connection string from Part 1)

#### 2. NEXTAUTH_SECRET
Generate a secure secret:
```bash
openssl rand -base64 32
```
Copy the output and paste as `NEXTAUTH_SECRET`

#### 3. NEXTAUTH_URL
**Important**: Leave this blank initially. We'll set it after deployment.

### Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://your-app.vercel.app`

---

## Part 4: Run Database Migrations

After first deployment, you need to create database tables.

### Method 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production.local

# Run migrations
npx prisma migrate deploy
```

### Method 2: Manual (if CLI doesn't work)

1. Copy your production `DATABASE_URL`
2. Temporarily add to `.env` file locally
3. Run: `npx prisma migrate deploy`
4. Remove from `.env` (keep it only in Vercel)

---

## Part 5: Update NEXTAUTH_URL

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add or update `NEXTAUTH_URL`:
   ```
   https://your-app.vercel.app
   ```
   (Use your actual Vercel URL)
4. **Redeploy** the app (Vercel > Deployments > ... > Redeploy)

---

## Part 6: Test Your Deployment

1. Visit your Vercel URL
2. Try to register a new account
3. If successful, your app is live! 🎉

### If registration fails:

Check Vercel logs:
1. Go to **Deployments**
2. Click latest deployment
3. Click **"Functions"** tab
4. Look for errors in API routes

Common issues:
- Database connection failed → Check `DATABASE_URL`
- NextAuth error → Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

---

## Part 7: Connect Custom Domain (Optional)

### If you have a domain:

1. Go to **Settings > Domains**
2. Add your domain (e.g., `riyaaz.yourdomain.com`)
3. Follow DNS instructions (add CNAME record)
4. Wait for DNS propagation (5-60 minutes)
5. Update `NEXTAUTH_URL` to your custom domain
6. Redeploy

---

## Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel will auto-deploy in ~2 minutes
```

---

## Environment Variables Reference

### Required for Production:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `NEXTAUTH_SECRET` | Random 32+ character string | Generate with OpenSSL |
| `NEXTAUTH_URL` | Your app's public URL | `https://your-app.vercel.app` |

### Optional (for development):

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |

---

## Performance Optimization

### 1. Prisma Connection Pooling

Add to your `DATABASE_URL` for serverless:
```
postgresql://...?connection_limit=10&pool_timeout=60
```

### 2. Enable Vercel Analytics

1. Go to **Analytics** tab in Vercel
2. Enable Web Analytics (free)
3. View real-time performance metrics

### 3. Edge Caching (Future)

Add caching headers to API routes:
```typescript
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate',
    },
  });
}
```

---

## Monitoring & Debugging

### View Logs

1. Go to **Deployments**
2. Click latest deployment
3. Click **"Functions"** to see serverless function logs
4. Filter by API route

### Common Errors

#### "Function execution timed out"
- Default limit: 10s (hobby), 60s (pro)
- Optimize slow database queries
- Add indexes to frequently queried fields

#### "Database connection limit reached"
- Use connection pooling
- Reduce `connection_limit` in DATABASE_URL
- Upgrade database plan

#### "Module not found"
- Check all imports use correct paths
- Run `npm install` locally
- Check `package.json` has all dependencies

### Health Checks

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date() });
}
```

Test: `https://your-app.vercel.app/api/health`

---

## Rollback Deployment

If something breaks:

1. Go to **Deployments**
2. Find previous working deployment
3. Click **"..."** > **"Promote to Production"**
4. Previous version is live immediately

---

## Scaling Considerations

### Free Tier Limits (Hobby Plan):
- 100 GB bandwidth/month
- 100,000 function invocations/month
- 100 hours serverless function execution/month
- Good for ~1,000-5,000 users

### When to Upgrade:
- More than 10,000 users
- Need faster builds
- Custom domains without "vercel.app"
- Need team collaboration

---

## Security Checklist

Before going to production:

- [ ] Use strong `NEXTAUTH_SECRET` (32+ chars)
- [ ] Database password is strong
- [ ] `NEXTAUTH_URL` matches deployment URL
- [ ] Environment variables not committed to git
- [ ] Database connection uses SSL
- [ ] No sensitive data in logs

---

## Backup Strategy

### Database Backups:

**Supabase**: Automatic daily backups (free tier: 7 days retention)

**Manual Backup**:
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### Code Backups:

Git already backs up your code! GitHub keeps all history.

---

## Cost Estimate

### Free Tier (Sufficient for MVP):
- Vercel: Free (Hobby plan)
- Supabase: Free (500MB database, 2GB bandwidth)
- **Total: $0/month** for ~1,000 users

### Paid Tier (Scale up):
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- **Total: $45/month** for ~10,000+ users

---

## Troubleshooting Deployment

### Build Fails

```bash
# Test build locally first
npm run build

# Check for errors
# Fix them before pushing to GitHub
```

### Database Migrations Failed

```bash
# Check migration status
npx prisma migrate status

# Force reset (⚠️ deletes data)
npx prisma migrate reset

# Deploy migrations
npx prisma migrate deploy
```

### Can't Access Database

```bash
# Test connection locally
npx prisma db pull

# Check DATABASE_URL format:
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

---

## Getting Help

- Vercel Docs: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- Prisma Docs: https://www.prisma.io/docs
- NextAuth Docs: https://next-auth.js.org

---

## Next Steps After Deployment

1. **Set up monitoring**:
   - Vercel Analytics
   - Sentry for error tracking
   - Uptime monitoring (e.g., UptimeRobot)

2. **Add SEO**:
   - Update metadata in `app/layout.tsx`
   - Add `robots.txt` and `sitemap.xml`

3. **Performance testing**:
   - Use Lighthouse in Chrome DevTools
   - Optimize images and assets

4. **User feedback**:
   - Add feedback form
   - Monitor user behavior

---

Congratulations! Your app is now live on Vercel! 🚀
