import bcrypt from 'bcryptjs';

export async function hashPassword(plainText, saltRounds) {
  return bcrypt.hash(plainText, saltRounds);
}

export async function verifyPassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

export function isBcryptHash(str) {
  if (!str || typeof str !== 'string') return false;
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(str);
}
