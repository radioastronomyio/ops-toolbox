import { describe, it, expect } from 'vitest';
import { detectUnit, fromEpoch, toEpoch, parseHumanDate, formatInTimezone } from '../../src/lib/epochUtils.js';

describe('detectUnit', () => {
  it("'1710500000' (10-digit) → 'seconds'", () => expect(detectUnit('1710500000')).toBe('seconds'));
  it("'1710500000000' (13-digit) → 'milliseconds'", () => expect(detectUnit('1710500000000')).toBe('milliseconds'));
  it("'0' → 'seconds'", () => expect(detectUnit('0')).toBe('seconds'));
  it("'9999999999' (10-digit) → 'seconds'", () => expect(detectUnit('9999999999')).toBe('seconds'));
  it("'10000000000' (11-digit) → 'milliseconds'", () => expect(detectUnit('10000000000')).toBe('milliseconds'));
});

describe('fromEpoch', () => {
  it("'1710500000' → date 2024, unit seconds", () => {
    const r = fromEpoch('1710500000');
    expect(r.date.getFullYear()).toBe(2024);
    expect(r.unit).toBe('seconds');
  });

  it("'0' → epoch origin, seconds", () => {
    const r = fromEpoch('0');
    expect(r.date.getTime()).toBe(0);
    expect(r.unit).toBe('seconds');
  });

  it("'1710500000000' → milliseconds", () => {
    const r = fromEpoch('1710500000000');
    expect(r.date.getTime()).toBe(1710500000000);
    expect(r.unit).toBe('milliseconds');
  });

  it("'abc' → error", () => {
    expect(fromEpoch('abc').error).not.toBeNull();
  });

  it("'-86400' → 1969-12-31", () => {
    const r = fromEpoch('-86400');
    expect(r.date.getFullYear()).toBe(1969);
  });
});

describe('toEpoch', () => {
  it('new Date(0) → {seconds:0, milliseconds:0}', () => {
    expect(toEpoch(new Date(0))).toEqual({ seconds: 0, milliseconds: 0 });
  });
  it('new Date(1000) → {seconds:1, milliseconds:1000}', () => {
    expect(toEpoch(new Date(1000))).toEqual({ seconds: 1, milliseconds: 1000 });
  });
  it('2026-01-01T00:00:00Z → correct', () => {
    const r = toEpoch(new Date('2026-01-01T00:00:00Z'));
    expect(r.seconds).toBe(1767225600);
    expect(r.milliseconds).toBe(1767225600000);
  });
});

describe('parseHumanDate', () => {
  it('ISO 8601 → valid Date', () => {
    const r = parseHumanDate('2026-03-15T09:00:00Z');
    expect(r.error).toBeNull();
    expect(r.date).toBeInstanceOf(Date);
  });
  it('date only → valid Date', () => {
    const r = parseHumanDate('2026-01-01');
    expect(r.error).toBeNull();
  });
  it('"not a date" → error', () => {
    expect(parseHumanDate('not a date').error).not.toBeNull();
  });
  it('"" → error', () => {
    expect(parseHumanDate('').error).not.toBeNull();
  });
});

describe('formatInTimezone', () => {
  it('new Date(0), UTC → contains 1970', () => {
    expect(formatInTimezone(new Date(0), 'UTC')).toContain('1970');
  });
  it('new Date(0), America/New_York → contains 1969', () => {
    expect(formatInTimezone(new Date(0), 'America/New_York')).toContain('1969');
  });
});
