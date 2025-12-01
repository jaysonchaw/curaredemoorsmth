# Supabase Database Schema

## Required Tables

### users
This table stores user information and progress.

**IMPORTANT: Email Usage**
- `email` field: This is the STUDENT's email address used for login/authentication. This comes from `auth.users.email`.
- `parent_email` field: This is ONLY used for sending verification emails during signup (if user is under 18). It is NOT used for login.I

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,  -- STUDENT's email (from auth.users.email) - used for login
  full_name TEXT,
  uli TEXT UNIQUE NOT NULL,
  group_number INTEGER NOT NULL,
  birthday DATE,
  parent_email TEXT,  -- PARENT's email - ONLY for verification emails during signup, NOT for login
  parent_consent BOOLEAN DEFAULT false,
  has_completed_intro BOOLEAN DEFAULT false,
  daily_time_minutes INTEGER,
  selected_path TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Service role can insert (for signup)
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT WITH CHECK (true);
```

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL commands above to create the table and policies
4. Make sure Google OAuth is enabled in Authentication > Providers

## Additional Tables Needed

### lessons
Stores lesson content for Pre-Med and Med paths.

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_type TEXT NOT NULL CHECK (path_type IN ('Pre-Med', 'Med')),
  module_id INTEGER,
  title TEXT NOT NULL,
  objective TEXT,
  estimated_duration INTEGER, -- in minutes
  content JSONB, -- stores lesson content (video, text, tasks, follow-ups, quiz)
  competence_tag TEXT CHECK (competence_tag IN ('safe', 'first aid', 'anatomy')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lessons_path_type ON lessons(path_type);
CREATE INDEX idx_lessons_order ON lessons(path_type, order_index);
```

### user_lesson_progress
Tracks user progress through lessons.

```sql
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  score INTEGER, -- quiz score percentage
  time_spent_minutes INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_user_progress_lesson ON user_lesson_progress(lesson_id);
```

### time_logs
Tracks time spent by users for calculating weekly stats and streaks.

```sql
CREATE TABLE time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  minutes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_time_logs_user_date ON time_logs(user_id, date);
```

### badges
Stores available badges.

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_badges
Tracks which badges users have earned.

```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
```

### quiz_scores
Stores pre-test and post-test scores.

```sql
CREATE TABLE quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('pre', 'post')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_scores_user ON quiz_scores(user_id);
```

### certificates
Stores earned certificates.

```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_certificates_user ON certificates(user_id);
```

### analytics
Tracks analytics events (lesson_started, lesson_completed, etc.).

```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_user ON analytics(user_id);
CREATE INDEX idx_analytics_event ON analytics(event_type);
```

## Notes

- The `uli` field must be unique to prevent duplicate registrations
- Row Level Security (RLS) is enabled to ensure users can only access their own data
- The service role policy allows inserts during signup (you may want to restrict this further in production)
- All additional tables should have RLS policies similar to the `users` table
- Lesson content from the PDFs should be populated into the `lessons` table
- Stats (timeThisWeek, streakDays, badgesEarned) are calculated from `time_logs`, `user_badges`, and related tables

