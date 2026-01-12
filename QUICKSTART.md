# Quick Start Guide

Get your Riyaaz Classroom app running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Database

### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb riyaaz_classroom
```

### Option B: Cloud Database (Recommended for beginners)

Sign up for free at:
- **Supabase** (https://supabase.com) - Get connection string from Settings > Database
- **Neon** (https://neon.tech) - Copy connection string from dashboard
- **Railway** (https://railway.app) - One-click PostgreSQL

## Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
nano .env
```

Update these values:
```env
DATABASE_URL="postgresql://your-connection-string-here"
NEXTAUTH_SECRET="run-this-command: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 4: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

## Step 5: Start the App

```bash
npm run dev
```

Open http://localhost:3000

## Step 6: Create Test Accounts

### Register as Teacher
1. Go to http://localhost:3000/auth/register
2. Fill in:
   - Name: "Teacher Demo"
   - Email: "teacher@test.com"
   - Password: "teacher123"
   - Role: **Teacher**
3. Login

### Create a Classroom
1. Click "Create Classroom"
2. Name: "Hindustani Vocal - Beginner"
3. Note the **join code** (e.g., RZ-3F8K)

### Register as Student
1. Open **incognito window** or different browser
2. Go to http://localhost:3000/auth/register
3. Fill in:
   - Name: "Student Demo"
   - Email: "student@test.com"
   - Password: "student123"
   - Role: **Student**
4. Login

### Join Classroom
1. Enter the join code from teacher
2. Click "Join"
3. Click "Log Today" to add practice entry

### Test Features
- **Student**: Log riyaaz, submit homework, view stats
- **Teacher**: View leaderboard, create homework, see activity

## Troubleshooting

### Database Connection Failed
```bash
# Test connection
npx prisma db pull

# Check DATABASE_URL format:
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

### Port 3000 Already in Use
```bash
# Use different port
PORT=3001 npm run dev
```

### Build Errors
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### Can't Login
- Clear cookies
- Check NEXTAUTH_SECRET is set
- Verify user exists: `npx prisma studio`

## Next Steps

- Read [README.md](./README.md) for full documentation
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Deploy to Vercel (see README.md)

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open database GUI (http://localhost:5555)
npx prisma generate      # Regenerate Prisma Client
npx prisma migrate dev   # Create new migration
npx prisma migrate reset # Reset database (deletes data!)

# View Data
npx prisma studio        # Visual database browser
```

## Default Test Credentials

After creating accounts, use these for testing:

```
Teacher:
  Email: teacher@test.com
  Password: teacher123

Student:
  Email: student@test.com
  Password: student123
```

---

Happy coding! 🎵
