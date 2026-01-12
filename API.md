# API Documentation

Complete reference for all API endpoints in the Riyaaz Classroom application.

## Authentication

All authenticated endpoints require a valid session cookie from NextAuth.

**Headers:**
```
Cookie: next-auth.session-token=<jwt-token>
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `400 Bad Request` - Invalid input
- `500 Internal Server Error` - Server error

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "TEACHER" | "STUDENT"
}
```

**Response (201 Created):**
```json
{
  "id": "clx123abc",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "TEACHER"
}
```

**Errors:**
- `400` - Email already exists or invalid input

---

### POST /api/auth/callback/credentials

Login (handled by NextAuth).

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
Sets session cookie and returns user data.

---

## Classroom Endpoints

### GET /api/classrooms

Get all classrooms for the logged-in teacher.

**Auth:** Teacher only

**Response (200 OK):**
```json
[
  {
    "id": "clx123abc",
    "name": "Hindustani Vocal - Beginner",
    "description": "Learn classical riyaaz techniques",
    "joinCode": "RZ-3F8K",
    "teacherId": "clx456def",
    "createdAt": "2025-11-18T10:00:00Z",
    "updatedAt": "2025-11-18T10:00:00Z",
    "_count": {
      "enrollments": 5
    }
  }
]
```

---

### POST /api/classrooms

Create a new classroom.

**Auth:** Teacher only

**Request Body:**
```json
{
  "name": "Hindustani Vocal - Beginner",
  "description": "Optional description"
}
```

**Response (201 Created):**
```json
{
  "id": "clx123abc",
  "name": "Hindustani Vocal - Beginner",
  "description": "Optional description",
  "joinCode": "RZ-3F8K",
  "teacherId": "clx456def",
  "createdAt": "2025-11-18T10:00:00Z",
  "updatedAt": "2025-11-18T10:00:00Z"
}
```

---

### POST /api/classrooms/join

Join a classroom using a join code.

**Auth:** Student only

**Request Body:**
```json
{
  "joinCode": "RZ-3F8K"
}
```

**Response (201 Created):**
```json
{
  "id": "clx789ghi",
  "classroomId": "clx123abc",
  "studentId": "clx456def",
  "joinedAt": "2025-11-18T10:00:00Z",
  "classroom": {
    "id": "clx123abc",
    "name": "Hindustani Vocal - Beginner",
    "description": "..."
  }
}
```

**Errors:**
- `404` - Invalid join code
- `400` - Already enrolled

---

### GET /api/classrooms/student

Get all classrooms for the logged-in student.

**Auth:** Student only

**Response (200 OK):**
```json
[
  {
    "id": "clx789ghi",
    "classroomId": "clx123abc",
    "studentId": "clx456def",
    "joinedAt": "2025-11-18T10:00:00Z",
    "classroom": {
      "id": "clx123abc",
      "name": "Hindustani Vocal - Beginner",
      "description": "...",
      "teacher": {
        "id": "clx999xyz",
        "name": "Teacher Name",
        "email": "teacher@example.com"
      }
    }
  }
]
```

---

### GET /api/classrooms/[id]

Get details of a specific classroom.

**Auth:** Teacher (owner) or enrolled Student

**Response (200 OK):**
```json
{
  "id": "clx123abc",
  "name": "Hindustani Vocal - Beginner",
  "description": "...",
  "joinCode": "RZ-3F8K",
  "teacherId": "clx456def",
  "teacher": {
    "id": "clx456def",
    "name": "Teacher Name",
    "email": "teacher@example.com"
  },
  "_count": {
    "enrollments": 5
  }
}
```

---

### GET /api/classrooms/[id]/leaderboard

Get leaderboard for a classroom.

**Auth:** Teacher (owner) or enrolled Student

