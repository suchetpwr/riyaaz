# Riyaaz Classroom - Architecture Overview

## System Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Application                       │
│                                                                  │
│  ┌────────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  React Pages   │  │  API Routes  │  │  NextAuth.js      │  │
│  │  (App Router)  │  │  (Serverless)│  │  (Auth Provider)  │  │
│  │                │  │              │  │                   │  │
│  │  • Teacher     │  │  • Classrooms│  │  • JWT Sessions   │  │
│  │  • Student     │  │  • Riyaaz    │  │  • Credentials    │  │
│  │  • Auth        │  │  • Homework  │  │  • Middleware     │  │
│  └────────────────┘  └──────────────┘  └───────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Prisma ORM Layer                       │  │
│  │  • Type-safe queries  • Migrations  • Connection pooling │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                     ┌──────────────────────┐
                     │  PostgreSQL Database │
                     │                      │
                     │  • Users             │
                     │  • Classrooms        │
                     │  • Enrollments       │
                     │  • RiyaazEntries     │
                     │  • Homework          │
                     └──────────────────────┘
```

## Component Architecture

### Frontend (React + Next.js)

**Pages Structure:**
- `/app/auth/*` - Authentication pages (login, register)
- `/app/teacher/*` - Teacher-only pages
- `/app/student/*` - Student-only pages
- `/app/api/*` - API route handlers

**Shared Components:**
- `Navbar` - Navigation with role-aware display
- `LoadingSpinner` - Loading states

**State Management:**
- React hooks (`useState`, `useEffect`)
- NextAuth's `useSession` for auth state
- No global state management (Zustand/Redux) - keeps it simple

### Backend (Next.js API Routes)

**Authentication:**
- NextAuth.js handles session management
- Credentials provider with bcrypt password hashing
- JWT stored in HTTP-only cookies
- Middleware protects teacher/student routes

**API Endpoints:**

```
/api/auth
├── [...nextauth]     # NextAuth handler (GET/POST)
└── register          # User registration (POST)

/api/classrooms
├── /                 # List/create classrooms (GET/POST)
├── /join             # Join classroom with code (POST)
├── /student          # Student's classrooms (GET)
├── /[id]
│   ├── /             # Classroom details (GET)
│   ├── /leaderboard  # Classroom leaderboard (GET)
│   ├── /activity     # Recent activity feed (GET)
│   ├── /stats        # Student stats for classroom (GET)
│   ├── /riyaaz       # Log/list riyaaz entries (GET/POST)
│   └── /homework     # List/create homework (GET/POST)

/api/homework
└── /[id]/submissions # Submit/list homework (GET/POST)
```

**Authorization:**
Each API route verifies:
1. User is authenticated (`getServerSession`)
2. User has correct role (TEACHER/STUDENT)
3. User has access to the resource (owns classroom, enrolled, etc.)

### Database (PostgreSQL + Prisma)

**Schema Design:**

```sql
User (id, email, passwordHash, name, role)
  ↓ 1:N
Classroom (id, name, joinCode, teacherId)
  ↓ 1:N
Enrollment (id, classroomId, studentId) -- M:N junction
  ↓
RiyaazEntry (id, classroomId, studentId, date, ...)
HomeworkAssignment (id, classroomId, title, ...)
HomeworkSubmission (id, assignmentId, studentId, ...)
```

**Key Constraints:**
- `Enrollment` has unique constraint on `(classroomId, studentId)`
- `RiyaazEntry` has unique constraint on `(classroomId, studentId, date)` - one entry per day
- `HomeworkSubmission` has unique constraint on `(assignmentId, studentId)` - one submission per assignment

**Indexes:**
- Foreign keys auto-indexed
- Composite indexes on junction tables
- `joinCode` unique index for fast lookups

## Core Logic

### Streak Calculation Algorithm

Located in `lib/utils.ts`:

```typescript
function calculateStreaks(entries: { date: Date }[]): {
  currentStreak: number;
  longestStreak: number;
}
```

**Algorithm:**
1. Sort entries by date (most recent first)
2. Get unique dates (dedupe multiple entries per day)
3. **Current Streak:**
   - Check if most recent practice was today or yesterday
   - If yes, walk backwards counting consecutive days
   - If gap > 1 day, streak = 0
4. **Longest Streak:**
   - Walk through all dates
   - Count consecutive sequences
   - Track maximum

**Time Complexity:** O(n log n) for sorting, O(n) for calculation

### Points Calculation

Located in `lib/utils.ts`:

```typescript
function calculatePoints(
  riyaazEntries: { date: Date }[],
  homeworkSubmissions: any[]
): number
```

**Formula:**
```
Total Points = (Unique Practice Days × 10) + (Homework Submissions × 20)
```

**Implementation:**
- Count unique dates from riyaaz entries (use Set)
- Count homework submissions
- No caching - computed on demand (acceptable for MVP scale)

### Join Code Generation

Format: `RZ-XXXX` (e.g., `RZ-3F8K`)
- 4 random alphanumeric characters
- Uniqueness verified against database
- Retry up to 10 times if collision

## Data Flow Examples

### 1. Student Logs Daily Riyaaz

```
Student → POST /api/classrooms/[id]/riyaaz
  ↓
NextAuth verifies session
  ↓
Verify student enrolled in classroom
  ↓
Prisma UPSERT RiyaazEntry (unique: classroomId + studentId + date)
  ↓
Return entry → Update UI
  ↓
Refetch stats → Recalculate streaks/points
```

### 2. Teacher Views Leaderboard

```
Teacher → GET /api/classrooms/[id]/leaderboard
  ↓
NextAuth verifies session + teacher role
  ↓
Verify teacher owns classroom
  ↓
Fetch all enrollments in classroom
  ↓
For each student:
  - Fetch RiyaazEntries → calculateStreaks()
  - Fetch HomeworkSubmissions → calculatePoints()
  ↓
Sort by total points DESC
  ↓
Return leaderboard → Render table
```

### 3. Student Joins Classroom

```
Student → POST /api/classrooms/join { joinCode }
  ↓
NextAuth verifies session + student role
  ↓
Lookup classroom by joinCode
  ↓
Check if already enrolled (prevent duplicates)
  ↓
Create Enrollment record
  ↓
Return success → Redirect to classroom
```

## Security Model

### Authentication
- **Session Storage:** JWT in HTTP-only cookie (not accessible to JavaScript)
- **Password Hashing:** bcrypt with 10 salt rounds
- **Session Expiration:** 30 days (configurable in NextAuth)

### Authorization Layers

1. **Middleware** (`middleware.ts`):
   - Protects `/teacher/*` and `/student/*` routes
   - Redirects unauthenticated users to login

2. **API Routes**:
   - Every route calls `getServerSession(authOptions)`
   - Checks user role (TEACHER/STUDENT)
   - Verifies resource ownership/access

3. **Database**:
   - Foreign keys prevent orphaned records
   - Unique constraints prevent duplicate entries
   - Prisma prevents SQL injection

### Input Validation
- Zod schemas validate all API inputs
- Returns 400 Bad Request for invalid data
- TypeScript provides compile-time type safety

## Deployment Architecture (Vercel)

```
┌─────────────────────────────────────────────────────────┐
│                     Vercel Platform                      │
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │           Edge Network (CDN)                    │   │
│  │  • Static assets cached globally                │   │
│  │  • Fast page loads                              │   │
│  └────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌────────────────────────────────────────────────┐   │
│  │       Serverless Functions (AWS Lambda)        │   │
│  │  • API routes auto-deployed                    │   │
│  │  • Auto-scaling                                │   │
│  │  • Cold starts ~100-500ms                      │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  PostgreSQL DB      │
              │  (Supabase/Neon)    │
              │  • Connection pool  │
              │  • SSL required     │
              └─────────────────────┘
```

**Benefits:**
- Zero DevOps - just push to GitHub
- Automatic HTTPS
- Preview deployments for PRs
- Environment variables per environment
- Built-in analytics

**Considerations:**
- Serverless function timeout: 10s (hobby), 60s (pro)
- Prisma connection pooling needed for serverless
- Cold starts on first request

## Performance Optimization

### Current Optimizations
- **Database Queries:**
  - Use `select` to fetch only needed fields
  - `include` with `_count` for aggregations
  - Indexes on foreign keys

- **Frontend:**
  - Static page generation where possible
  - Client-side navigation (Next.js)
  - Tailwind CSS purges unused styles

### Future Optimizations (if needed)
- Cache leaderboard data (Redis)
- Paginate long lists
- Debounce search inputs
- Virtual scrolling for large tables
- Image optimization for profile pictures

## Scalability Considerations

**Current MVP Scale:**
- Supports ~100-1000 concurrent users
- Works well up to ~10,000 students
- No caching layer (compute on demand)

**Bottlenecks at Scale:**
- Leaderboard calculation (O(n) per student)
- Activity feed queries (no pagination)
- Database connections (serverless limits)

**Scaling Strategies:**
1. **Add Caching:**
   - Redis for leaderboard data
   - Invalidate on new riyaaz/homework

2. **Denormalize Stats:**
   - Store computed points/streaks in database
   - Update via triggers or background jobs

3. **Pagination:**
   - Limit API responses to 20-50 items
   - Cursor-based pagination for feeds

4. **Database Optimization:**
   - Read replicas for leaderboard queries
   - Materialized views for aggregations

## Testing Strategy (Not Implemented in MVP)

Recommended testing approach:

1. **Unit Tests:**
   - `calculateStreaks()` function
   - `calculatePoints()` function
   - `generateJoinCode()` function

2. **Integration Tests:**
   - API route handlers
   - Database queries

3. **E2E Tests:**
   - User registration flow
   - Teacher creates classroom
   - Student joins and logs riyaaz
   - Leaderboard updates

**Tools:** Jest, Playwright, Vitest

## Monitoring & Observability

**For Production:**
- Vercel Analytics (free with deployment)
- Sentry for error tracking
- Prisma query logging
- Custom API logs with Winston/Pino

**Metrics to Track:**
- API response times
- Error rates
- User sign-ups
- Daily active users
- Riyaaz entries per day

---

This architecture balances simplicity (MVP goals) with production-readiness (secure, scalable patterns). The monolithic Next.js approach keeps deployment simple while the modular code structure allows easy extraction of services later if needed.
