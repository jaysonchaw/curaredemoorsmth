# Fix: Only 1 Question Per Type After Import

## Problem
After importing `COMPLETE_ALL_46_LESSONS.sql`, you're still seeing only 1 task, 1 follow-up, and 1 quiz question per lesson.

## Solution Steps

### Step 1: Verify the SQL File
The SQL file should have 3 tasks, 3 follow-ups, and 3 quiz questions per lesson. Run this in your terminal:

```bash
python3 << 'EOF'
import json
import re
with open('COMPLETE_ALL_46_LESSONS.sql', 'r') as f:
    content = f.read()
json_matches = re.findall(r"'({.*?})'::jsonb", content, re.DOTALL)
data = json.loads(json_matches[0].replace("''", "'"))
print(f"Tasks: {len(data.get('tasks', []))}")
print(f"Follow-ups: {len(data.get('followUps', []))}")
print(f"Quiz: {len(data.get('quiz', {}).get('questions', []))}")
EOF
```

You should see: `Tasks: 3`, `Follow-ups: 3`, `Quiz: 3`

### Step 2: Check What's in Your Database
Run this query in Supabase SQL Editor:

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
LIMIT 5;
```

If you see `task_count = 1`, the database wasn't updated properly.

### Step 3: Fix the Import

**Option A: Delete and Re-import (Recommended)**

1. In Supabase SQL Editor, run:
   ```sql
   DELETE FROM lessons;
   ```

2. Copy the **ENTIRE** `COMPLETE_ALL_46_LESSONS.sql` file (all 338 lines)

3. Paste it into Supabase SQL Editor

4. Click "Run" (make sure it runs the entire file, not just one statement)

5. Verify with the query from Step 2

**Option B: If Option A doesn't work, try importing one lesson at a time**

The SQL file has 46 separate INSERT statements. Supabase might be having issues with the large JSON. Try importing just the first lesson:

1. Open `COMPLETE_ALL_46_LESSONS.sql`
2. Copy just the first `INSERT INTO lessons...` statement (lines 17-23)
3. Run it in Supabase
4. Check if it has 3 tasks:
   ```sql
   SELECT jsonb_array_length(content->'tasks') FROM lessons WHERE path_type = 'Pre-Med' AND order_index = 1;
   ```

### Step 4: Common Issues

**Issue 1: Supabase truncating JSON**
- The JSON strings are very long. Supabase might have a limit.
- Solution: Check Supabase project settings for JSON size limits

**Issue 2: Copy-paste issues**
- Make sure you copy the ENTIRE file, including the closing `'::jsonb);`
- Check for any truncation in the SQL editor

**Issue 3: Multiple imports creating duplicates**
- Make sure you run `DELETE FROM lessons;` first
- Check for duplicates:
  ```sql
  SELECT path_type, order_index, COUNT(*) 
  FROM lessons 
  GROUP BY path_type, order_index 
  HAVING COUNT(*) > 1;
  ```

### Step 5: Verify After Import

Run this query to verify all lessons have multiple questions:

```sql
SELECT 
  path_type,
  order_index,
  title,
  jsonb_array_length(content->'tasks') as tasks,
  jsonb_array_length(content->'followUps') as followups,
  jsonb_array_length(content->'quiz'->'questions') as quiz
FROM lessons
WHERE jsonb_array_length(content->'tasks') = 1
   OR jsonb_array_length(content->'followUps') = 1
   OR jsonb_array_length(content->'quiz'->'questions') = 1
ORDER BY path_type, order_index;
```

If this returns any rows, those lessons still have only 1 question and need to be re-imported.

