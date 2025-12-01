const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { generateCode, hashCode } = require('../utils/codeGenerator');

// Middleware to verify teacher auth (simplified - implement JWT in production)
const verifyTeacher = async (req, res, next) => {
  // TODO: Implement JWT verification
  const teacherId = req.headers['x-teacher-id']; // Temporary - use JWT in production
  if (!teacherId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.teacherId = teacherId;
  next();
};

/**
 * POST /api/classrooms
 * Create a new classroom
 */
router.post('/', verifyTeacher, async (req, res) => {
  try {
    const { name, description, grade, ageRange } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Classroom name is required' });
    }

    // Generate unique 7-char code
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = generateCode();
      const { data: existing } = await supabase
        .from('classrooms')
        .select('id')
        .eq('code', code)
        .single();
      
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique code' });
    }

    const codeHash = hashCode(code);

    // Create classroom
    const { data: classroom, error } = await supabase
      .from('classrooms')
      .insert({
        teacher_id: req.teacherId,
        name,
        description,
        grade,
        age_range: ageRange,
        code,
        code_hash: codeHash,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating classroom:', error);
      return res.status(500).json({ error: 'Failed to create classroom' });
    }

    // Log analytics event
    await supabase.from('analytics_events').insert({
      event_type: 'teacher_create_classroom',
      payload: { teacherId: req.teacherId, classroomId: classroom.id },
    });

    res.status(201).json({
      ...classroom,
      code, // Return readable code to teacher
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/classrooms?teacherId=
 * Get all classrooms for a teacher
 */
router.get('/', verifyTeacher, async (req, res) => {
  try {
    const { data: classrooms, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', req.teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch classrooms' });
    }

    res.json(classrooms);
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/classrooms/:id
 * Get classroom details
 */
router.get('/:id', verifyTeacher, async (req, res) => {
  try {
    const { data: classroom, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', req.params.id)
      .eq('teacher_id', req.teacherId)
      .single();

    if (error || !classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    res.json(classroom);
  } catch (error) {
    console.error('Get classroom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/classrooms/:id/regenerate-code
 * Regenerate classroom join code
 */
router.post('/:id/regenerate-code', verifyTeacher, async (req, res) => {
  try {
    // Verify classroom ownership
    const { data: classroom, error: fetchError } = await supabase
      .from('classrooms')
      .select('id, code')
      .eq('id', req.params.id)
      .eq('teacher_id', req.teacherId)
      .single();

    if (fetchError || !classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Generate new code
    let newCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      newCode = generateCode();
      const { data: existing } = await supabase
        .from('classrooms')
        .select('id')
        .eq('code', newCode)
        .single();
      
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique code' });
    }

    const codeHash = hashCode(newCode);

    // Update classroom
    const { data: updated, error } = await supabase
      .from('classrooms')
      .update({
        code: newCode,
        code_hash: codeHash,
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to regenerate code' });
    }

    // Log analytics
    await supabase.from('analytics_events').insert({
      event_type: 'classroom_code_regenerated',
      payload: { classroomId: req.params.id, oldCode: classroom.code },
    });

    res.json(updated);
  } catch (error) {
    console.error('Regenerate code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/classrooms/:id
 * Delete classroom
 */
router.delete('/:id', verifyTeacher, async (req, res) => {
  try {
    const { error } = await supabase
      .from('classrooms')
      .delete()
      .eq('id', req.params.id)
      .eq('teacher_id', req.teacherId);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete classroom' });
    }

    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Delete classroom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

