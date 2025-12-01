-- Diagnostic query to check what's actually in the database
-- Run this AFTER importing COMPLETE_ALL_46_LESSONS.sql

SELECT 
  path_type,
  order_index,
  title,
  -- Check tasks
  jsonb_array_length(content->'tasks') as task_count,
  -- Check follow-ups  
  jsonb_array_length(content->'followUps') as followup_count,
  -- Check quiz questions
  jsonb_array_length(content->'quiz'->'questions') as quiz_count,
  -- Show first task question as sample
  content->'tasks'->0->>'question' as first_task_question
FROM lessons
ORDER BY path_type, order_index
LIMIT 10;

-- If you see task_count = 1, followup_count = 1, quiz_count = 1, 
-- then the database wasn't updated properly.

-- To fix: DELETE FROM lessons; then re-import COMPLETE_ALL_46_LESSONS.sql

