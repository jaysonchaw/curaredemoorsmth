const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// Middleware to verify teacher auth
const verifyTeacher = async (req, res, next) => {
  const teacherId = req.headers['x-teacher-id'];
  if (!teacherId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.teacherId = teacherId;
  next();
};

// Helper to verify classroom ownership
const verifyClassroomOwnership = async (classroomId, teacherId) => {
  const { data, error } = await supabase
    .from('classrooms')
    .select('id')
    .eq('id', classroomId)
    .eq('teacher_id', teacherId)
    .single();
  
  return !error && data;
};

// Valid question types
const VALID_QUESTION_TYPES = ['multiple_choice', 'fill_in_blank', 'fill_in_box', 'open_text', 'sequence', 'timed_task'];

/**
 * POST /api/classrooms/:id/assignments
 * Create a new assignment
 */
router.post('/classrooms/:id', verifyTeacher, async (req, res) => {
  try {
    const { id: classroomId } = req.params;
    const { title, description, dueDate, visibilityStart, visibilityEnd, targetLessons, questions, attachments, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(classroomId, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate questions
    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        if (!VALID_QUESTION_TYPES.includes(q.type)) {
          return res.status(400).json({ error: `Invalid question type: ${q.type}` });
        }
        if (!q.body) {
          return res.status(400).json({ error: 'Question body is required' });
        }
      }
    }

    // Create assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .insert({
        classroom_id: classroomId,
        title,
        description,
        due_date: dueDate ? new Date(dueDate) : null,
        visibility_start: visibilityStart ? new Date(visibilityStart) : null,
        visibility_end: visibilityEnd ? new Date(visibilityEnd) : null,
        target_lessons: targetLessons || [],
        attachments: attachments || [],
        status: status || 'draft',
        visibility: 'public',
      })
      .select()
      .single();

    if (assignmentError) {
      console.error('Error creating assignment:', assignmentError);
      return res.status(500).json({ error: 'Failed to create assignment' });
    }

    // Create questions if provided
    if (questions && questions.length > 0) {
      const questionsToInsert = questions.map((q, index) => ({
        assignment_id: assignment.id,
        type: q.type,
        body: q.body,
        options: q.options || {},
        points: q.points || 1,
        metadata: q.metadata || {},
        order_index: q.order_index ?? index,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) {
        console.error('Error creating questions:', questionsError);
        // Rollback assignment
        await supabase.from('assignments').delete().eq('id', assignment.id);
        return res.status(500).json({ error: 'Failed to create questions' });
      }
    }

    // Log analytics
    await supabase.from('analytics_events').insert({
      event_type: 'assignment_created',
      classroom_id: classroomId,
      payload: { assignmentId: assignment.id, teacherId: req.teacherId },
    });

    // Fetch assignment with questions
    const { data: assignmentWithQuestions } = await supabase
      .from('assignments')
      .select(`
        *,
        questions (*)
      `)
      .eq('id', assignment.id)
      .single();

    res.status(201).json(assignmentWithQuestions);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/classrooms/:id/assignments
 * List all assignments for a classroom
 */
router.get('/classrooms/:id', verifyTeacher, async (req, res) => {
  try {
    const { id: classroomId } = req.params;

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(classroomId, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(`
        *,
        questions (id, type, body, points, order_index),
        submissions (id)
      `)
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch assignments' });
    }

    // Calculate submission counts and total points
    const assignmentsWithStats = assignments.map(assignment => {
      const submissionCount = assignment.submissions?.length || 0;
      const totalPoints = assignment.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;
      
      return {
        ...assignment,
        submission_count: submissionCount,
        total_points: totalPoints,
        questions: assignment.questions?.sort((a, b) => a.order_index - b.order_index) || [],
        submissions: undefined, // Remove from response
      };
    });

    res.json(assignmentsWithStats);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/assignments/:assignmentId
 * Get assignment details with questions
 */
router.get('/:assignmentId', verifyTeacher, async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Get assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(assignment.classroom_id, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('order_index', { ascending: true });

    if (questionsError) {
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    res.json({
      ...assignment,
      questions: questions || [],
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/assignments/:assignmentId
 * Update assignment
 */
router.patch('/:assignmentId', verifyTeacher, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updates = req.body;

    // Get assignment to verify ownership
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('classroom_id')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(assignment.classroom_id, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build update object
    const assignmentUpdates = {};
    if (updates.title !== undefined) assignmentUpdates.title = updates.title;
    if (updates.description !== undefined) assignmentUpdates.description = updates.description;
    if (updates.dueDate !== undefined) assignmentUpdates.due_date = updates.dueDate ? new Date(updates.dueDate) : null;
    if (updates.visibilityStart !== undefined) assignmentUpdates.visibility_start = updates.visibilityStart ? new Date(updates.visibilityStart) : null;
    if (updates.visibilityEnd !== undefined) assignmentUpdates.visibility_end = updates.visibilityEnd ? new Date(updates.visibilityEnd) : null;
    if (updates.targetLessons !== undefined) assignmentUpdates.target_lessons = updates.targetLessons;
    if (updates.attachments !== undefined) assignmentUpdates.attachments = updates.attachments;
    if (updates.status !== undefined) assignmentUpdates.status = updates.status;

    // Update assignment
    const { data: updated, error: updateError } = await supabase
      .from('assignments')
      .update(assignmentUpdates)
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update assignment' });
    }

    // Update questions if provided
    if (updates.questions && Array.isArray(updates.questions)) {
      // Delete existing questions
      await supabase.from('questions').delete().eq('assignment_id', assignmentId);

      // Insert new questions
      const questionsToInsert = updates.questions.map((q, index) => ({
        assignment_id: assignmentId,
        type: q.type,
        body: q.body,
        options: q.options || {},
        points: q.points || 1,
        metadata: q.metadata || {},
        order_index: q.order_index ?? index,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) {
        console.error('Error updating questions:', questionsError);
        return res.status(500).json({ error: 'Failed to update questions' });
      }
    }

    // Fetch updated assignment with questions
    const { data: assignmentWithQuestions } = await supabase
      .from('assignments')
      .select(`
        *,
        questions (*)
      `)
      .eq('id', assignmentId)
      .single();

    res.json(assignmentWithQuestions);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/assignments/:assignmentId/publish
 * Publish assignment (set status to published and trigger notifications)
 */
router.post('/:assignmentId/publish', verifyTeacher, async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Get assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('classroom_id, title')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(assignment.classroom_id, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update status to published
    const { data: updated, error: updateError } = await supabase
      .from('assignments')
      .update({ status: 'published' })
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to publish assignment' });
    }

    // Get all students in classroom
    const { data: students } = await supabase
      .from('classroom_students')
      .select('student_user_id')
      .eq('classroom_id', assignment.classroom_id)
      .eq('status', 'active');

    // Create notifications for students
    if (students && students.length > 0) {
      const notifications = students.map(s => ({
        user_id: s.student_user_id,
        type: 'assignment_published',
        title: 'New Assignment',
        message: `A new assignment "${assignment.title}" has been published.`,
        link: `/assignments/${assignmentId}`,
      }));

      await supabase.from('notifications').insert(notifications);
    }

    // Log analytics
    await supabase.from('analytics_events').insert({
      event_type: 'assignment_published',
      classroom_id: assignment.classroom_id,
      payload: { assignmentId, teacherId: req.teacherId },
    });

    res.json(updated);
  } catch (error) {
    console.error('Publish assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/assignments/:assignmentId
 * Delete assignment
 */
router.delete('/:assignmentId', verifyTeacher, async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Get assignment to verify ownership
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('classroom_id')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(assignment.classroom_id, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete assignment (cascade will delete questions and submissions)
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete assignment' });
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
