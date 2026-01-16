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

// Security: Request size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security: Rate limiting storage (in-memory for now, use Redis in production)
const rateLimitStore = new Map();

// Security: Rate limiting middleware
const rateLimit = (windowMs = 60000, maxRequests = 100) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(clientId)) {
      rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const clientData = rateLimitStore.get(clientId);
    
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
      rateLimitStore.set(clientId, clientData);
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      // Log suspicious activity
      console.warn(`Rate limit exceeded for IP: ${clientId}, Path: ${req.path}`);
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    clientData.count++;
    rateLimitStore.set(clientId, clientData);
    next();
  };
};

// Security: Aggressive rate limiting for sensitive endpoints
const strictRateLimit = rateLimit(60000, 10); // 10 requests per minute
const moderateRateLimit = rateLimit(60000, 50); // 50 requests per minute

// Security: Input validation middleware
const validateInput = (req, res, next) => {
  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
    /(--|\#|\/\*|\*\/|;|\||&)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"])/i
  ];
  
  const checkValue = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    } else if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };
  
  const allInputs = { ...req.body, ...req.query, ...req.params };
  if (checkValue(allInputs)) {
    console.warn(`Potential SQL injection attempt from IP: ${req.ip}, Path: ${req.path}`);
    return res.status(400).json({ error: 'Invalid input detected' });
  }
  
  // Check for XSS patterns
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];
  
  const checkXSS = (value) => {
    if (typeof value === 'string') {
      return xssPatterns.some(pattern => pattern.test(value));
    } else if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkXSS);
    }
    return false;
  };
  
  if (checkXSS(allInputs)) {
    console.warn(`Potential XSS attempt from IP: ${req.ip}, Path: ${req.path}`);
    return res.status(400).json({ error: 'Invalid input detected' });
  }
  
  next();
};

// Security: Request logging for suspicious activity
const securityLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /%2e%2e/i, // URL encoded path traversal
    /\/etc\/passwd/i,
    /\/proc\/self/i,
    /union.*select/i,
    /<script/i
  ];
  
  const url = req.url.toLowerCase();
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(userAgent)
  );
  
  if (isSuspicious) {
    console.warn(`[SECURITY ALERT] Suspicious request detected:`, {
      ip: req.ip || req.connection.remoteAddress,
      method: req.method,
      path: req.path,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Apply security middleware
app.use(securityLogger);
app.use(moderateRateLimit);
app.use(validateInput);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

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
app.get('/api/validate-access', strictRateLimit, async (req, res) => {
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
    // Don't leak error details to potential attackers
    console.error('Validate access error:', error);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});

// Endpoint to check post-test availability for a user
app.get('/api/post-test/availability', strictRateLimit, async (req, res) => {
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
    // Don't leak error details to potential attackers
    console.error('Post-test availability error:', error);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
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

