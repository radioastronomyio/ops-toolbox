/**
 * @file bcryptUtils.js
 * @description Bcrypt hash generation and verification via bcryptjs (pure JS, no native deps)
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import bcrypt from 'bcryptjs';

export async function hashPassword(plainText, saltRounds) {
  return bcrypt.hash(plainText, saltRounds);
}

export async function verifyPassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

/** Validates bcrypt hash format: $2a/$2b/$2y prefix, 2-digit cost, 53-char salt+hash */
export function isBcryptHash(str) {
  if (!str || typeof str !== 'string') return false;
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(str);
}
