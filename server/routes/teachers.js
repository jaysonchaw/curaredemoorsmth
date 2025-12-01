const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * POST /api/teachers/signup
 * Register a new teacher
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, teacherCode, schoolKey } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Validate teacher code OR school key (unless testsecure)
    const validTeacherCodes = [
      'H7G9J2KM',
      'Q4P8R1ZT',
      'M2X9C6LV',
      'B8T5N0SY',
      'R3F7E4QD',
      'Z6K1W8HJ',
      'V9D2S3PL',
      'N5A0M7GX',
      'Y1C8Q6BR',
      'T4L3U9ZF',
    ];

    let schoolId = null;
    let inviteUsed = false;

    if (name.toLowerCase() !== 'testsecure') {
      const hasTeacherCode = teacherCode && validTeacherCodes.includes(teacherCode.toUpperCase().trim());
      const hasSchoolKey = schoolKey && schoolKey.startsWith('SCH-');

      if (!hasTeacherCode && !hasSchoolKey) {
        return res.status(400).json({ 
          error: 'Either a valid teacher code or school key is required. Please contact your institution or use the invite link provided.' 
        });
      }

      // If school key provided, verify and link teacher to school
      if (hasSchoolKey) {
        const { hashCode } = require('../utils/codeGenerator');
        const keyHash = hashCode(schoolKey);

        // Find school partner
        const { data: partner } = await supabase
          .from('school_partners')
          .select('id')
          .eq('school_key_hash', keyHash)
          .single();

        if (!partner) {
          return res.status(400).json({ error: 'Invalid school key' });
        }

        schoolId = partner.id;

        // Mark invite as used
        const { data: invite } = await supabase
          .from('teacher_invites')
          .select('id, used_at')
          .eq('invite_code', schoolKey)
          .single();

        if (invite) {
          if (invite.used_at) {
            return res.status(400).json({ error: 'This school key has already been used' });
          }

          await supabase
            .from('teacher_invites')
            .update({ used_at: new Date().toISOString(), used_by: null }) // Will update with user ID after creation
            .eq('id', invite.id);

          inviteUsed = true;
        }
      }
    }

    // Password strength validation
    if (password.length < 10 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 10 characters and contain both letters and numbers' 
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create teacher user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: name,
        role: 'teacher',
        verified: false,
        verification_token: verificationToken,
        verification_token_expires: verificationTokenExpires.toISOString(),
        school_id: schoolId, // Link to school if school key was used
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating teacher:', error);
      return res.status(500).json({ error: 'Failed to create teacher account' });
    }

    // Update invite with user ID if school key was used
    if (inviteUsed && schoolKey) {
      await supabase
        .from('teacher_invites')
        .update({ used_by: newUser.id })
        .eq('invite_code', schoolKey);
    }

    // TODO: Send verification email with token
    // For now, return token in response (remove in production)
    res.status(201).json({
      message: 'Teacher account created. Please verify your email.',
      userId: newUser.id,
      verificationToken, // Remove in production
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/teachers/verify-email
 * Verify teacher email with token
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, verification_token_expires')
      .eq('verification_token', token)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    // Check if token expired
    if (new Date(user.verification_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    // Verify user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verified: true,
        verification_token: null,
        verification_token_expires: null,
      })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to verify email' });
    }

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/teachers/login
 * Login teacher
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, password_hash, role, verified')
      .eq('email', email)
      .eq('role', 'teacher')
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.verified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // TODO: Generate JWT token and set as httpOnly cookie
    // For now, return user data (implement proper auth in production)
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/teachers/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .eq('role', 'teacher')
      .single();

    // Don't reveal if user exists or not (security best practice)
    if (!error && user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await supabase
        .from('users')
        .update({
          reset_password_token: resetToken,
          reset_password_expires: resetTokenExpires.toISOString(),
        })
        .eq('id', user.id);

      // TODO: Send reset email with token
    }

    res.json({ message: 'If an account exists, a password reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

