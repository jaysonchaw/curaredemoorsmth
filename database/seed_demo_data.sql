-- Seed Demo Data for Teacher Platform
-- Run this after migrations

-- Create demo teacher
INSERT INTO users (id, email, full_name, role, verified, password_hash)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo.teacher@curare.test',
  'Demo Teacher',
  'teacher',
  true,
  '$2a$10$dummyhashfordemoteacher' -- In production, use proper bcrypt hash
) ON CONFLICT (id) DO NOTHING;

-- Create demo classroom with code O7DCUIK
INSERT INTO classrooms (id, teacher_id, name, description, grade, age_range, code, code_hash)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Test Classroom',
  'Demo classroom for testing teacher features',
  'Grade 9',
  '14-15',
  'O7DCUIK',
  'hashed_code_placeholder'
) ON CONFLICT (id) DO NOTHING;

-- Create 6 demo students
INSERT INTO users (id, email, full_name, role, verified, selected_path, daily_time_minutes, xp, level, has_completed_intro, uli, group_number, birthday, parent_consent)
VALUES
  ('00000000-0000-0000-0000-000000000100', 'student1@curare.test', 'Alice Johnson', 'student', true, 'Pre-Med', 30, 0, 1, true, 'STU001', 1, '2008-01-15', true),
  ('00000000-0000-0000-0000-000000000101', 'student2@curare.test', 'Bob Smith', 'student', true, 'Pre-Med', 30, 0, 1, true, 'STU002', 1, '2008-03-20', true),
  ('00000000-0000-0000-0000-000000000102', 'student3@curare.test', 'Charlie Brown', 'student', true, 'Pre-Med', 30, 0, 1, true, 'STU003', 1, '2008-05-10', true),
  ('00000000-0000-0000-0000-000000000103', 'student4@curare.test', 'Diana Prince', 'student', true, 'Med', 30, 0, 1, true, 'STU004', 1, '2007-11-30', true),
  ('00000000-0000-0000-0000-000000000104', 'student5@curare.test', 'Eve Wilson', 'student', true, 'Med', 30, 0, 1, true, 'STU005', 1, '2007-09-05', true),
  ('00000000-0000-0000-0000-000000000105', 'student6@curare.test', 'Frank Miller', 'student', true, 'Pre-Med', 30, 0, 1, true, 'STU006', 1, '2008-07-22', true)
ON CONFLICT (id) DO NOTHING;

-- Link students to classroom
INSERT INTO classroom_students (id, classroom_id, student_user_id, parent_email, status)
VALUES
  ('00000000-0000-0000-0000-000000001000', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000100', 'parent1@curare.test', 'active'),
  ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000101', 'parent2@curare.test', 'active'),
  ('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000102', 'parent3@curare.test', 'active'),
  ('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000103', 'parent4@curare.test', 'active'),
  ('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000104', 'parent5@curare.test', 'active'),
  ('00000000-0000-0000-0000-000000001005', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000105', 'parent6@curare.test', 'active')
ON CONFLICT (id) DO NOTHING;

-- Map 4 lessons to classroom (assuming lessons exist in lessons table)
-- Get first 4 lessons (2 Pre-Med, 2 Med)
DO $$
DECLARE
  lesson_ids UUID[];
  classroom_id UUID := '00000000-0000-0000-0000-000000000010';
BEGIN
  -- Get first 2 Pre-Med lessons
  SELECT ARRAY_AGG(id) INTO lesson_ids
  FROM lessons
  WHERE path_type = 'Pre-Med'
  ORDER BY order_index
  LIMIT 2;

  -- Get first 2 Med lessons
  SELECT ARRAY_AGG(id) INTO lesson_ids
  FROM (
    SELECT id FROM lessons WHERE path_type = 'Med' ORDER BY order_index LIMIT 2
  ) med_lessons;

  -- Insert classroom lesson mappings
  IF lesson_ids IS NOT NULL THEN
    FOR i IN 1..array_length(lesson_ids, 1) LOOP
      INSERT INTO classroom_lessons (classroom_id, lesson_id, locked, mandatory, seq_order)
      VALUES (classroom_id, lesson_ids[i], false, false, i)
      ON CONFLICT (classroom_id, lesson_id) DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Create 1 drafted assignment
INSERT INTO assignments (id, classroom_id, title, description, due_date, status, visibility)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000010',
  'Cell Biology Review',
  'Review assignment covering cell structure and function',
  NOW() + INTERVAL '7 days',
  'draft',
  'public'
) ON CONFLICT (id) DO NOTHING;

-- Create 1 published assignment with questions
INSERT INTO assignments (id, classroom_id, title, description, due_date, status, visibility)
VALUES (
  '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000010',
  'Introduction to Human Anatomy',
  'Test your knowledge of basic human anatomy',
  NOW() + INTERVAL '3 days',
  'published',
  'public'
) ON CONFLICT (id) DO NOTHING;

-- Add questions to published assignment
INSERT INTO questions (assignment_id, type, body, options, points, order_index, metadata)
VALUES
  (
    '00000000-0000-0000-0000-000000000021',
    'multiple_choice',
    'What is the largest organ in the human body?',
    '{"options": ["Heart", "Liver", "Skin", "Lungs"], "correct": [2]}'::jsonb,
    5,
    0,
    '{"hint": "Think about what covers your entire body", "adaptiveEnabled": false}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    'fill_in_blank',
    'The _____ pumps blood throughout the body.',
    '{"pattern": "heart|cardiac", "synonyms": ["heart", "cardiac muscle"]}'::jsonb,
    3,
    1,
    '{"hint": "It beats about 60-100 times per minute", "adaptiveEnabled": true}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    'fill_in_box',
    'Explain the function of the respiratory system in 2-3 sentences.',
    '{}'::jsonb,
    10,
    2,
    '{"hint": "Think about breathing and gas exchange", "adaptiveEnabled": false}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Create 3 submissions (1 graded, 2 ungraded)
INSERT INTO submissions (id, assignment_id, student_id, answers, score, graded, grader_id, graded_at, time_spent)
VALUES
  (
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000100',
    '[2, "heart", "The respiratory system allows us to breathe in oxygen and breathe out carbon dioxide."]'::jsonb,
    18,
    true,
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    600
  ),
  (
    '00000000-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000101',
    '[1, "lungs", "It helps us breathe."]'::jsonb,
    NULL,
    false,
    NULL,
    NULL,
    450
  ),
  (
    '00000000-0000-0000-0000-000000000032',
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000102',
    '[2, "heart", "The respiratory system is responsible for gas exchange in the body."]'::jsonb,
    NULL,
    false,
    NULL,
    NULL,
    520
  )
ON CONFLICT (id) DO NOTHING;

-- Create a demo post
INSERT INTO posts (id, classroom_id, teacher_id, content, pinned, visibility)
VALUES (
  '00000000-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Welcome to the Test Classroom! This is a pinned announcement. Please review the syllabus and complete your first assignment.',
  true,
  'class'
) ON CONFLICT (id) DO NOTHING;







