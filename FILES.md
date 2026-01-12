# Project File Structure

Complete listing of all files in the Riyaaz Classroom project.

## Root Configuration Files

```
classroom/
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── middleware.ts             # Route protection middleware
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── README.md                 # Main documentation (START HERE)
├── QUICKSTART.md             # 5-minute setup guide
├── ARCHITECTURE.md           # Technical architecture details
├── API.md                    # API endpoint documentation
├── DEPLOYMENT.md             # Vercel deployment guide
├── SUMMARY.md                # Project overview
├── CHANGELOG.md              # Version history
└── FILES.md                  # This file
```

## Application Code

### App Directory (Next.js App Router)

```
app/
├── layout.tsx                # Root layout with AuthProvider
├── page.tsx                  # Home page (redirects to login)
├── globals.css               # Global styles and Tailwind
│
├── api/                      # API Routes (Backend)
│   ├── auth/
│   │   ├── [...nextauth]/
│   │   │   └── route.ts      # NextAuth handler
│   │   └── register/
│   │       └── route.ts      # User registration endpoint
│   │
│   ├── classrooms/
│   │   ├── route.ts          # List/create classrooms
│   │   ├── join/
│   │   │   └── route.ts      # Join classroom with code
│   │   ├── student/
│   │   │   └── route.ts      # Student's classrooms
│   │   └── [id]/
│   │       ├── route.ts      # Get classroom details
│   │       ├── leaderboard/
│   │       │   └── route.ts  # Classroom leaderboard
│   │       ├── activity/
│   │       │   └── route.ts  # Recent activity feed
│   │       ├── stats/
│   │       │   └── route.ts  # Student stats for classroom
│   │       ├── riyaaz/
│   │       │   └── route.ts  # Log/list riyaaz entries
│   │       └── homework/
│   │           └── route.ts  # List/create homework
│   │
│   └── homework/
│       └── [assignmentId]/
│           └── submissions/
│               └── route.ts  # Submit/list homework
│
├── auth/                     # Authentication Pages
│   ├── login/
│   │   └── page.tsx          # Login page
│   └── register/
│       └── page.tsx          # Registration page
│
├── teacher/                  # Teacher Pages
│   ├── dashboard/
│   │   └── page.tsx          # Teacher dashboard
│   └── classrooms/
│       └── [id]/
│           └── page.tsx      # Teacher classroom view
│
└── student/                  # Student Pages
    ├── dashboard/
    │   └── page.tsx          # Student dashboard
    └── classrooms/
        └── [id]/
            └── page.tsx      # Student classroom view
```

## Components

```
components/
├── AuthProvider.tsx          # NextAuth SessionProvider wrapper
├── Navbar.tsx                # Navigation bar component
└── LoadingSpinner.tsx        # Loading state component
```

## Library Code

```
lib/
├── auth.ts                   # NextAuth configuration
├── prisma.ts                 # Prisma client singleton
└── utils.ts                  # Helper functions
                              # - calculateStreaks()
                              # - calculatePoints()
                              # - generateJoinCode()
                              # - normalizeDate()
```

## Database

```
prisma/
└── schema.prisma             # Database schema
                              # Models: User, Classroom, Enrollment,
                              # RiyaazEntry, HomeworkAssignment,
                              # HomeworkSubmission
```

## TypeScript Types

```
types/
└── next-auth.d.ts            # NextAuth type extensions
                              # - Session.user with role
                              # - User with role
                              # - JWT with role
```

## Total File Count

- **Configuration files**: 13
- **API routes**: 13
- **Pages**: 7
- **Components**: 3
- **Library files**: 3
- **Database files**: 1
- **Type files**: 1
- **Documentation files**: 7

**Grand Total: ~48 files**

---

## File Descriptions

