-- Migration: Admin Groups and ULIs Management
-- Creates tables for managing group codes, ULIs, and post-test countdowns

-- Groups table (1-20)
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  group_number INTEGER UNIQUE NOT NULL CHECK (group_number >= 1 AND group_number <= 20),
  group_key VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  activated_at TIMESTAMP,
  activated_by UUID REFERENCES users(id),
  post_test_release_date TIMESTAMP, -- Calculated as activated_at + 27 days
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_groups_number ON groups(group_number);
CREATE INDEX idx_groups_key ON groups(group_key);
CREATE INDEX idx_groups_active ON groups(is_active);

-- ULIs table (600 total, 30 per group)
CREATE TABLE IF NOT EXISTS ulis (
  id SERIAL PRIMARY KEY,
  uli_code VARCHAR(50) UNIQUE NOT NULL,
  group_number INTEGER NOT NULL REFERENCES groups(group_number),
  is_active BOOLEAN DEFAULT false,
  activated_at TIMESTAMP,
  activated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ulis_code ON ulis(uli_code);
CREATE INDEX idx_ulis_group ON ulis(group_number);
CREATE INDEX idx_ulis_active ON ulis(is_active);

-- Post-test questions table
CREATE TABLE IF NOT EXISTS post_test_questions (
  id SERIAL PRIMARY KEY,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_in_blank', 'text_answer')),
  correct_answer TEXT NOT NULL,
  options JSONB, -- For multiple choice: {A: "...", B: "...", C: "...", D: "..."}
  rubric JSONB, -- For text answers: {good: "...", borderline_acceptable: "...", borderline_unacceptable: "...", wrong: "..."}
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_post_test_question_number ON post_test_questions(question_number);

-- Post-test submissions table
CREATE TABLE IF NOT EXISTS post_test_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  uli_code VARCHAR(50) REFERENCES ulis(uli_code),
  group_number INTEGER REFERENCES groups(group_number),
  answers JSONB NOT NULL, -- {question_id: answer}
  score INTEGER,
  total_points INTEGER,
  percentage DECIMAL(5,2),
  submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_post_test_submissions_user ON post_test_submissions(user_id);
CREATE INDEX idx_post_test_submissions_uli ON post_test_submissions(uli_code);
CREATE INDEX idx_post_test_submissions_group ON post_test_submissions(group_number);

-- Add trigger for updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ulis_updated_at BEFORE UPDATE ON ulis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


