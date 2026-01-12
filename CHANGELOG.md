# Changelog

All notable changes to the Riyaaz Classroom project will be documented in this file.

## [0.1.0] - 2025-11-18

### Initial MVP Release

#### Added
- **Authentication System**
  - User registration with email/password
  - Login with NextAuth.js
  - Role-based access (Teacher/Student)
  - Session management with JWT
  - Route protection middleware

- **Teacher Features**
  - Create and manage multiple classrooms
  - Unique join code generation (format: RZ-XXXX)
  - View student leaderboard with points and streaks
  - Real-time activity feed
  - Create homework assignments
  - Track homework submissions

- **Student Features**
  - Join classrooms via join code
  - Log daily riyaaz practice (date, duration, raga, recording URL, notes)
  - Track current and longest streaks
  - View total points
  - Submit homework assignments
  - View practice history

- **Gamification**
  - Points system: +10 per practice day, +20 per homework
  - Automatic streak calculation
  - Leaderboard ranking

- **Database Schema**
  - User, Classroom, Enrollment models
  - RiyaazEntry with unique date constraint
  - HomeworkAssignment and HomeworkSubmission
  - Proper foreign keys and indexes

- **API Endpoints**
  - `/api/auth/register` - User registration
  - `/api/classrooms` - Classroom CRUD
  - `/api/classrooms/join` - Join classroom
  - `/api/classrooms/[id]/leaderboard` - Leaderboard data
  - `/api/classrooms/[id]/riyaaz` - Practice entries
  - `/api/classrooms/[id]/homework` - Homework assignments
  - `/api/homework/[id]/submissions` - Homework submissions
  - `/api/classrooms/[id]/activity` - Activity feed
  - `/api/classrooms/[id]/stats` - Student stats

- **Documentation**
  - README.md - Main documentation
  - QUICKSTART.md - 5-minute setup guide
  - ARCHITECTURE.md - Technical deep-dive
  - API.md - Complete API reference
  - DEPLOYMENT.md - Vercel deployment guide
  - SUMMARY.md - Project overview
  - CHANGELOG.md - This file

- **UI Components**
  - Responsive Tailwind CSS design
  - Teacher dashboard with classroom cards
  - Student dashboard with stats cards
  - Classroom detail pages
  - Leaderboard table
  - Activity feed
  - Forms for riyaaz and homework

#### Technical Details
- Next.js 14 with App Router
- TypeScript for type safety
- PostgreSQL database
- Prisma ORM
- Tailwind CSS for styling
- Zod for input validation
- bcryptjs for password hashing

#### Deployment
- Vercel-ready configuration
- Environment variable templates
- Database migration scripts
- Production build optimization

---

## [Unreleased]

### Planned Features
- Email notifications for homework
- Password reset flow
- Rate limiting on API endpoints
- Pagination for large lists
- Export student reports (CSV/PDF)
- Analytics dashboard for teachers
- Dark mode support
- Mobile app (React Native)

### Known Issues
- No pagination (returns all results)
- No rate limiting (vulnerable to brute-force)
- No email verification
- Timezone handling uses server timezone
- Cold start latency on serverless functions

---

## Version Guidelines

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality (backwards-compatible)
- **PATCH** version for bug fixes (backwards-compatible)

Format: `[MAJOR.MINOR.PATCH] - YYYY-MM-DD`

---

## How to Update This File

When making changes:

1. Add entry under `[Unreleased]` section
2. Categorize changes:
   - **Added**: New features
   - **Changed**: Changes to existing functionality
   - **Deprecated**: Soon-to-be removed features
   - **Removed**: Removed features
   - **Fixed**: Bug fixes
   - **Security**: Security updates
3. On release, move unreleased changes to new version section
4. Update version in `package.json`

Example:
```markdown
## [Unreleased]

### Added
- Email notification system for homework assignments

### Fixed
- Streak calculation bug for leap years
```

---

## Release History

- **v0.1.0** (2025-11-18) - Initial MVP release

---

For detailed commit history, see: https://github.com/YOUR-USERNAME/riyaaz-classroom/commits/main
