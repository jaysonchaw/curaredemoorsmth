# Steps to Fix Lesson Data Issue

## Problem
The database is showing only 1 task, 1 follow-up, and 1 quiz question per lesson, even though the SQL file contains multiple items.

## Solution

### Step 1: Verify the SQL File
The SQL file has been updated and now contains:
- ✅ 3 tasks for "Introduction to Medicine and Healthcare"
- ✅ 3 follow-ups for "Introduction to Medicine and Healthcare"  
- ✅ 3 quiz questions for "Introduction to Medicine and Healthcare"

### Step 2: Check What's in the Database
1. Open Supabase SQL Editor
2. Run `FIX_LESSON_DATA.sql` to see what's currently stored
3. This will show you the actual array lengths in the database

### Step 3: Delete and Re-import
If the database shows only 1 item per array:

1. **Delete all lessons:**
   ```sql
   DELETE FROM lessons;
   ```

2. **Re-import from the updated SQL file:**
   - Open `COMPLETE_ALL_46_LESSONS.sql`
   - Copy the entire file
   - Paste into Supabase SQL Editor
   - Run the query

3. **Verify the import:**
   ```sql
   SELECT 
     path_type,
     order_index,
     title,
     jsonb_array_length(content->'tasks') as tasks_count,
     jsonb_array_length(content->'followUps') as followups_count,
     jsonb_array_length(content->'quiz'->'questions') as quiz_count
   FROM lessons
   WHERE path_type = 'Med' AND order_index = 1;
   ```
   
   This should show:
   - tasks_count: 3
   - followups_count: 3
   - quiz_count: 3

### Step 4: Clear Browser Cache
After re-importing, clear your browser cache or do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to ensure the frontend loads the new data.

### Step 5: Check Browser Console
Open the browser console (F12) and look for the `=== LESSON DATA DEBUG ===` logs when loading a lesson. This will show you exactly what's being retrieved from the database.

## If Issues Persist

If after re-importing you still see only 1 item:
1. Check the browser console logs
2. Verify the database query results
3. Check if there's a caching issue in Supabase
4. Try logging out and back in to clear any session storage

