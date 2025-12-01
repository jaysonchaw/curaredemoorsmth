const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { hashCode } = require('../utils/codeGenerator');

/**
 * GET /api/schools/verify-key
 * Verify a school key and return school info
 */
router.get('/verify-key', async (req, res) => {
  try {
    const { key } = req.query;

    if (!key || !key.startsWith('SCH-')) {
      return res.json({ valid: false });
    }

    const keyHash = hashCode(key);

    const { data: partner, error } = await supabase
      .from('school_partners')
      .select('id, name, type, status')
      .eq('school_key_hash', keyHash)
      .single();

    if (error || !partner) {
      return res.json({ valid: false });
    }

    // Check if invite is still valid
    const { data: invite } = await supabase
      .from('teacher_invites')
      .select('id, expires_at, used_at')
      .eq('invite_code', key)
      .single();

    if (invite) {
      const now = new Date();
      const expiresAt = new Date(invite.expires_at);
      
      if (invite.used_at || expiresAt < now) {
        return res.json({ valid: false, reason: invite.used_at ? 'already_used' : 'expired' });
      }
    }

    res.json({
      valid: true,
      school: {
        id: partner.id,
        name: partner.name,
        type: partner.type,
        status: partner.status,
      },
    });
  } catch (error) {
    console.error('Verify school key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;







