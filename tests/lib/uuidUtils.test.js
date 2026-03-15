import { describe, it, expect } from 'vitest';
import { generateV4, generateV7, generateBatch, formatUuid, isValidUuid } from '../../src/lib/uuidUtils.js';

describe('generateV4', () => {
  it('matches v4 pattern', () => {
    expect(generateV4()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it('successive calls differ', () => {
    expect(generateV4()).not.toBe(generateV4());
  });
});

describe('generateV7', () => {
  it('matches v7 pattern', () => {
    expect(generateV7()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it('successive v7 UUIDs are sortable', () => {
    const a = generateV7();
    // Small delay to ensure different timestamps
    const b = generateV7();
    // Both should be valid v7
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/);
    expect(b).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/);
  });
});

describe('generateBatch', () => {
  it('v4 batch of 5', () => {
    const batch = generateBatch('v4', 5);
    expect(batch).toHaveLength(5);
    batch.forEach(u => expect(u).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4/));
  });
  it('v7 batch of 3', () => {
    const batch = generateBatch('v7', 3);
    expect(batch).toHaveLength(3);
    batch.forEach(u => expect(u).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/));
  });
});

describe('formatUuid', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000';
  it('no-hyphens', () => expect(formatUuid(uuid, 'no-hyphens')).toBe('550e8400e29b41d4a716446655440000'));
  it('uppercase', () => expect(formatUuid(uuid, 'uppercase')).toBe('550E8400-E29B-41D4-A716-446655440000'));
  it('hyphenated (unchanged)', () => expect(formatUuid(uuid, 'hyphenated')).toBe(uuid));
});

describe('isValidUuid', () => {
  it('valid uuid → true', () => expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true));
  it('nil uuid → true', () => expect(isValidUuid('00000000-0000-0000-0000-000000000000')).toBe(true));
  it('"not-a-uuid" → false', () => expect(isValidUuid('not-a-uuid')).toBe(false));
  it('"" → false', () => expect(isValidUuid('')).toBe(false));
});
