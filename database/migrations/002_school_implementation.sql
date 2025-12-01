-- Migration: School Implementation and Partnership Schema
-- Run after teacher_schema.sql and 001_extend_schema.sql

-- School Partners table
CREATE TABLE IF NOT EXISTS school_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('homeschool', 'private', 'international', 'public')),
  contact_name VARCHAR(255) NOT NULL,
  contact_role VARCHAR(100),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  city VARCHAR(100),
  expected_students INTEGER,
  preferred_start_weeks TEXT[], -- Array of week preferences
  pilot_type VARCHAR(50) CHECK (pilot_type IN ('free', 'paid', 'sponsored')),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'pilot_running', 'pilot_complete', 'implemented', 'rejected')),
  school_key_hash VARCHAR(255), -- Hashed school key
  raw_school_key_admin_view VARCHAR(10), -- Raw key visible only in admin (SCH-XXXXXX format)
  partner_id VARCHAR(50) UNIQUE, -- Internal partner ID
  assigned_staff_id UUID REFERENCES users(id), -- Curare staff assigned
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_school_partners_status ON school_partners(status);
CREATE INDEX idx_school_partners_school_key ON school_partners(school_key_hash);

-- Teacher Invites table
CREATE TABLE IF NOT EXISTS teacher_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES school_partners(id) ON DELETE CASCADE,
  invite_code VARCHAR(10) UNIQUE NOT NULL, -- Format: SCH-XXXXXX
  invite_code_hash VARCHAR(255) NOT NULL,
  invited_email VARCHAR(255),
  expires_at TIMESTAMP,
  created_by UUID REFERENCES users(id), -- Curare admin or school admin
  used_at TIMESTAMP,
  used_by UUID REFERENCES users(id), -- Teacher who used the invite
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teacher_invites_school ON teacher_invites(school_id);
CREATE INDEX idx_teacher_invites_code ON teacher_invites(invite_code);
CREATE INDEX idx_teacher_invites_email ON teacher_invites(invited_email);

-- School Admins table (teachers with school admin privileges)
CREATE TABLE IF NOT EXISTS school_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES school_partners(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'coordinator')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(school_id, teacher_id)
);

CREATE INDEX idx_school_admins_school ON school_admins(school_id);
CREATE INDEX idx_school_admins_teacher ON school_admins(teacher_id);

-- Link teachers to schools
ALTER TABLE users ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES school_partners(id) ON DELETE SET NULL;
CREATE INDEX idx_users_school ON users(school_id);

-- Pilots table
CREATE TABLE IF NOT EXISTS pilots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES school_partners(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  type VARCHAR(50) CHECK (type IN ('free', 'paid', 'sponsored')),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'running', 'completed', 'cancelled')),
  metrics_json JSONB, -- Store pilot metrics
  report_generated_at TIMESTAMP,
  report_pdf_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pilots_school ON pilots(school_id);
CREATE INDEX idx_pilots_classroom ON pilots(classroom_id);
CREATE INDEX idx_pilots_status ON pilots(status);

-- Pilot Tasks table
CREATE TABLE IF NOT EXISTS pilot_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  task_type VARCHAR(100) NOT NULL, -- 'onboarding_email', 'module_0_assigned', 'check_in_1', 'check_in_2', 'pre_post_quiz', 'final_report'
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pilot_tasks_pilot ON pilot_tasks(pilot_id);
CREATE INDEX idx_pilot_tasks_due_date ON pilot_tasks(due_date);

-- Pilot Agreements table (formerly MOAs)
CREATE TABLE IF NOT EXISTS moas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES school_partners(id) ON DELETE CASCADE,
  moa_pdf_path VARCHAR(500), -- Stores Pilot Agreement PDF path
  signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMP,
  signed_by VARCHAR(255), -- Signer name
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_moas_school ON moas(school_id);

-- Add trigger for updated_at
CREATE TRIGGER update_school_partners_updated_at BEFORE UPDATE ON school_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pilots_updated_at BEFORE UPDATE ON pilots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Analytics events for school operations
-- (uses existing analytics_events table, just track new event types)

