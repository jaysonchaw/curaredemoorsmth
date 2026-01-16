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
 * POST /api/classrooms/:id/posts
 * Create a new post
 */
router.post('/classrooms/:id', verifyTeacher, async (req, res) => {
  try {
    const { id: classroomId } = req.params;
    const { content, pinned, visibility, attachments } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(classroomId, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If pinning, unpin other posts first
    if (pinned) {
      await supabase
        .from('posts')
        .update({ pinned: false })
        .eq('classroom_id', classroomId);
    }

    // Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        classroom_id: classroomId,
        teacher_id: req.teacherId,
        content,
        pinned: pinned || false,
        visibility: visibility || 'class',
        attachments: attachments || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ error: 'Failed to create post' });
    }

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/classrooms/:id/posts
 * Get all posts for a classroom (pinned first)
 */
router.get('/classrooms/:id', verifyTeacher, async (req, res) => {
  try {
    const { id: classroomId } = req.params;
    const { search } = req.query;

    // Verify ownership
    const ownsClassroom = await verifyClassroomOwnership(classroomId, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build query
    let query = supabase
      .from('posts')
      .select(`
        *,
        teacher:users!posts_teacher_id_fkey(id, full_name, email)
      `)
      .eq('classroom_id', classroomId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    const { data: posts, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    // Filter by search term (client-side for simplicity)
    let filtered = posts || [];
    if (search) {
      filtered = filtered.filter(p => 
        p.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Get comments for each post
    const postsWithComments = await Promise.all(
      filtered.map(async (post) => {
        const { data: comments } = await supabase
          .from('post_comments')
          .select(`
            *,
            user:users!post_comments_user_id_fkey(id, full_name, email)
          `)
          .eq('post_id', post.id)
          .eq('hidden', false)
          .order('created_at', { ascending: true });

        return {
          ...post,
          comments: comments || [],
        };
      })
    );

    res.json(postsWithComments);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/posts/:postId
 * Update post (edit, pin/unpin)
 */
router.patch('/:postId', verifyTeacher, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, pinned, visibility, attachments } = req.body;

    // Get post to verify ownership
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('classroom_id, teacher_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify ownership
    if (post.teacher_id !== req.teacherId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If pinning, unpin other posts first
    if (pinned && !post.pinned) {
      await supabase
        .from('posts')
        .update({ pinned: false })
        .eq('classroom_id', post.classroom_id);
    }

    // Build update object
    const updates = {};
    if (content !== undefined) updates.content = content;
    if (pinned !== undefined) updates.pinned = pinned;
    if (visibility !== undefined) updates.visibility = visibility;
    if (attachments !== undefined) updates.attachments = attachments;

    const { data: updated, error: updateError } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update post' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/posts/:postId
 * Delete post
 */
router.delete('/:postId', verifyTeacher, async (req, res) => {
  try {
    const { postId } = req.params;

    // Get post to verify ownership
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('teacher_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify ownership
    if (post.teacher_id !== req.teacherId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete post (cascade will delete comments)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete post' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/posts/:postId/comments
 * Add comment to post
 */
router.post('/:postId/comments', verifyTeacher, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, userId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Verify post exists and user has access
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('classroom_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify user is teacher or student in classroom
    const ownsClassroom = await verifyClassroomOwnership(post.classroom_id, req.teacherId);
    const { data: studentInClassroom } = await supabase
      .from('classroom_students')
      .select('id')
      .eq('classroom_id', post.classroom_id)
      .eq('student_user_id', userId || req.teacherId)
      .single();

    if (!ownsClassroom && !studentInClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId || req.teacherId,
        content,
      })
      .select(`
        *,
        user:users!post_comments_user_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: 'Failed to create comment' });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/posts/:postId/comments/:commentId
 * Delete comment (moderator action)
 */
router.delete('/:postId/comments/:commentId', verifyTeacher, async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    // Get post to verify classroom ownership
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('classroom_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify teacher owns classroom
    const ownsClassroom = await verifyClassroomOwnership(post.classroom_id, req.teacherId);
    if (!ownsClassroom) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Hide comment instead of deleting (soft delete)
    const { data: updated, error: updateError } = await supabase
      .from('post_comments')
      .update({ hidden: true })
      .eq('id', commentId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to delete comment' });
    }

    res.json({ message: 'Comment deleted successfully', comment: updated });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

























