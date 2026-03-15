import { describe, it, expect } from 'vitest';
import { normalizeMac, extractOUI, isValidMac } from '../../src/lib/mac.js';

describe('normalizeMac', () => {
  it("'AA:BB:CC:DD:EE:FF' → 'AA:BB:CC:DD:EE:FF'", () => {
    expect(normalizeMac('AA:BB:CC:DD:EE:FF')).toBe('AA:BB:CC:DD:EE:FF');
  });

  it("'aa:bb:cc:dd:ee:ff' → 'AA:BB:CC:DD:EE:FF'", () => {
    expect(normalizeMac('aa:bb:cc:dd:ee:ff')).toBe('AA:BB:CC:DD:EE:FF');
  });

  it("'AA-BB-CC-DD-EE-FF' → 'AA:BB:CC:DD:EE:FF'", () => {
    expect(normalizeMac('AA-BB-CC-DD-EE-FF')).toBe('AA:BB:CC:DD:EE:FF');
  });

  it("'AABB.CCDD.EEFF' → 'AA:BB:CC:DD:EE:FF'", () => {
    expect(normalizeMac('AABB.CCDD.EEFF')).toBe('AA:BB:CC:DD:EE:FF');
  });

  it("'AABBCCDDEEFF' → 'AA:BB:CC:DD:EE:FF'", () => {
    expect(normalizeMac('AABBCCDDEEFF')).toBe('AA:BB:CC:DD:EE:FF');
  });

  it("'invalid' → null", () => {
    expect(normalizeMac('invalid')).toBeNull();
  });

  it("'' → null", () => {
    expect(normalizeMac('')).toBeNull();
  });
});

describe('extractOUI', () => {
  it("'AA:BB:CC:DD:EE:FF' → 'AA:BB:CC'", () => {
    expect(extractOUI('AA:BB:CC:DD:EE:FF')).toBe('AA:BB:CC');
  });
});

describe('isValidMac', () => {
  it('valid colon format → true', () => {
    expect(isValidMac('AA:BB:CC:DD:EE:FF')).toBe(true);
  });

  it('valid dash format → true', () => {
    expect(isValidMac('AA-BB-CC-DD-EE-FF')).toBe(true);
  });

  it('valid Cisco dot format → true', () => {
    expect(isValidMac('AABB.CCDD.EEFF')).toBe(true);
  });

  it("'GG:HH:II:JJ:KK:LL' → false (invalid hex)", () => {
    expect(isValidMac('GG:HH:II:JJ:KK:LL')).toBe(false);
  });

  it('too short → false', () => {
    expect(isValidMac('AA:BB:CC')).toBe(false);
  });
});
