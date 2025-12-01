# Re-import Lessons Instructions

## Problem
The database appears to only have 1 task, 1 follow-up, and 1 quiz question per lesson, even though the SQL file contains multiple items (typically 3 of each).

## Solution: Re-import the lessons

### Step 1: Check Current Data
Run the diagnostic query in `CHECK_LESSON_DATA.sql` in Supabase SQL Editor to see what's currently in the database.

### Step 2: Delete Existing Lessons
In Supabase SQL Editor, run:
```sql
DELETE FROM lessons;
```

### Step 3: Re-import Lessons
1. Open Supabase SQL Editor
2. Copy the entire contents of `COMPLETE_ALL_46_LESSONS.sql`
3. Paste into the SQL Editor
4. Run the query

### Step 4: Verify Import
Run the diagnostic query again to verify that all lessons now have the correct number of tasks, follow-ups, and quiz questions.

### Alternative: Update Specific Lesson
If you only want to update one lesson, you can run:
```sql
-- Delete specific lesson
DELETE FROM lessons WHERE path_type = 'Pre-Med' AND order_index = 1;

-- Then re-insert from COMPLETE_ALL_46_LESSONS.sql (copy just that lesson's INSERT statement)
```

## Expected Results
After re-import, each lesson should have:
- 3 tasks (typically)
- 3 follow-ups (typically)
- 3 quiz questions (typically)

The exact number may vary by lesson, but most should have multiple items in each array.

