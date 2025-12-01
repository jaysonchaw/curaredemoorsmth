# Teacher Platform - Lessons, Assignments, and Posts

This document provides setup instructions and an overview of the teacher platform features.

## Features Implemented

### 1. Lessons Management
- **Global Lessons View**: Display all available lessons from the roadmap
- **Classroom Lesson Mapping**: Map global lessons to classroom-specific sequences
- **Drag-and-Drop Ordering**: Reorder lessons in the classroom sequence
- **Lock/Unlock**: Control student access to lessons
- **Mandatory/Optional**: Mark lessons as required or optional
- **Lesson Preview**: View student-facing lesson content

### 2. Assignment Builder
- **Question Types**:
  - Multiple Choice (single or multiple correct answers)
  - Fill in the Blank (pattern matching with synonyms)
  - Free Text / Fill in Box (open response)
  - Open Text (long-form response)
  - Sequence/Ordering
  - Timed Tasks
- **Assignment Management**:
  - Create, edit, delete assignments
  - Save as draft or publish
  - Set due dates and visibility windows
  - Attach files (metadata stored)
  - Target specific lessons

### 3. Submissions & Grading
- **Submission View**: List all student submissions with filters
- **Grading Interface**: 
  - View student answers side-by-side with questions
  - Provide inline comments
  - Set scores
  - Auto-grade multiple choice questions
- **CSV Export**: Export grades with student info, scores, and comments

### 4. Posts Feed
- **Create Posts**: Share announcements with the class
- **Pinning**: Pin important posts to the top
- **Comments**: Students and teachers can comment
- **Moderation**: Teachers can delete/hide comments
- **Search**: Search posts by content
- **Visibility**: Control who can see posts (class or teachers only)

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- Supabase project with existing `lessons` table

### 1. Database Setup

Run the migrations in order:

```bash
# 1. Base teacher schema
psql -h your-db-host -U your-user -d your-db -f database/teacher_schema.sql

# 2. Extended schema for new features
psql -h your-db-host -U your-user -d your-db -f database/migrations/001_extend_schema.sql

# 3. Seed demo data (optional)
psql -h your-db-host -U your-user -d your-db -f database/seed_demo_data.sql
```

### 2. Backend Setup

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start the server
npm run server:dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Test Mode

For development/testing, use the "testsecure" access code:
- **Student**: Enter "testsecure" in the access code modal
- **Teacher**: Enter "testsecure" as the full name in teacher signup

Test mode uses `sessionStorage` and doesn't persist to the database.

## API Endpoints

### Lessons
- `GET /api/lessons` - Get all global lessons
- `GET /api/lessons/classrooms/:id` - Get classroom-mapped lessons
- `POST /api/lessons/classrooms/:id` - Map lesson to classroom
- `PATCH /api/lessons/classrooms/:id/lessons/:classroomLessonId` - Update mapping
- `DELETE /api/lessons/classrooms/:id/lessons/:classroomLessonId` - Remove mapping

### Assignments
- `POST /api/assignments/classrooms/:id` - Create assignment
- `GET /api/assignments/classrooms/:id` - List assignments
- `GET /api/assignments/:assignmentId` - Get assignment details
- `PATCH /api/assignments/:assignmentId` - Update assignment
- `POST /api/assignments/:assignmentId/publish` - Publish assignment
- `DELETE /api/assignments/:assignmentId` - Delete assignment

### Submissions
- `POST /api/submissions/assignments/:assignmentId/submit` - Student submit
- `GET /api/submissions/assignments/:assignmentId/submissions` - List submissions
- `GET /api/submissions/:submissionId` - Get submission details
- `POST /api/submissions/:submissionId/grade` - Grade submission
- `POST /api/submissions/assignments/:assignmentId/autograde` - Auto-grade MCQs

### Posts
- `POST /api/posts/classrooms/:id` - Create post
- `GET /api/posts/classrooms/:id` - List posts
- `PATCH /api/posts/:postId` - Update post
- `DELETE /api/posts/:postId` - Delete post
- `POST /api/posts/:postId/comments` - Add comment
- `DELETE /api/posts/:postId/comments/:commentId` - Delete comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-read` - Mark as read

## Authentication

Currently using a simplified header-based auth:
- Teachers: `x-teacher-id` header
- Students: `x-user-id` header

**Note**: In production, implement JWT tokens with httpOnly cookies.

## Demo Data

The seed script creates:
- 1 demo teacher (email: `demo.teacher@curare.test`)
- 1 classroom (code: `O7DCUIK`)
- 6 demo students
- 4 mapped lessons
- 1 draft assignment
- 1 published assignment with 3 questions
- 3 submissions (1 graded, 2 ungraded)
- 1 pinned post

## File Structure

```
server/
  routes/
    lessons.js          # Lesson management endpoints
    assignments.js      # Assignment CRUD endpoints
    submissions.js      # Submission and grading endpoints
    posts.js           # Posts and comments endpoints
    notifications.js   # Notification endpoints

src/
  components/teacher/
    LessonsTab.jsx          # Lessons management UI
    AssignmentBuilder.jsx   # Assignment creation/editing
    AssignmentsTab.jsx     # Assignment list view
    SubmissionsView.jsx    # Grading interface
    PostsTab.jsx           # Posts feed

database/
  teacher_schema.sql        # Base teacher schema
  migrations/
    001_extend_schema.sql   # Extended schema
  seed_demo_data.sql       # Demo data
```

## Next Steps

1. **JWT Authentication**: Replace header-based auth with JWT tokens
2. **File Uploads**: Implement actual file storage for attachments
3. **Email Notifications**: Send emails when assignments are published
4. **Advanced Analytics**: Build analytics dashboard
5. **Student View**: Create student-facing assignment submission interface
6. **Tests**: Add unit and integration tests

## Support

For issues or questions, refer to the main project documentation or contact the development team.
