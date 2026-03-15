import { describe, it, expect } from 'vitest';
import { encodeComponent, decodeComponent, parseQueryString, parseUrl, buildUrl } from '../../src/lib/urlEncoder.js';

describe('encodeComponent', () => {
  it("'hello world' → 'hello%20world'", () => expect(encodeComponent('hello world')).toBe('hello%20world'));
  it("'a=1&b=2' → 'a%3D1%26b%3D2'", () => expect(encodeComponent('a=1&b=2')).toBe('a%3D1%26b%3D2'));
  it("'https://example.com' → encoded", () => expect(encodeComponent('https://example.com')).toBe('https%3A%2F%2Fexample.com'));
  it("'' → ''", () => expect(encodeComponent('')).toBe(''));
  it("unreserved chars unchanged", () => expect(encodeComponent('abc123-_.~')).toBe('abc123-_.~'));
});

describe('decodeComponent', () => {
  it("'hello%20world' → {decoded:'hello world',error:null}", () => {
    expect(decodeComponent('hello%20world')).toEqual({ decoded: 'hello world', error: null });
  });
  it("'a%3D1%26b%3D2' → decoded 'a=1&b=2'", () => {
    expect(decodeComponent('a%3D1%26b%3D2').decoded).toBe('a=1&b=2');
  });
  it("'%GG' → error non-null", () => {
    const r = decodeComponent('%GG');
    expect(r.error).not.toBeNull();
  });
  it("'' → decoded '' no error", () => {
    expect(decodeComponent('')).toEqual({ decoded: '', error: null });
  });
});

describe('parseQueryString', () => {
  it("'?name=Alice&age=30' → correct pairs", () => {
    const r = parseQueryString('?name=Alice&age=30');
    expect(r[0].key).toBe('name');
    expect(r[0].decoded).toBe('Alice');
    expect(r[1].key).toBe('age');
    expect(r[1].decoded).toBe('30');
  });
  it("'q=hello%20world' → decoded 'hello world'", () => {
    const r = parseQueryString('q=hello%20world');
    expect(r[0].decoded).toBe('hello world');
  });
  it("'' → []", () => expect(parseQueryString('')).toEqual([]));
  it("'?empty=' → [{key:'empty',decoded:''}]", () => {
    const r = parseQueryString('?empty=');
    expect(r[0].key).toBe('empty');
    expect(r[0].decoded).toBe('');
  });
});

describe('parseUrl', () => {
  it("full URL → correct fields", () => {
    const r = parseUrl('https://example.com/path?q=test#section');
    expect(r.protocol).toBe('https:');
    expect(r.hostname).toBe('example.com');
    expect(r.pathname).toBe('/path');
    expect(r.hash).toBe('#section');
    expect(r.params.q).toBe('test');
  });
  it("'not a url' → error non-null", () => {
    expect(parseUrl('not a url').error).not.toBeNull();
  });
});

describe('buildUrl', () => {
  it("builds URL with params", () => {
    const u = buildUrl('https://api.example.com', { q: 'hello world', page: '2' });
    expect(u).toContain('https://api.example.com');
    expect(u).toContain('page=2');
  });
});
