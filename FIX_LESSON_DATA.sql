-- Script to check and potentially fix lesson data in the database
-- Run this in Supabase SQL Editor

-- First, let's check what's actually in the database for a specific lesson
SELECT 
  id,
  title,
  path_type,
  order_index,
  jsonb_typeof(content->'tasks') as tasks_type,
  jsonb_typeof(content->'followUps') as followups_type,
  jsonb_typeof(content->'quiz'->'questions') as quiz_type,
  CASE 
    WHEN jsonb_typeof(content->'tasks') = 'array' 
    THEN jsonb_array_length(content->'tasks')
    ELSE 0
  END as tasks_count,
  CASE 
    WHEN jsonb_typeof(content->'followUps') = 'array' 
    THEN jsonb_array_length(content->'followUps')
    ELSE 0
  END as followups_count,
  CASE 
    WHEN jsonb_typeof(content->'quiz'->'questions') = 'array' 
    THEN jsonb_array_length(content->'quiz'->'questions')
    ELSE 0
  END as quiz_count
FROM lessons
WHERE path_type = 'Med' AND order_index = 1
LIMIT 1;

-- Check all lessons
SELECT 
  path_type,
  order_index,
  title,
  CASE 
    WHEN jsonb_typeof(content->'tasks') = 'array' 
    THEN jsonb_array_length(content->'tasks')
    ELSE 0
  END as tasks_count,
  CASE 
    WHEN jsonb_typeof(content->'followUps') = 'array' 
    THEN jsonb_array_length(content->'followUps')
    ELSE 0
  END as followups_count,
  CASE 
    WHEN jsonb_typeof(content->'quiz'->'questions') = 'array' 
    THEN jsonb_array_length(content->'quiz'->'questions')
    ELSE 0
  END as quiz_count
FROM lessons
ORDER BY path_type, order_index;

-- If the data shows only 1 item per array, you need to:
-- 1. DELETE FROM lessons;
-- 2. Re-import from COMPLETE_ALL_46_LESSONS.sql

