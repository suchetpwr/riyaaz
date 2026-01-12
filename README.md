# Riyaaz Classroom - Virtual Practice Tracker

A production-ready MVP web application for tracking daily vocal practice (riyaaz) with gamification features including streaks, points, and leaderboards.

## 🎯 Features

### For Teachers
- Create and manage multiple classrooms
- Generate unique join codes for each classroom
- View student leaderboards with points and streaks
- See real-time activity feed of student practice
- Create and assign homework with submissions tracking
- Monitor individual student progress

### For Students
- Join classrooms using join codes
- Log daily riyaaz practice with:
  - Date, duration, raga
  - Recording links (Google Drive, YouTube, etc.)
  - Practice notes
- Track personal stats:
  - Current streak (consecutive practice days)
  - Longest streak
  - Total points
- Submit homework assignments
- View practice history
- Compare progress on classroom leaderboard

### Gamification System
- **Daily Riyaaz**: +10 points per day (max once per day)
- **Homework Submission**: +20 points per assignment
- **Streaks**: Consecutive days of practice tracked automatically
- **Leaderboard**: Rank students by total points to encourage healthy competition

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI**: React + Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (credentials-based)
- **Deployment**: Vercel

### Project Structure
```
classroom/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── [...nextauth]/  # NextAuth handler
│   │   │   └── register/       # User registration
│   │   ├── classrooms/         # Classroom CRUD
│   │   │   ├── [id]/           # Classroom-specific routes
│   │   │   │   ├── activity/   # Activity feed
│   │   │   │   ├── homework/   # Homework assignments
│   │   │   │   ├── leaderboard/# Leaderboard data
│   │   │   │   ├── riyaaz/     # Practice entries
│   │   │   │   └── stats/      # Student stats
│   │   │   ├── join/           # Join classroom
│   │   │   └── student/        # Student classrooms
│   │   └── homework/           # Homework submissions
│   ├── auth/                   # Auth pages
│   │   ├── login/
│   │   └── register/
│   ├── teacher/                # Teacher pages
│   │   ├── dashboard/
│   │   └── classrooms/[id]/
│   ├── student/                # Student pages
│   │   ├── dashboard/
│   │   └── classrooms/[id]/
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home redirect
├── components/                 # Shared components
│   ├── Navbar.tsx
│   └── LoadingSpinner.tsx
├── lib/                        # Utilities
│   ├── auth.ts                 # NextAuth config
│   ├── prisma.ts               # Prisma client
│   └── utils.ts                # Helpers (streaks, points)
├── prisma/
│   └── schema.prisma           # Database schema
├── types/
│   └── next-auth.d.ts          # TypeScript types
├── middleware.ts               # Route protection
├── .env.example                # Environment template
└── package.json
```

### Data Flow

1. **Authentication Flow**:
   - User registers → hashed password stored in PostgreSQL
   - User logs in → NextAuth creates JWT session
   - Session stored in HTTP-only cookie
   - Middleware protects `/teacher/*` and `/student/*` routes

2. **Classroom Flow**:
   - Teacher creates classroom → unique join code generated
   - Students join using code → Enrollment record created
   - All operations scoped to classrooms → data isolation

3. **Points & Streaks Calculation**:
   - Calculated on-demand from raw data (no caching)
   - `calculateStreaks()`: analyzes practice dates for current/longest streaks
   - `calculatePoints()`: counts unique practice days + homework submissions
   - Leaderboard sorted by total points

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### 1. Clone and Install

```bash
cd classroom
npm install
```

### 2. Database Setup

Create a PostgreSQL database (local or cloud like Supabase, Neon, etc.):

```bash
# Example with local PostgreSQL
createdb riyaaz_classroom
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/riyaaz_classroom?schema=public"

# NextAuth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters-long"

# App URL
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 6. Test the Application

1. **Register as Teacher**:
   - Go to `/auth/register`
   - Select "Teacher" role
   - Create account

2. **Create Classroom**:
   - Login → redirects to Teacher Dashboard
   - Click "Create Classroom"
   - Note the join code (e.g., `RZ-3F8K`)

3. **Register as Student**:
   - Open incognito window or different browser
   - Register with "Student" role

4. **Join Classroom**:
   - Login as student → Student Dashboard
   - Enter join code
   - Start logging riyaaz!

## 📦 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js
5. Add environment variables:
   - `DATABASE_URL` (use production PostgreSQL URL)
   - `NEXTAUTH_SECRET` (generate new secret for production)
   - `NEXTAUTH_URL` (your Vercel deployment URL, e.g., `https://your-app.vercel.app`)
6. Click "Deploy"

### 3. Run Database Migrations on Production

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migrations
vercel env pull .env.production.local
npx prisma migrate deploy
```

### Database Hosting Options

- **Supabase**: Free PostgreSQL with 500MB storage
- **Neon**: Serverless PostgreSQL, generous free tier
- **Railway**: Simple deployment with PostgreSQL
- **Vercel Postgres**: Native integration (paid)

## 📊 Database Schema

### Key Models

- **User**: Teachers and students with hashed passwords
- **Classroom**: Created by teachers, joined via codes
- **Enrollment**: Links students to classrooms
- **RiyaazEntry**: Daily practice logs (unique per student/classroom/date)
- **HomeworkAssignment**: Created by teachers
- **HomeworkSubmission**: Submitted by students (unique per assignment/student)

See `prisma/schema.prisma` for full schema.

## 🔐 Security Considerations

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT sessions in HTTP-only cookies
- ✅ Route protection via middleware
- ✅ API endpoints check authentication and authorization
- ✅ Input validation with Zod
- ✅ Prisma prevents SQL injection
- ⚠️ No rate limiting (add in production)
- ⚠️ No email verification (add if needed)

## 🧪 Testing

Create test accounts:

```typescript
// Teacher account
Email: teacher@test.com
Password: teacher123

// Student accounts
Email: student1@test.com, student2@test.com
Password: student123
```

## 📈 Future Enhancements

Potential additions:

- [ ] Email notifications for homework assignments
- [ ] Analytics dashboard for teachers
- [ ] Export student reports (CSV/PDF)
- [ ] Mobile app (React Native)
- [ ] Social features (comments, likes on recordings)
- [ ] Badges and achievements
- [ ] Practice reminders
- [ ] Audio/video recording directly in app
- [ ] Multi-language support
- [ ] Raga practice suggestions

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Prisma
npx prisma studio    # Open database GUI
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev  # Create and apply migrations
npx prisma db push   # Push schema without migrations (dev only)
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Auth Issues
- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your deployment URL
- Clear cookies and try again

## 📝 License

MIT

## 👥 Contributing

This is an MVP. Feel free to fork and extend!

---

Built with ❤️ for music education