### Root Configuration

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies, scripts |
| `tsconfig.json` | TypeScript compiler options |
| `next.config.js` | Next.js build configuration |
| `tailwind.config.ts` | Tailwind CSS customization |
| `postcss.config.js` | PostCSS plugin configuration |
| `middleware.ts` | Auth middleware for route protection |
| `.env.example` | Environment variable template |
| `.gitignore` | Files to exclude from git |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `QUICKSTART.md` | Quick setup guide |
| `ARCHITECTURE.md` | Technical architecture |
| `API.md` | API endpoint reference |
| `DEPLOYMENT.md` | Deployment instructions |
| `SUMMARY.md` | Project overview |
| `CHANGELOG.md` | Version history |
| `FILES.md` | This file |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/auth/register` | POST | User registration |
| `/api/classrooms` | GET/POST | List/create classrooms |
| `/api/classrooms/join` | POST | Join classroom |
| `/api/classrooms/student` | GET | Student's classrooms |
| `/api/classrooms/[id]` | GET | Classroom details |
| `/api/classrooms/[id]/leaderboard` | GET | Leaderboard data |
| `/api/classrooms/[id]/activity` | GET | Activity feed |
| `/api/classrooms/[id]/stats` | GET | Student stats |
| `/api/classrooms/[id]/riyaaz` | GET/POST | Riyaaz entries |
| `/api/classrooms/[id]/homework` | GET/POST | Homework assignments |
| `/api/homework/[id]/submissions` | GET/POST | Homework submissions |

### Pages

| Page | Route | Access |
|------|-------|--------|
| Login | `/auth/login` | Public |
| Register | `/auth/register` | Public |
| Teacher Dashboard | `/teacher/dashboard` | Teacher |
| Teacher Classroom | `/teacher/classrooms/[id]` | Teacher |
| Student Dashboard | `/student/dashboard` | Student |
| Student Classroom | `/student/classrooms/[id]` | Student |
| Home | `/` | Public (redirects) |

### Components

| Component | Purpose |
|-----------|---------|
| `AuthProvider` | Wraps app with NextAuth session |
| `Navbar` | Navigation with user info and logout |
| `LoadingSpinner` | Loading state indicator |

### Library Files

| File | Exports |
|------|---------|
| `auth.ts` | `authOptions` (NextAuth config) |
| `prisma.ts` | `prisma` (Prisma client) |
| `utils.ts` | `calculateStreaks()`, `calculatePoints()`, `generateJoinCode()`, `normalizeDate()` |

### Database

| File | Purpose |
|------|---------|
| `schema.prisma` | Defines database models, relations, indexes |

---

## Navigation Map

```
/ (home)
│
├── /auth/login ───────────► Login Form
│                             ├── Teacher → /teacher/dashboard
│                             └── Student → /student/dashboard
│
├── /auth/register ────────► Registration Form
│                             └── → /auth/login
│
├── /teacher/dashboard ────► Teacher Dashboard
│   │                         ├── Create Classroom
│   │                         └── View Classrooms List
│   │
│   └── /teacher/classrooms/[id] ─► Classroom Detail
│                                    ├── Leaderboard
│                                    ├── Activity Feed
│                                    └── Homework Management
│
└── /student/dashboard ────► Student Dashboard
    │                         ├── Join Classroom
    │                         └── View Enrolled Classrooms
    │
    └── /student/classrooms/[id] ─► Classroom Detail
                                     ├── Log Riyaaz
                                     ├── View Stats
                                     ├── Practice History
                                     └── Submit Homework
```

---

## Key Directories

### `/app/api/*` - Backend Logic
All serverless API endpoints. Each `route.ts` exports HTTP method handlers (GET, POST, etc.).

### `/app/(role)/*` - Frontend Pages
Role-specific pages protected by middleware. Use `'use client'` directive for interactivity.

### `/components/*` - Reusable UI
Shared React components used across multiple pages.

### `/lib/*` - Business Logic
Core utilities, configuration, and helper functions. Imported throughout the app.

### `/prisma/*` - Database
Schema definition and migrations. Run `npx prisma studio` to view data.

---

## Import Patterns

Common imports across the codebase:

```typescript
// Prisma client
import { prisma } from '@/lib/prisma'

// Auth utilities
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { useSession } from 'next-auth/react'

// Helper functions
import { calculateStreaks, calculatePoints } from '@/lib/utils'

// Components
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'

// Next.js
import { NextRequest, NextResponse } from 'next/server'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Validation
import { z } from 'zod'
```

---

## File Naming Conventions

- **Routes**: `route.ts` for API routes, `page.tsx` for pages
- **Components**: PascalCase (e.g., `Navbar.tsx`)
- **Libraries**: camelCase (e.g., `auth.ts`)
- **Types**: PascalCase with `.d.ts` extension
- **Docs**: UPPERCASE.md

---

## What's Not Included

These are intentionally excluded (but can be added):

- **Tests**: No test files (`*.test.ts`, `*.spec.ts`)
- **CI/CD**: No GitHub Actions or pipeline configs
- **Docker**: No Dockerfile or docker-compose
- **Storybook**: No component playground
- **Monitoring**: No Sentry/LogRocket configs
- **i18n**: No internationalization files

---

## Adding New Files

When extending the project:

1. **New API endpoint**: Add to `/app/api/[feature]/route.ts`
2. **New page**: Add to `/app/(role)/[page]/page.tsx`
3. **New component**: Add to `/components/[Component].tsx`
4. **New utility**: Add to `/lib/[utility].ts`
5. **New model**: Update `prisma/schema.prisma` and migrate

---

This structure follows Next.js 14 App Router conventions and keeps code organized by feature and responsibility.
