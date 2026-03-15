import { describe, it, expect } from 'vitest';
import { bufferToHex, hashBufferMD5, hashBufferSHA, hashFile } from '../../src/lib/fileHash.js';

const enc = new TextEncoder();

describe('bufferToHex', () => {
  it('empty buffer → empty string', () => {
    expect(bufferToHex(new ArrayBuffer(0))).toBe('');
  });
  it('[0x00] → "00"', () => {
    const buf = new Uint8Array([0x00]).buffer;
    expect(bufferToHex(buf)).toBe('00');
  });
  it('[0xde, 0xad, 0xbe, 0xef] → "deadbeef"', () => {
    const buf = new Uint8Array([0xde, 0xad, 0xbe, 0xef]).buffer;
    expect(bufferToHex(buf)).toBe('deadbeef');
  });
  it('[0xff] → "ff"', () => {
    expect(bufferToHex(new Uint8Array([0xff]).buffer)).toBe('ff');
  });
});

describe('hashBufferMD5', () => {
  it('empty buffer → d41d8cd98f00b204e9800998ecf8427e', () => {
    expect(hashBufferMD5(new ArrayBuffer(0))).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });
  it("'hello' → 5d41402abc4b2a76b9719d911017c592", () => {
    expect(hashBufferMD5(enc.encode('hello').buffer)).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  it("'abc' → 900150983cd24fb0d6963f7d28e17f72", () => {
    expect(hashBufferMD5(enc.encode('abc').buffer)).toBe('900150983cd24fb0d6963f7d28e17f72');
  });
});

describe('hashBufferSHA', () => {
  it('SHA-256, empty buffer → e3b0c442...', async () => {
    const h = await hashBufferSHA(new ArrayBuffer(0), 'SHA-256');
    expect(h).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
  it("SHA-256, 'hello' → 2cf24dba...", async () => {
    const h = await hashBufferSHA(enc.encode('hello').buffer, 'SHA-256');
    expect(h).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });
  it("SHA-512, 'abc' → starts with ddaf35a193617aba", async () => {
    const h = await hashBufferSHA(enc.encode('abc').buffer, 'SHA-512');
    expect(h.startsWith('ddaf35a193617aba')).toBe(true);
  });
  it("SHA-1, 'hello' → aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d", async () => {
    const h = await hashBufferSHA(enc.encode('hello').buffer, 'SHA-1');
    expect(h).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  });
});

describe('hashFile', () => {
  it('returns lowercase hex string for MD5', async () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    const file = new File([blob], 'test.txt');
    const h = await hashFile(file, 'MD5');
    expect(h).toMatch(/^[0-9a-f]{32}$/);
  });

  it('returns lowercase hex string for SHA-256', async () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    const file = new File([blob], 'test.txt');
    const h = await hashFile(file, 'SHA-256');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('resolves with correct MD5 for a known small Blob', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    const file = new File([blob], 'hello.txt');
    const h = await hashFile(file, 'MD5');
    expect(h).toBe('5d41402abc4b2a76b9719d911017c592');
  });
});
