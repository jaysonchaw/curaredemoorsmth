const express = require('express');
const cors = require('cors');
const teachersRouter = require('./routes/teachers');
const classroomsRouter = require('./routes/classrooms');
const assignmentsRouter = require('./routes/assignments');
const studentsRouter = require('./routes/students');
const lessonsRouter = require('./routes/lessons');
const submissionsRouter = require('./routes/submissions');
const postsRouter = require('./routes/posts');
const notificationsRouter = require('./routes/notifications');
const partnersRouter = require('./routes/partners');
const schoolsRouter = require('./routes/schools');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/teachers', teachersRouter);
app.use('/api/classrooms', classroomsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/partners', partnersRouter);
app.use('/api/schools', schoolsRouter);
app.use('/api/admin', require('./routes/admin'));

// Public endpoint to validate access codes
const { supabase } = require('./lib/supabase');
app.get('/api/validate-access', async (req, res) => {
  try {
    const { accessCode, uli } = req.query;

    if (!accessCode || !uli) {
      return res.status(400).json({ error: 'Access code and ULI are required' });
    }

    // Find group by access code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('group_code', accessCode)
      .single();

    if (groupError || !group) {
      return res.json({ valid: false, error: 'Invalid access code' });
    }

    // Check if group is activated
    if (!group.activated) {
      return res.json({ valid: false, error: 'Group is not activated yet' });
    }

    // Find ULI
    const { data: uliData, error: uliError } = await supabase
      .from('ulis')
      .select('*')
      .eq('uli_value', uli)
      .eq('group_number', group.group_number)
      .single();

    if (uliError || !uliData) {
      return res.json({ valid: false, error: 'Invalid ULI for this group' });
    }

    // Check if ULI is activated
    if (!uliData.activated) {
      return res.json({ valid: false, error: 'ULI is not activated yet' });
    }

    res.json({ valid: true, group: group.group_number });
  } catch (error) {
    console.error('Validate access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to check post-test availability for a user
app.get('/api/post-test/availability', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user's ULI
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('uli, group_number')
      .eq('id', userId)
      .single();

    if (userError || !user || !user.uli) {
      return res.json({ 
        available: false, 
        reason: 'User ULI not found',
        daysRemaining: null 
      });
    }

    // Get ULI activation status
    const { data: uliData, error: uliError } = await supabase
      .from('ulis')
      .select('activated, activated_at, group_number')
      .eq('uli_value', user.uli)
      .single();

    if (uliError || !uliData) {
      return res.json({ 
        available: false, 
        reason: 'ULI not found in database',
        daysRemaining: null 
      });
    }

    // Check if ULI is activated
    if (!uliData.activated || !uliData.activated_at) {
      return res.json({ 
        available: false, 
        reason: 'ULI is not activated yet',
        daysRemaining: null 
      });
    }

    // Get group countdown end date
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('countdown_end_date')
      .eq('group_number', uliData.group_number)
      .single();

    if (groupError || !group || !group.countdown_end_date) {
      return res.json({ 
        available: false, 
        reason: 'Group activation not found',
        daysRemaining: null 
      });
    }

    // Check if countdown has ended
    const now = new Date();
    const countdownEnd = new Date(group.countdown_end_date);
    const timeDiff = countdownEnd - now;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysRemaining > 0) {
      return res.json({ 
        available: false, 
        reason: 'Post-test will be available after countdown ends',
        daysRemaining: daysRemaining,
        countdownEndDate: group.countdown_end_date
      });
    }

    // Post-test is available!
    return res.json({ 
      available: true, 
      reason: 'Post-test is now available',
      daysRemaining: 0,
      countdownEndDate: group.countdown_end_date
    });
  } catch (error) {
    console.error('Post-test availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