**Response (200 OK):**
```json
[
  {
    "studentId": "clx789ghi",
    "studentName": "Student One",
    "currentStreak": 7,
    "longestStreak": 15,
    "totalPoints": 150,
    "lastPracticedDate": "2025-11-18"
  },
  {
    "studentId": "clx789jkl",
    "studentName": "Student Two",
    "currentStreak": 3,
    "longestStreak": 8,
    "totalPoints": 90,
    "lastPracticedDate": "2025-11-17"
  }
]
```

**Note:** Sorted by `totalPoints` descending.

---

### GET /api/classrooms/[id]/activity

Get recent activity feed for a classroom.

**Auth:** Teacher (owner) only

**Response (200 OK):**
```json
[
  {
    "type": "riyaaz",
    "studentName": "Student One",
    "details": "Raag Yaman, 30 min",
    "date": "2025-11-18",
    "timestamp": "2025-11-18T10:30:00Z"
  },
  {
    "type": "homework",
    "studentName": "Student Two",
    "details": "Alankars in Yaman",
    "date": "2025-11-18T09:00:00Z",
    "timestamp": "2025-11-18T09:00:00Z"
  }
]
```

---

### GET /api/classrooms/[id]/stats

Get student's stats for a specific classroom.

**Auth:** Student (enrolled) only

**Response (200 OK):**
```json
{
  "currentStreak": 7,
  "longestStreak": 15,
  "totalPoints": 150,
  "lastPracticedDate": "2025-11-18",
  "totalRiyaazDays": 15,
  "totalHomeworkSubmissions": 3
}
```

---

## Riyaaz Endpoints

### GET /api/classrooms/[id]/riyaaz

Get all riyaaz entries for the logged-in student in a classroom.

**Auth:** Student (enrolled) only

**Response (200 OK):**
```json
[
  {
    "id": "clx123abc",
    "classroomId": "clx456def",
    "studentId": "clx789ghi",
    "date": "2025-11-18",
    "durationMinutes": 30,
    "raga": "Yaman",
    "recordingUrl": "https://drive.google.com/...",
    "notes": "Focused on alankars",
    "createdAt": "2025-11-18T10:00:00Z",
    "updatedAt": "2025-11-18T10:00:00Z"
  }
]
```

**Note:** Sorted by `date` descending (most recent first).

---

### POST /api/classrooms/[id]/riyaaz

Log or update a riyaaz entry for a specific date.

**Auth:** Student (enrolled) only

**Request Body:**
```json
{
  "date": "2025-11-18",
  "durationMinutes": 30,
  "raga": "Yaman",
  "recordingUrl": "https://drive.google.com/...",
  "notes": "Optional notes"
}
```

**Response (201 Created):**
```json
{
  "id": "clx123abc",
  "classroomId": "clx456def",
  "studentId": "clx789ghi",
  "date": "2025-11-18",
  "durationMinutes": 30,
  "raga": "Yaman",
  "recordingUrl": "https://drive.google.com/...",
  "notes": "Optional notes",
  "createdAt": "2025-11-18T10:00:00Z",
  "updatedAt": "2025-11-18T10:00:00Z"
}
```

**Note:** If entry for the date already exists, it will be updated (upsert).

---

## Homework Endpoints

### GET /api/classrooms/[id]/homework

Get all homework assignments for a classroom.

**Auth:** Teacher (owner) or enrolled Student

**Response (200 OK) - Teacher View:**
```json
[
  {
    "id": "clx123abc",
    "classroomId": "clx456def",
    "title": "Alankars in Raag Yaman",
    "description": "Practice all 12 alankars",
    "dueDate": "2025-11-25T00:00:00Z",
    "createdAt": "2025-11-18T10:00:00Z",
    "updatedAt": "2025-11-18T10:00:00Z",
    "_count": {
      "submissions": 3
    }
  }
]
```

