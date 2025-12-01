const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// Middleware to verify auth (works for both teachers and students)
const verifyAuth = async (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.headers['x-teacher-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = userId;
  next();
};

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get('/', verifyAuth, async (req, res) => {
  try {
    const { read, limit = 50 } = req.query;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (read === 'true') {
      query = query.eq('read', true);
    } else if (read === 'false') {
      query = query.eq('read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }

    res.json(notifications || []);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/notifications/mark-read
 * Mark notifications as read
 */
router.post('/mark-read', verifyAuth, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'notificationIds array is required' });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', req.userId)
      .in('id', notificationIds);

    if (error) {
      return res.status(500).json({ error: 'Failed to mark notifications as read' });
    }

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;







