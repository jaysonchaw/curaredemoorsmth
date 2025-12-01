const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { generateCode, hashCode } = require('../utils/codeGenerator');

// Helper to generate school key (SCH-XXXXXX format)
const generateSchoolKey = () => {
  const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Excludes O,0,I,1,L
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return `SCH-${code}`;
};

// Helper to generate partner ID
const generatePartnerId = () => {
  return 'PARTNER-' + Date.now().toString(36).toUpperCase();
};

/**
 * POST /api/partners/request-pilot
 * Public endpoint - Request a pilot
 */
router.post('/request-pilot', async (req, res) => {
  try {
    const {
      name,
      type,
      contactName,
      contactRole,
      contactEmail,
      contactPhone,
      city,
      expectedStudents,
      preferredStartWeeks,
      pilotType,
      notes,
    } = req.body;

    if (!name || !type || !contactName || !contactEmail) {
      return res.status(400).json({ error: 'Required fields: name, type, contactName, contactEmail' });
    }

    // Generate partner ID
    const partnerId = generatePartnerId();

    // Generate school key
    let schoolKey;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      schoolKey = generateSchoolKey();
      const { data: existing } = await supabase
        .from('school_partners')
        .select('id')
        .eq('raw_school_key_admin_view', schoolKey)
        .single();
      
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique school key' });
    }

    const schoolKeyHash = hashCode(schoolKey);

    // Create school partner record
    const { data: partner, error } = await supabase
      .from('school_partners')
      .insert({
        name,
        type,
        contact_name: contactName,
        contact_role: contactRole,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        city,
        expected_students: expectedStudents,
        preferred_start_weeks: preferredStartWeeks || [],
        pilot_type: pilotType,
        notes,
        status: 'requested',
        partner_id: partnerId,
        school_key_hash: schoolKeyHash,
        raw_school_key_admin_view: schoolKey, // Store raw for admin view only
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating school partner:', error);
      return res.status(500).json({ error: 'Failed to create pilot request' });
    }

    // Create teacher invite using the school key
    const { data: invite, error: inviteError } = await supabase
      .from('teacher_invites')
      .insert({
        school_id: partner.id,
        invite_code: schoolKey,
        invite_code_hash: schoolKeyHash,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating teacher invite:', inviteError);
    }

    // Log analytics
    await supabase.from('analytics_events').insert({
      event_type: 'pilot_requested',
      payload: { partnerId: partner.id, schoolName: name, pilotType },
    });

    // TODO: Send confirmation email with school key and next steps
    // TODO: Create internal task for admin review
    // TODO: Notify Curare admin channel

    res.status(201).json({
      ...partner,
      schoolKey, // Return key to user (they'll also get it via email)
      message: 'Pilot request submitted successfully. Check your email for next steps.',
    });
  } catch (error) {
    console.error('Request pilot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify admin auth
const verifyAdmin = async (req, res, next) => {
  const adminId = req.headers['x-admin-id'] || req.headers['x-user-id'];
  if (!adminId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user is admin
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', adminId)
    .single();

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  req.adminId = adminId;
  next();
};

/**
 * GET /api/partners
 * List all school partners (admin only)
 */
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('school_partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: partners, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch partners' });
    }

    res.json(partners || []);
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/partners/:id
 * Get partner details (admin only)
 */
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: partner, error } = await supabase
      .from('school_partners')
      .select(`
        *,
        pilots (*),
        teacher_invites (*),
        school_admins (
          *,
          teacher:users!school_admins_teacher_id_fkey(id, full_name, email)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    res.json(partner);
  } catch (error) {
    console.error('Get partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/partners/:id/approve
 * Approve a partner (admin only)
 */
router.post('/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedStaffId, notes } = req.body;

    const { data: partner, error: fetchError } = await supabase
      .from('school_partners')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    const updates = {
      status: 'approved',
      assigned_staff_id: assignedStaffId || null,
    };

    if (notes) {
      // Store notes in a notes field (would need to add to schema)
    }

    const { data: updated, error } = await supabase
      .from('school_partners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to approve partner' });
    }

    // Log analytics
    await supabase.from('analytics_events').insert({
      event_type: 'partner_approved',
      payload: { partnerId: id, adminId: req.adminId },
    });

    // TODO: Send approval email to contact

    res.json(updated);
  } catch (error) {
    console.error('Approve partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/partners/:id/generate-school-key
 * Generate or regenerate school key (admin only)
 */
router.post('/:id/generate-school-key', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify partner exists
    const { data: partner, error: fetchError } = await supabase
      .from('school_partners')
      .select('id, raw_school_key_admin_view')
      .eq('id', id)
      .single();

    if (fetchError || !partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Generate new school key
    let schoolKey;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      schoolKey = generateSchoolKey();
      const { data: existing } = await supabase
        .from('school_partners')
        .select('id')
        .eq('raw_school_key_admin_view', schoolKey)
        .single();
      
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique school key' });
    }

    const schoolKeyHash = hashCode(schoolKey);

    // Update partner
    const { data: updated, error } = await supabase
      .from('school_partners')
      .update({
        school_key_hash: schoolKeyHash,
        raw_school_key_admin_view: schoolKey,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update school key' });
    }

    // Create or update teacher invite
    const { data: existingInvite } = await supabase
      .from('teacher_invites')
      .select('id')
      .eq('school_id', id)
      .eq('invite_code', partner.raw_school_key_admin_view)
      .single();

    if (existingInvite) {
      // Update existing invite
      await supabase
        .from('teacher_invites')
        .update({
          invite_code: schoolKey,
          invite_code_hash: schoolKeyHash,
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        })
        .eq('id', existingInvite.id);
    } else {
      // Create new invite
      await supabase
        .from('teacher_invites')
        .insert({
          school_id: id,
          invite_code: schoolKey,
          invite_code_hash: schoolKeyHash,
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          created_by: req.adminId,
        });
    }

    // Log analytics
    await supabase.from('analytics_events').insert({
      event_type: 'school_key_generated',
      payload: { partnerId: id, adminId: req.adminId },
    });

    res.json({
      ...updated,
      schoolKey, // Return for admin to copy
    });
  } catch (error) {
    console.error('Generate school key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/partners/:id/generate-pilot-agreement
 * Generate Pilot Agreement PDF (admin only)
 */
router.post('/:id/generate-pilot-agreement', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: partner, error: fetchError } = await supabase
      .from('school_partners')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // TODO: Generate PDF using a PDF library (e.g., pdfkit, puppeteer)
    // For now, create Pilot Agreement record with placeholder path
    const agreementPath = `/pilot-agreements/${id}-${Date.now()}.pdf`;

    const { data: agreement, error: agreementError } = await supabase
      .from('moas')
      .insert({
        school_id: id,
        moa_pdf_path: agreementPath,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (agreementError) {
      return res.status(500).json({ error: 'Failed to create Pilot Agreement record' });
    }

    // TODO: Actually generate PDF with school name, dates, etc.

    res.json({
      ...agreement,
      message: 'Pilot Agreement generated successfully',
      downloadUrl: agreementPath, // Placeholder
    });
  } catch (error) {
    console.error('Generate Pilot Agreement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