**Response (200 OK) - Student View:**
```json
[
  {
    "id": "clx123abc",
    "classroomId": "clx456def",
    "title": "Alankars in Raag Yaman",
    "description": "Practice all 12 alankars",
    "dueDate": "2025-11-25T00:00:00Z",
    "createdAt": "2025-11-18T10:00:00Z",
    "updatedAt": "2025-11-18T10:00:00Z",
    "_count": {
      "submissions": 3
    },
    "submissions": [
      {
        "id": "clx789ghi",
        "assignmentId": "clx123abc",
        "studentId": "clx456def",
        "recordingUrl": "https://drive.google.com/...",
        "notes": "Completed all 12",
        "submittedAt": "2025-11-20T10:00:00Z"
      }
    ]
  }
]
```

**Note:** Students only see their own submissions.

---

### POST /api/classrooms/[id]/homework

Create a new homework assignment.

**Auth:** Teacher (owner) only

**Request Body:**
```json
{
  "title": "Alankars in Raag Yaman",
  "description": "Practice all 12 alankars",
  "dueDate": "2025-11-25"
}
```

**Response (201 Created):**
```json
{
  "id": "clx123abc",
  "classroomId": "clx456def",
  "title": "Alankars in Raag Yaman",
  "description": "Practice all 12 alankars",
  "dueDate": "2025-11-25T00:00:00Z",
  "createdAt": "2025-11-18T10:00:00Z",
  "updatedAt": "2025-11-18T10:00:00Z"
}
```

---

### GET /api/homework/[assignmentId]/submissions

Get all submissions for a homework assignment.

**Auth:** Teacher (owner) or enrolled Student

**Response (200 OK):**
```json
[
  {
    "id": "clx789ghi",
    "assignmentId": "clx123abc",
    "studentId": "clx456def",
    "recordingUrl": "https://drive.google.com/...",
    "notes": "Completed all 12",
    "submittedAt": "2025-11-20T10:00:00Z",
    "student": {
      "id": "clx456def",
      "name": "Student One",
      "email": "student@example.com"
    }
  }
]
```

---

### POST /api/homework/[assignmentId]/submissions

Submit homework.

**Auth:** Student (enrolled) only

**Request Body:**
```json
{
  "recordingUrl": "https://drive.google.com/...",
  "notes": "Optional notes"
}
```

**Response (201 Created):**
```json
{
  "id": "clx789ghi",
  "assignmentId": "clx123abc",
  "studentId": "clx456def",
  "recordingUrl": "https://drive.google.com/...",
  "notes": "Optional notes",
  "submittedAt": "2025-11-20T10:00:00Z"
}
```

**Errors:**
- `400` - Already submitted (one submission per student per assignment)

---

## Rate Limiting

Not implemented in MVP. Recommended for production:
- **Authentication endpoints**: 5 requests per minute
- **Read endpoints**: 100 requests per minute
- **Write endpoints**: 20 requests per minute

Use libraries like `express-rate-limit` or Vercel's Edge Config.

---

## Pagination

Not implemented in MVP. All lists return full results.

For production, add query parameters:
```
GET /api/classrooms/[id]/riyaaz?page=1&limit=20
```

---

## Webhooks

Not available in MVP. Future enhancement for integrations.

---

## Testing API Endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123","role":"STUDENT"}'

# Login (returns cookie)
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -c cookies.txt

# Use cookie for authenticated requests
curl http://localhost:3000/api/classrooms/student \
  -b cookies.txt
```

### Using Postman/Insomnia

1. POST to `/api/auth/callback/credentials` to login
2. Save the `next-auth.session-token` cookie
3. Include cookie in subsequent requests

---

## Common Patterns

### Error Handling

All errors return JSON:
```json
{
  "error": "Error message here"
}
```

For validation errors:
```json
{
  "error": "Invalid input",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    }
  ]
}
```

### Date Formats

- **Input**: ISO 8601 strings (`"2025-11-18"` or `"2025-11-18T10:00:00Z"`)
- **Output**: ISO 8601 strings with timezone
- **Database**: Date type for dates, DateTime for timestamps

### Authentication Flow

1. User logs in → NextAuth creates session
2. Session stored in HTTP-only cookie
3. Every API request includes cookie
4. API validates session with `getServerSession(authOptions)`
5. API checks user role and permissions

---

For more details, see the source code in `app/api/`.
