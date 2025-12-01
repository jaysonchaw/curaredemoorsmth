-- Complete Setup Script for Groups, ULIs, and Post-Test Questions
-- Run this in Supabase SQL Editor to set up everything

-- First, ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Groups table (using group_code, activated schema)
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  group_number INTEGER UNIQUE NOT NULL CHECK (group_number >= 1 AND group_number <= 20),
  group_code VARCHAR(50) UNIQUE NOT NULL,
  activated BOOLEAN DEFAULT false,
  activated_at TIMESTAMP,
  activated_by VARCHAR(255),
  post_test_released BOOLEAN DEFAULT false,
  post_test_released_at TIMESTAMP,
  countdown_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_number ON groups(group_number);
CREATE INDEX IF NOT EXISTS idx_groups_activated ON groups(activated);
CREATE INDEX IF NOT EXISTS idx_groups_code ON groups(group_code);

-- ULIs table (using uli_value schema)
CREATE TABLE IF NOT EXISTS ulis (
  id SERIAL PRIMARY KEY,
  uli_value VARCHAR(50) UNIQUE NOT NULL,
  group_number INTEGER NOT NULL REFERENCES groups(group_number) ON DELETE CASCADE,
  activated BOOLEAN DEFAULT false,
  activated_at TIMESTAMP,
  activated_by VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ulis_value ON ulis(uli_value);
CREATE INDEX IF NOT EXISTS idx_ulis_group ON ulis(group_number);
CREATE INDEX IF NOT EXISTS idx_ulis_activated ON ulis(activated);
CREATE INDEX IF NOT EXISTS idx_ulis_user ON ulis(user_id);

-- Post-test questions table
CREATE TABLE IF NOT EXISTS post_test_questions (
  id SERIAL PRIMARY KEY,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_in_blank', 'text_answer')),
  correct_answer TEXT NOT NULL,
  options JSONB,
  rubric JSONB,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_test_question_number ON post_test_questions(question_number);

-- Post-test quizzes table
CREATE TABLE IF NOT EXISTS post_test_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_number INTEGER REFERENCES groups(group_number),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  score INTEGER,
  percentage DECIMAL(5,2),
  answers JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_test_user ON post_test_quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_test_group ON post_test_quizzes(group_number);
CREATE INDEX IF NOT EXISTS idx_post_test_completed ON post_test_quizzes(completed_at);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ulis_updated_at ON ulis;
CREATE TRIGGER update_ulis_updated_at BEFORE UPDATE ON ulis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Now seed the data (only if tables are empty)
-- Insert groups 1-20 with their codes
INSERT INTO groups (group_number, group_code) VALUES
(1, 'SIw}M5d7'),
(2, '<3&37Lv&'),
(3, 'q%0J]0f]'),
(4, 's>2YWc!a'),
(5, 'Nw!+P8*I'),
(6, 'o>rH2,ay'),
(7, '98A$s*Tc'),
(8, 'Hl27i!&A'),
(9, 'GefZE8/V'),
(10, 't}?c8M?X'),
(11, '5m},O.Dd'),
(12, 'R.7bM!CT'),
(13, 'T&6IPf8b'),
(14, '8usY/-gT'),
(15, 'W)4<yLT#'),
(16, '7+wB%6Q71'),
(17, 'U1>R$u2G'),
(18, 'rR1((^DH'),
(19, '88b>FW16'),
(20, '#Unh9@SI')
ON CONFLICT (group_number) DO NOTHING;

-- Insert ULIs (this will be done via the API endpoint for better error handling)
-- The seed_ulis endpoint handles this programmatically





