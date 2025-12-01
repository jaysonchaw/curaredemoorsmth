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
 * GET /api/lessons
 * Get all global roadmap lessons
 */
router.get('/', async (req, res) => {
  try {
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('id, title, path_type, order_index, duration_minutes')
      .order('path_type', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching lessons:', error);
      return res.status(500).json({ error: 'Failed to fetch lessons' });
    }

    res.json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/classrooms/:id/lessons
 * Get classroom-mapped lessons with lock/mandatory status
 */
router.get('/classrooms/:id', verifyTeacher, async (req, res) => {
  try {
    const { id: classroomId } = req.params;

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(classroomId, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all global lessons
    const { data: allLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title, path_type, order_index, duration_minutes')
      .order('path_type', { ascending: true })
      .order('order_index', { ascending: true });

    if (lessonsError) {
      return res.status(500).json({ error: 'Failed to fetch lessons' });
    }

    // Get classroom lesson mappings
    const { data: classroomLessons, error: mappingError } = await supabase
      .from('classroom_lessons')
      .select('*')
      .eq('classroom_id', classroomId);

    if (mappingError) {
      return res.status(500).json({ error: 'Failed to fetch classroom lessons' });
    }

    // Create a map of lesson_id -> classroom_lesson data
    const mappingMap = {};
    classroomLessons.forEach(cl => {
      mappingMap[cl.lesson_id] = cl;
    });

    // Merge global lessons with classroom mappings
    const result = allLessons.map(lesson => {
      const mapping = mappingMap[lesson.id];
      return {
        ...lesson,
        classroom_lesson_id: mapping?.id || null,
        locked: mapping?.locked ?? false,
        mandatory: mapping?.mandatory ?? false,
        seq_order: mapping?.seq_order || null,
        is_mapped: !!mapping,
      };
    });

    // Sort by seq_order if mapped, otherwise by global order
    result.sort((a, b) => {
      if (a.seq_order !== null && b.seq_order !== null) {
        return a.seq_order - b.seq_order;
      }
      if (a.seq_order !== null) return -1;
      if (b.seq_order !== null) return 1;
      return a.order_index - b.order_index;
    });

    res.json(result);
  } catch (error) {
    console.error('Get classroom lessons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/classrooms/:id/lessons
 * Map a lesson to classroom with sequence order, lock, and mandatory status
 */
router.post('/classrooms/:id', verifyTeacher, async (req, res) => {
  try {
    const { id: classroomId } = req.params;
    const { lessonId, seqOrder, mandatory, locked } = req.body;

    if (!lessonId) {
      return res.status(400).json({ error: 'lessonId is required' });
    }

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(classroomId, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify lesson exists
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check if mapping already exists
    const { data: existing, error: existingError } = await supabase
      .from('classroom_lessons')
      .select('id')
      .eq('classroom_id', classroomId)
      .eq('lesson_id', lessonId)
      .single();

    let result;
    if (existing) {
      // Update existing mapping
      const { data, error } = await supabase
        .from('classroom_lessons')
        .update({
          seq_order: seqOrder ?? existing.seq_order,
          mandatory: mandatory ?? existing.mandatory,
          locked: locked ?? existing.locked,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update lesson mapping' });
      }
      result = data;
    } else {
      // Create new mapping
      const { data, error } = await supabase
        .from('classroom_lessons')
        .insert({
          classroom_id: classroomId,
          lesson_id: lessonId,
          seq_order: seqOrder,
          mandatory: mandatory ?? false,
          locked: locked ?? false,
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to create lesson mapping' });
      }
      result = data;
    }

    // Log analytics
    await supabase.from('analytics_events').insert({
      event_type: locked ? 'lesson_locked' : 'lesson_unlocked',
      classroom_id: classroomId,
      payload: { lessonId, teacherId: req.teacherId },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Create classroom lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/classrooms/:id/lessons/:classroomLessonId
 * Update lesson mapping (lock, mandatory, seq_order)
 */
router.patch('/classrooms/:id/lessons/:classroomLessonId', verifyTeacher, async (req, res) => {
  try {
    const { id: classroomId, classroomLessonId } = req.params;
    const { locked, mandatory, seqOrder } = req.body;

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(classroomId, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify mapping exists and belongs to this classroom
    const { data: mapping, error: mappingError } = await supabase
      .from('classroom_lessons')
      .select('*')
      .eq('id', classroomLessonId)
      .eq('classroom_id', classroomId)
      .single();

    if (mappingError || !mapping) {
      return res.status(404).json({ error: 'Classroom lesson mapping not found' });
    }

    // Build update object
    const updates = {};
    if (locked !== undefined) updates.locked = locked;
    if (mandatory !== undefined) updates.mandatory = mandatory;
    if (seqOrder !== undefined) updates.seq_order = seqOrder;

    const { data, error } = await supabase
      .from('classroom_lessons')
      .update(updates)
      .eq('id', classroomLessonId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update lesson mapping' });
    }

    // Log analytics if lock status changed
    if (locked !== undefined && locked !== mapping.locked) {
      await supabase.from('analytics_events').insert({
        event_type: locked ? 'lesson_locked' : 'lesson_unlocked',
        classroom_id: classroomId,
        payload: { lessonId: mapping.lesson_id, teacherId: req.teacherId },
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Update classroom lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/classrooms/:id/lessons/:classroomLessonId
 * Remove lesson from classroom mapping
 */
router.delete('/classrooms/:id/lessons/:classroomLessonId', verifyTeacher, async (req, res) => {
  try {
    const { id: classroomId, classroomLessonId } = req.params;

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(classroomId, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify mapping exists and belongs to this classroom
    const { error: verifyError } = await supabase
      .from('classroom_lessons')
      .select('id')
      .eq('id', classroomLessonId)
      .eq('classroom_id', classroomId)
      .single();

    if (verifyError) {
      return res.status(404).json({ error: 'Classroom lesson mapping not found' });
    }

    const { error } = await supabase
      .from('classroom_lessons')
      .delete()
      .eq('id', classroomLessonId);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete lesson mapping' });
    }

    res.json({ message: 'Lesson mapping removed successfully' });
  } catch (error) {
    console.error('Delete classroom lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
