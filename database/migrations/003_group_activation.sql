-- Migration: Group and ULI Activation System
-- Run after existing migrations

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  group_number INTEGER UNIQUE NOT NULL CHECK (group_number >= 1 AND group_number <= 20),
  group_code VARCHAR(50) UNIQUE NOT NULL,
  activated BOOLEAN DEFAULT false,
  activated_at TIMESTAMP,
  activated_by VARCHAR(255), -- Admin who activated
  post_test_released BOOLEAN DEFAULT false,
  post_test_released_at TIMESTAMP,
  countdown_end_date TIMESTAMP, -- When countdown ends (activation_date + 27 days)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_groups_number ON groups(group_number);
CREATE INDEX idx_groups_activated ON groups(activated);

-- ULIs table
CREATE TABLE IF NOT EXISTS ulis (
  id SERIAL PRIMARY KEY,
  uli_value VARCHAR(50) UNIQUE NOT NULL,
  group_number INTEGER NOT NULL REFERENCES groups(group_number) ON DELETE CASCADE,
  activated BOOLEAN DEFAULT false,
  activated_at TIMESTAMP,
  activated_by VARCHAR(255), -- Admin who activated
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to user if they've signed up
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ulis_value ON ulis(uli_value);
CREATE INDEX idx_ulis_group ON ulis(group_number);
CREATE INDEX idx_ulis_activated ON ulis(activated);
CREATE INDEX idx_ulis_user ON ulis(user_id);

-- Post-test quiz table
CREATE TABLE IF NOT EXISTS post_test_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_number INTEGER REFERENCES groups(group_number),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  score INTEGER, -- Total score out of 22
  percentage DECIMAL(5,2), -- Percentage score
  answers JSONB, -- Store all answers
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_post_test_user ON post_test_quizzes(user_id);
CREATE INDEX idx_post_test_group ON post_test_quizzes(group_number);
CREATE INDEX idx_post_test_completed ON post_test_quizzes(completed_at);

-- Add trigger for updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ulis_updated_at BEFORE UPDATE ON ulis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

