/**
 * Generate a unique 7-character classroom code
 * Uses base32 without ambiguous characters (O, 0, I, 1, L)
 */

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 32 chars, excludes O,0,I,1,L

/**
 * Generate a random 7-character code
 */
function generateCode() {
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

/**
 * Hash a code for storage (simple hash for now, can be upgraded to bcrypt)
 */
function hashCode(code) {
  // Simple hash - in production, use bcrypt or similar
  return Buffer.from(code).toString('base64');
}

/**
 * Verify a code against a hash
 */
function verifyCode(code, hash) {
  return hashCode(code) === hash;
}

module.exports = {
  generateCode,
  hashCode,
  verifyCode,
};

