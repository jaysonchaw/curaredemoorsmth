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

/**
 * POST /api/assignments/:assignmentId/submit
 * Student submits assignment
 */
router.post('/assignments/:assignmentId/submit', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, answers, timeSpent, deviceMetadata } = req.body;

    if (!studentId || !answers) {
      return res.status(400).json({ error: 'Student ID and answers are required' });
    }

    // Verify assignment exists
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('id, status')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.status !== 'published') {
      return res.status(400).json({ error: 'Assignment is not published' });
    }

    // Check if already submitted
    const { data: existing } = await supabase
      .from('submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Assignment already submitted' });
    }

    // Create submission
    const { data: submission, error } = await supabase
      .from('submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: studentId,
        answers,
        time_spent: timeSpent,
        device_metadata: deviceMetadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating submission:', error);
      return res.status(500).json({ error: 'Failed to submit assignment' });
    }

    // Get assignment's classroom to notify teacher
    const { data: assignmentWithClassroom } = await supabase
      .from('assignments')
      .select('classroom_id, title')
      .eq('id', assignmentId)
      .single();

    if (assignmentWithClassroom) {
      const { data: classroom } = await supabase
        .from('classrooms')
        .select('teacher_id')
        .eq('id', assignmentWithClassroom.classroom_id)
        .single();

      if (classroom) {
        // Create notification for teacher
        await supabase.from('notifications').insert({
          user_id: classroom.teacher_id,
          type: 'submission_created',
          title: 'New Submission',
          message: `A student submitted "${assignmentWithClassroom.title}"`,
          link: `/assignments/${assignmentId}/submissions`,
        });
      }
    }

    // Log analytics
    await supabase.from('analytics_events').insert({
      event_type: 'assignment_submitted',
      payload: { submissionId: submission.id, assignmentId, studentId, timeSpent },
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/assignments/:assignmentId/submissions
 * Get all submissions for an assignment (with filters)
 */
router.get('/assignments/:assignmentId/submissions', verifyTeacher, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentName, status, graded } = req.query;

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

    // Build query
    let query = supabase
      .from('submissions')
      .select(`
        *,
        student:users!submissions_student_id_fkey(id, full_name, email)
      `)
      .eq('assignment_id', assignmentId);

    // Apply filters
    if (graded === 'true') {
      query = query.eq('graded', true);
    } else if (graded === 'false') {
      query = query.eq('graded', false);
    }

    const { data: submissions, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch submissions' });
    }

    // Filter by student name (client-side for simplicity)
    let filtered = submissions || [];
    if (studentName) {
      filtered = filtered.filter(s => 
        s.student?.full_name?.toLowerCase().includes(studentName.toLowerCase())
      );
    }

    res.json(filtered);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/submissions/:submissionId
 * Get submission details
 */
router.get('/:submissionId', verifyTeacher, async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Get submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        student:users!submissions_student_id_fkey(id, full_name, email),
        assignment:assignments!submissions_assignment_id_fkey(
          id,
          title,
          classroom_id,
          questions (*)
        )
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(submission.assignment.classroom_id, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/submissions/:submissionId/grade
 * Grade a submission
 */
router.post('/:submissionId/grade', verifyTeacher, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, teacherComments } = req.body;

    // Get submission to verify access
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        assignment:assignments!submissions_assignment_id_fkey(
          id,
          classroom_id
        )
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(submission.assignment.classroom_id, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update submission
    const { data: updated, error: updateError } = await supabase
      .from('submissions')
      .update({
        score: score !== undefined ? parseFloat(score) : null,
        graded: true,
        grader_id: req.teacherId,
        graded_at: new Date().toISOString(),
        teacher_comments: teacherComments || null,
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to grade submission' });
    }

    // Create notification for student
    await supabase.from('notifications').insert({
      user_id: submission.student_id,
      type: 'grade_submitted',
      title: 'Assignment Graded',
      message: `Your submission has been graded.`,
      link: `/assignments/${submission.assignment_id}`,
    });

    // Log analytics
    await supabase.from('analytics_events').insert({
      event_type: 'grade_submitted',
      payload: { submissionId, graderId: req.teacherId, score },
    });

    res.json(updated);
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/assignments/:assignmentId/autograde
 * Autograde all MCQ submissions for an assignment
 */
router.post('/assignments/:assignmentId/autograde', verifyTeacher, async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Get assignment and verify ownership
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('classroom_id, questions (*)')
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

    // Get all ungraded submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('graded', false);

    if (submissionsError) {
      return res.status(500).json({ error: 'Failed to fetch submissions' });
    }

    // Get MCQ questions
    const mcqQuestions = assignment.questions.filter(q => q.type === 'multiple_choice');

    // Autograde each submission
    const gradedSubmissions = [];
    for (const submission of submissions || []) {
      let totalScore = 0;
      let maxScore = 0;

      const answers = submission.answers || [];
      
      // Grade each MCQ question
      mcqQuestions.forEach((question, index) => {
        maxScore += question.points || 1;
        const studentAnswer = answers[index];
        const correctAnswers = question.options?.correct || [];
        
        // Check if answer is correct (handle both single and multiple correct answers)
        if (Array.isArray(correctAnswers)) {
          const isCorrect = Array.isArray(studentAnswer) 
            ? JSON.stringify(studentAnswer.sort()) === JSON.stringify(correctAnswers.sort())
            : correctAnswers.includes(studentAnswer);
          
          if (isCorrect) {
            totalScore += question.points || 1;
          }
        } else if (studentAnswer === correctAnswers) {
          totalScore += question.points || 1;
        }
      });

      // Update submission
      const { data: updated, error: updateError } = await supabase
        .from('submissions')
        .update({
          score: totalScore,
          graded: true,
          grader_id: req.teacherId,
          graded_at: new Date().toISOString(),
        })
        .eq('id', submission.id)
        .select()
        .single();

      if (!updateError && updated) {
        gradedSubmissions.push(updated);
      }
    }

    res.json({
      message: `Autograded ${gradedSubmissions.length} submissions`,
      graded: gradedSubmissions.length,
      total: submissions?.length || 0,
    });
  } catch (error) {
    console.error('Autograde error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

























