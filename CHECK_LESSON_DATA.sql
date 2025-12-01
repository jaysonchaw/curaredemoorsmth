-- Diagnostic query to check lesson data structure
-- Run this in Supabase SQL Editor to see what's actually stored

-- Check a specific lesson (Pre-Med Lesson 1)
SELECT 
  id,
  title,
  path_type,
  order_index,
  jsonb_array_length(content->'tasks') as tasks_count,
  jsonb_array_length(content->'followUps') as followups_count,
  jsonb_array_length(content->'quiz'->'questions') as quiz_questions_count,
  content->'tasks' as tasks_array,
  content->'followUps' as followups_array,
  content->'quiz'->'questions' as quiz_questions_array
FROM lessons
WHERE path_type = 'Pre-Med' AND order_index = 1
LIMIT 1;

-- Check all lessons and their array counts
SELECT 
  path_type,
  order_index,
  title,
  jsonb_array_length(COALESCE(content->'tasks', '[]'::jsonb)) as tasks_count,
  jsonb_array_length(COALESCE(content->'followUps', '[]'::jsonb)) as followups_count,
  jsonb_array_length(COALESCE(content->'quiz'->'questions', '[]'::jsonb)) as quiz_questions_count
FROM lessons
ORDER BY path_type, order_index;

