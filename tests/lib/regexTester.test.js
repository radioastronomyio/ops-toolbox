import { describe, it, expect } from 'vitest';
import { compileRegex, runMatches, buildHighlightSegments } from '../../src/lib/regexTester.js';

describe('compileRegex', () => {
  it('\\d+, g → { regex: RegExp, error: null }', () => {
    const r = compileRegex('\\d+', 'g');
    expect(r.error).toBeNull();
    expect(r.regex).toBeInstanceOf(RegExp);
  });

  it('(unclosed, g → error non-null', () => {
    const r = compileRegex('(unclosed', 'g');
    expect(r.regex).toBeNull();
    expect(r.error).not.toBeNull();
  });

  it('"", gi → regex returned, no error', () => {
    const r = compileRegex('', 'gi');
    expect(r.error).toBeNull();
    expect(r.regex).toBeInstanceOf(RegExp);
  });

  it('valid pattern, invalid flag z → error', () => {
    const r = compileRegex('\\d+', 'z');
    expect(r.error).not.toBeNull();
  });
});

describe('runMatches', () => {
  it('/\\d+/g against "abc 123 def 456" → 2 matches', () => {
    const { regex } = compileRegex('\\d+', 'g');
    const { matches } = runMatches(regex, 'abc 123 def 456');
    expect(matches).toHaveLength(2);
    expect(matches[0].fullMatch).toBe('123');
    expect(matches[0].index).toBe(4);
    expect(matches[1].fullMatch).toBe('456');
    expect(matches[1].index).toBe(12);
  });

  it('/(\\w+)/g → groups', () => {
    const { regex } = compileRegex('(\\w+)', 'g');
    const { matches } = runMatches(regex, 'hello world');
    expect(matches).toHaveLength(2);
    expect(matches[0].groups[0]).toBe('hello');
    expect(matches[1].groups[0]).toBe('world');
  });

  it('/no-match/ → empty matches', () => {
    const { regex } = compileRegex('no-match', '');
    const { matches, error } = runMatches(regex, 'abc');
    expect(matches).toHaveLength(0);
    expect(error).toBeNull();
  });

  it('named groups', () => {
    const { regex } = compileRegex('(?<year>\\d{4})', '');
    const { matches } = runMatches(regex, '2026-03-15');
    expect(matches[0].namedGroups).toEqual({ year: '2026' });
  });
});

describe('buildHighlightSegments', () => {
  it('match at start', () => {
    const segs = buildHighlightSegments('hello world', [{ fullMatch: 'hello', index: 0 }]);
    expect(segs[0]).toEqual({ text: 'hello', isMatch: true, groupIndex: null });
    expect(segs[1]).toEqual({ text: ' world', isMatch: false, groupIndex: null });
  });

  it('no matches → single non-match segment', () => {
    const segs = buildHighlightSegments('abc', []);
    expect(segs).toHaveLength(1);
    expect(segs[0].isMatch).toBe(false);
  });

  it('match at end', () => {
    const segs = buildHighlightSegments('abc123', [{ fullMatch: '123', index: 3 }]);
    expect(segs[0].text).toBe('abc');
    expect(segs[1].text).toBe('123');
    expect(segs[1].isMatch).toBe(true);
  });
});
