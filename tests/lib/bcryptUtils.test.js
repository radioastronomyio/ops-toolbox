import { describe, it, expect } from 'vitest';
import { isBcryptHash, hashPassword, verifyPassword } from '../../src/lib/bcryptUtils.js';

describe('isBcryptHash', () => {
  it('valid $2a hash → true', () => {
    expect(isBcryptHash('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')).toBe(true);
  });
  it('valid $2b hash → true', () => {
    // Known valid 60-char bcrypt hash
    expect(isBcryptHash('$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')).toBe(true);
  });
  it('"notahash" → false', () => expect(isBcryptHash('notahash')).toBe(false));
  it('"" → false', () => expect(isBcryptHash('')).toBe(false));
  it('"$1$notbcrypt$..." → false', () => expect(isBcryptHash('$1$notbcrypt$abc')).toBe(false));
});

describe('hashPassword', () => {
  it('returns string starting with $2', async () => {
    const h = await hashPassword('test', 4);
    expect(h).toMatch(/^\$2[aby]\$/);
  }, 10000);

  it('hash round-trips correctly with salt rounds 4', async () => {
    const h = await hashPassword('mypassword', 4);
    const match = await verifyPassword('mypassword', h);
    expect(match).toBe(true);
  }, 10000);
});

describe('verifyPassword', () => {
  it('correct plain text → resolves true', async () => {
    const h = await hashPassword('hello', 4);
    expect(await verifyPassword('hello', h)).toBe(true);
  }, 10000);

  it('wrong plain text → resolves false', async () => {
    const h = await hashPassword('hello', 4);
    expect(await verifyPassword('wrong', h)).toBe(false);
  }, 10000);
});
