import { describe, it, expect } from 'vitest';
import { pemToArrayBuffer, formatDN } from '../../src/lib/x509.js';

describe('pemToArrayBuffer', () => {
  it('valid PEM with headers → returns ArrayBuffer', () => {
    const fakePem = `-----BEGIN CERTIFICATE-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\n-----END CERTIFICATE-----`;
    const buf = pemToArrayBuffer(fakePem);
    expect(buf).toBeInstanceOf(ArrayBuffer);
    expect(buf.byteLength).toBeGreaterThan(0);
  });

  it('strips BEGIN/END CERTIFICATE lines correctly', () => {
    const pem = `-----BEGIN CERTIFICATE-----\nYWJj\n-----END CERTIFICATE-----`;
    const buf = pemToArrayBuffer(pem);
    expect(buf).toBeInstanceOf(ArrayBuffer);
    // 'YWJj' decodes to 'abc' (3 bytes)
    expect(buf.byteLength).toBe(3);
  });

  it('empty string → throws', () => {
    expect(() => pemToArrayBuffer('')).toThrow();
  });
});

describe('formatDN', () => {
  it('formats common DN fields into readable string', () => {
    const rdns = {
      typesAndValues: [
        { type: '2.5.4.3', value: { valueBlock: { value: 'example.com' } } },
        { type: '2.5.4.10', value: { valueBlock: { value: 'Example Corp' } } },
      ]
    };
    const result = formatDN(rdns);
    expect(result).toContain('CN=example.com');
    expect(result).toContain('O=Example Corp');
  });

  it('returns empty string for null/undefined input', () => {
    expect(formatDN(null)).toBe('');
    expect(formatDN(undefined)).toBe('');
  });
});
