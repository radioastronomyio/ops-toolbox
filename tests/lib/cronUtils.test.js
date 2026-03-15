import { describe, it, expect } from 'vitest';
import { describeExpression, parseFields, isValidExpression, getNextRuns } from '../../src/lib/cronUtils.js';

describe('describeExpression', () => {
  it('* * * * * → Every minute', () => {
    const r = describeExpression('* * * * *');
    expect(r.error).toBeNull();
    expect(r.description.toLowerCase()).toContain('every minute');
  });

  it('0 9 * * 1-5 → contains 9 and Monday', () => {
    const r = describeExpression('0 9 * * 1-5');
    expect(r.error).toBeNull();
    expect(r.description).toMatch(/9|09/);
    expect(r.description).toMatch(/monday|mon/i);
  });

  it('0 0 1 * * → description contains midnight or 12:00 AM and 1', () => {
    const r = describeExpression('0 0 1 * *');
    expect(r.error).toBeNull();
    expect(r.description).toMatch(/midnight|12:00 AM|00:00/i);
  });

  it('invalid expr → error non-null', () => {
    const r = describeExpression('invalid expr');
    expect(r.error).not.toBeNull();
    expect(r.description).toBe('');
  });

  it('*/5 * * * * → contains 5 minutes', () => {
    const r = describeExpression('*/5 * * * *');
    expect(r.error).toBeNull();
    expect(r.description).toMatch(/5 minute/i);
  });
});

describe('parseFields', () => {
  it('0 9 * * 1-5 → correct fields', () => {
    expect(parseFields('0 9 * * 1-5')).toEqual({ minute: '0', hour: '9', dom: '*', month: '*', dow: '1-5' });
  });

  it('*/5 * * * * → minute field */5', () => {
    expect(parseFields('*/5 * * * *')).toEqual({ minute: '*/5', hour: '*', dom: '*', month: '*', dow: '*' });
  });

  it('too few fields → null', () => {
    expect(parseFields('too few fields')).toBeNull();
  });

  it('too many fields → null', () => {
    expect(parseFields('0 0 1 2 3 4 5')).toBeNull();
  });
});

describe('isValidExpression', () => {
  it('* * * * * → true', () => expect(isValidExpression('* * * * *')).toBe(true));
  it('0 9 * * MON-FRI → true', () => expect(isValidExpression('0 9 * * MON-FRI')).toBe(true));
  it('not-cron → false', () => expect(isValidExpression('not-cron')).toBe(false));
  it('"" → false', () => expect(isValidExpression('')).toBe(false));
});

describe('getNextRuns', () => {
  it('* * * * * returns array of length n', () => {
    const from = new Date('2026-01-01T00:00:00Z');
    const runs = getNextRuns('* * * * *', 5, from);
    expect(runs).toHaveLength(5);
  });

  it('returns Date objects', () => {
    const runs = getNextRuns('* * * * *', 3, new Date('2026-01-01T00:00:00Z'));
    runs.forEach(d => expect(d).toBeInstanceOf(Date));
  });

  it('each returned date is after fromDate', () => {
    const from = new Date('2026-01-01T00:00:00Z');
    const runs = getNextRuns('* * * * *', 3, from);
    runs.forEach(d => expect(d.getTime()).toBeGreaterThan(from.getTime()));
  });

  it('0 0 31 2 * (impossible) → returns []', () => {
    const from = new Date('2026-01-01T00:00:00Z');
    const runs = getNextRuns('0 0 31 2 *', 5, from);
    expect(runs).toEqual([]);
  });
});
