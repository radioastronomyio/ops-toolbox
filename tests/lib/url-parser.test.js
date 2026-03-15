import { describe, it, expect } from 'vitest';
import { parseURL } from '../../src/lib/url-parser.js';

describe('parseURL', () => {
  it('full URL with all parts → correctly extracts each field', () => {
    const r = parseURL('https://example.com:8080/path/to/page?key=value&foo=bar#section');
    expect(r.protocol).toBe('https:');
    expect(r.hostname).toBe('example.com');
    expect(r.port).toBe('8080');
    expect(r.pathname).toBe('/path/to/page');
    expect(r.search).toBe('?key=value&foo=bar');
    expect(r.hash).toBe('#section');
  });

  it("'https://example.com' → hostname 'example.com', port '(default)', path '/'", () => {
    const r = parseURL('https://example.com');
    expect(r.hostname).toBe('example.com');
    expect(r.port).toBe('(default)');
    expect(r.pathname).toBe('/');
  });

  it('URL with multiple query params → searchParams object has all key-value pairs', () => {
    const r = parseURL('https://example.com?a=1&b=2&c=3');
    expect(r.searchParams).toEqual({ a: '1', b: '2', c: '3' });
  });

  it('URL with hash → hash extracted', () => {
    const r = parseURL('https://example.com/page#anchor');
    expect(r.hash).toBe('#anchor');
  });

  it('URL with username:password → password masked', () => {
    const r = parseURL('https://user:secret@example.com');
    expect(r.username).toBe('user');
    expect(r.password).toBe('••••••');
  });

  it("'not a url' → returns null", () => {
    expect(parseURL('not a url')).toBeNull();
  });

  it("'' → returns null", () => {
    expect(parseURL('')).toBeNull();
  });
});
