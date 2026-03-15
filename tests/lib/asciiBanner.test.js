import { describe, it, expect } from 'vitest';
import { getAvailableFonts, generateBanner } from '../../src/lib/asciiBanner.js';

describe('getAvailableFonts', () => {
  it('returns array with length > 0', () => {
    const fonts = getAvailableFonts();
    expect(fonts.length).toBeGreaterThan(0);
  });

  it('includes Standard', () => {
    expect(getAvailableFonts()).toContain('Standard');
  });

  it('includes Big', () => {
    expect(getAvailableFonts()).toContain('Big');
  });

  it('all entries are non-empty strings', () => {
    getAvailableFonts().forEach(f => {
      expect(typeof f).toBe('string');
      expect(f.length).toBeGreaterThan(0);
    });
  });
});

describe('generateBanner', () => {
  it("'Hi', Standard → non-empty string", async () => {
    const r = await generateBanner('Hi', 'Standard');
    expect(typeof r).toBe('string');
    expect(r.trim().length).toBeGreaterThan(0);
  }, 10000);

  it('output contains newlines', async () => {
    const r = await generateBanner('Hi', 'Standard');
    expect(r).toContain('\n');
  }, 10000);

  it("empty string → resolves (possibly empty/whitespace)", async () => {
    const r = await generateBanner('', 'Standard');
    expect(typeof r).toBe('string');
  }, 10000);

  it("'ABC', Big → output longer than 3 chars", async () => {
    const r = await generateBanner('ABC', 'Big');
    expect(r.length).toBeGreaterThan(3);
  }, 10000);
});
