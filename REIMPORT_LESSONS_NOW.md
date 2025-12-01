# Re-import Lessons to Fix Missing Questions

The SQL file has been regenerated with all questions (3 tasks, 3 follow-ups, 3 quiz questions per lesson), but the database needs to be updated.

## Steps to Fix:

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to the SQL Editor

2. **Delete Existing Lessons** (to avoid duplicates)
   ```sql
   DELETE FROM lessons;
   ```

3. **Import the New SQL File**
   - Copy the entire contents of `COMPLETE_ALL_46_LESSONS.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

4. **Verify the Import**
   ```sql
   SELECT 
     path_type,
     order_index,
     title,
     jsonb_array_length(content->'tasks') as task_count,
     jsonb_array_length(content->'followUps') as followup_count,
     jsonb_array_length(content->'quiz'->'questions') as quiz_count
   FROM lessons
   ORDER BY path_type, order_index
   LIMIT 10;
   ```

   You should see:
   - `task_count`: 3
   - `followup_count`: 3
   - `quiz_count`: 3 (or 1 for some lessons)

5. **Clear Browser Cache**
   - Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
   - Or clear the application cache

After re-importing, all lessons should have multiple questions!

