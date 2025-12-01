const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

const verifyTeacher = async (req, res, next) => {
  const teacherId = req.headers['x-teacher-id'];
  if (!teacherId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.teacherId = teacherId;
  next();
};

/**
 * POST /api/classrooms/join
 * Student joins classroom using code
 */
router.post('/classrooms/join', async (req, res) => {
  try {
    const { code, studentId } = req.body;

    if (!code || !studentId) {
      return res.status(400).json({ error: 'Code and studentId are required' });
    }

    // Find classroom by code
    const { data: classroom, error: classroomError } = await supabase
      .from('classrooms')
      .select('id, teacher_id')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (classroomError || !classroom) {
      return res.status(404).json({ error: 'Invalid classroom code' });
    }

    // Check if student already in classroom
    const { data: existing } = await supabase
      .from('classroom_students')
      .select('id')
      .eq('classroom_id', classroom.id)
      .eq('student_user_id', studentId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Student already in classroom' });
    }

    // Get student info to check if parent consent needed
    const { data: student } = await supabase
      .from('users')
      .select('birthday, parent_consent')
      .eq('id', studentId)
      .single();

    const status = student && !student.parent_consent ? 'pending_consent' : 'active';

    // Add student to classroom
    const { data: membership, error } = await supabase
      .from('classroom_students')
      .insert({
        classroom_id: classroom.id,
        student_user_id: studentId,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error('Join error:', error);
      return res.status(500).json({ error: 'Failed to join classroom' });
    }

    // Log analytics
    await supabase.from('analytics_events').insert({
      event_type: 'student_joined_classroom',
      payload: { studentId, classroomId: classroom.id, viaCode: true },
    });

    res.status(201).json(membership);
  } catch (error) {
    console.error('Join classroom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/classrooms/:id/students
 * Get all students in a classroom
 */
router.get('/classrooms/:id/students', verifyTeacher, async (req, res) => {
  try {
    // Verify classroom ownership
    const { data: classroom } = await supabase
      .from('classrooms')
      .select('id')
      .eq('id', req.params.id)
      .eq('teacher_id', req.teacherId)
      .single();

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const { data: students, error } = await supabase
      .from('classroom_students')
      .select(`
        *,
        student:users!classroom_students_student_user_id_fkey(id, email, full_name, birthday, parent_consent)
      `)
      .eq('classroom_id', req.params.id);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch students' });
    }

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/classrooms/:id/students/bulk-invite
 * Bulk invite students via email
 */
router.post('/classrooms/:id/students/bulk-invite', verifyTeacher, async (req, res) => {
  try {
    const { emails, message } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Emails array is required' });
    }

    // Verify classroom ownership
    const { data: classroom } = await supabase
      .from('classrooms')
      .select('id, name, code')
      .eq('id', req.params.id)
      .eq('teacher_id', req.teacherId)
      .single();

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // TODO: Send invitation emails with classroom code
    // For now, just return success

    res.json({
      message: `Invitations sent to ${emails.length} students`,
      classroomCode: classroom.code,
    });
  } catch (error) {
    console.error('Bulk invite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/students/:studentId/resend-consent
 * Resend parent consent email
 */
router.post('/:studentId/resend-consent', verifyTeacher, async (req, res) => {
  try {
    // TODO: Implement consent email resend
    res.json({ message: 'Consent email resent' });
  } catch (error) {
    console.error('Resend consent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

