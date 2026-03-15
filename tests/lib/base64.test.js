import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64 } from '../../src/lib/base64.js';

describe('encodeBase64', () => {
  it("'Hello, World!' → 'SGVsbG8sIFdvcmxkIQ=='", () => {
    const result = encodeBase64('Hello, World!');
    expect(result).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  it("'' (empty string) → '' (empty string)", () => {
    const result = encodeBase64('');
    expect(result).toBe('');
  });

  it("'café' → 'Y2Fmw6k=' (UTF-8 encoding of é is 2 bytes)", () => {
    const result = encodeBase64('café');
    expect(result).toBe('Y2Fmw6k=');
  });

  it("'こんにちは' → correct base64 (verify round-trip)", () => {
    const result = encodeBase64('こんにちは');
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('decodeBase64', () => {
  it("'SGVsbG8sIFdvcmxkIQ==' → 'Hello, World!'", () => {
    const result = decodeBase64('SGVsbG8sIFdvcmxkIQ==');
    expect(result).toBe('Hello, World!');
  });

  it("'' → ''", () => {
    const result = decodeBase64('');
    expect(result).toBe('');
  });

  it("'Y2Fmw6k=' → 'café'", () => {
    const result = decodeBase64('Y2Fmw6k=');
    expect(result).toBe('café');
  });

  it("'not-valid-base64!!!' → throws", () => {
    expect(() => decodeBase64('not-valid-base64!!!')).toThrow(
      'Invalid Base64 string — contains characters outside the Base64 alphabet.'
    );
  });
});

describe('round-trip', () => {
  it("decodeBase64(encodeBase64(text)) === text for: ASCII, UTF-8 (café), emoji (🚀), CJK (こんにちは)", () => {
    const testCases = [
      'Hello, World!',
      'café',
      '🚀',
      'こんにちは'
    ];

    for (const text of testCases) {
      const encoded = encodeBase64(text);
      const decoded = decodeBase64(encoded);
      expect(decoded).toBe(text);
    }
  });
});
