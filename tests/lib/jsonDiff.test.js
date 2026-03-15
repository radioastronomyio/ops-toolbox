import { describe, it, expect } from 'vitest';
import { parseJson, computeDiff, renderDiffHtml } from '../../src/lib/jsonDiff.js';

describe('parseJson', () => {
  it('{"a":1} → value {a:1}, error null', () => {
    const r = parseJson('{"a":1}');
    expect(r.value).toEqual({ a: 1 });
    expect(r.error).toBeNull();
  });
  it('null → value null, error null', () => {
    const r = parseJson('null');
    expect(r.value).toBeNull();
    expect(r.error).toBeNull();
  });
  it('[] → value [], error null', () => {
    const r = parseJson('[]');
    expect(r.value).toEqual([]);
    expect(r.error).toBeNull();
  });
  it('{bad json} → error non-null', () => {
    const r = parseJson('{bad json}');
    expect(r.error).not.toBeNull();
  });
  it('"" → error non-null', () => {
    const r = parseJson('');
    expect(r.error).not.toBeNull();
  });
});

describe('computeDiff', () => {
  it('identical objects → null', () => {
    expect(computeDiff({ a: 1 }, { a: 1 })).toBeNull();
  });
  it('{a:1} vs {a:2} → delta showing a modified', () => {
    const d = computeDiff({ a: 1 }, { a: 2 });
    expect(d).not.toBeNull();
    expect(d).toHaveProperty('a');
  });
  it('{a:1} vs {a:1,b:2} → delta showing b added', () => {
    const d = computeDiff({ a: 1 }, { a: 1, b: 2 });
    expect(d).toHaveProperty('b');
  });
  it('{a:1,b:2} vs {a:1} → delta showing b deleted', () => {
    const d = computeDiff({ a: 1, b: 2 }, { a: 1 });
    expect(d).toHaveProperty('b');
  });
});

describe('renderDiffHtml', () => {
  it('returns non-empty HTML string for non-null delta', () => {
    const d = computeDiff({ a: 1 }, { a: 2 });
    const html = renderDiffHtml({ a: 1 }, d);
    expect(html).toBeTruthy();
    expect(typeof html).toBe('string');
  });
  it('contains ins or del for add/remove cases', () => {
    const d = computeDiff({ a: 1 }, { a: 1, b: 2 });
    const html = renderDiffHtml({ a: 1 }, d);
    expect(html.includes('ins') || html.includes('jsondiffpatch-added')).toBe(true);
  });
});
