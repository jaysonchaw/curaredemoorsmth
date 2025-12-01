-- Migration: Extend schema for Lessons, Assignments, Posts features
-- Run this after teacher_schema.sql

-- Add missing columns to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS visibility_start TIMESTAMP;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS visibility_end TIMESTAMP;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb; -- Array of {filename, url, size, type}
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS target_lessons UUID[] DEFAULT '{}'; -- Array of lesson IDs

-- Add missing columns to submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS teacher_comments TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS device_metadata JSONB; -- {browser, os, ip_hash}

-- Create comments table for posts
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_user ON post_comments(user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'assignment_published', 'submission_created', 'lesson_locked', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(500), -- URL to related resource
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Add trigger for post_comments updated_at
CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add post attachments column
ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'class' CHECK (visibility IN ('class', 'teachers_only'));

