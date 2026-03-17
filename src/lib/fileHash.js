/**
 * @file fileHash.js
 * @description File hashing (MD5, SHA-1, SHA-256, SHA-512) — MD5 via js-md5, SHA via Web Crypto subtle
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import md5 from 'js-md5';

export function bufferToHex(buffer) {
  if (!buffer || buffer.byteLength === 0) return '';
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hashBufferMD5(buffer) {
  return md5(new Uint8Array(buffer));
}

export async function hashBufferSHA(buffer, algorithm) {
  const subtle = (typeof crypto !== 'undefined' && crypto.subtle) ||
    (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle);
  if (!subtle) throw new Error('crypto.subtle not available');
  const hashBuffer = await subtle.digest(algorithm, buffer);
  return bufferToHex(hashBuffer);
}

/** Hash a File object. MD5 uses js-md5 (Web Crypto doesn't support MD5); SHA uses subtle.digest. */
export async function hashFile(file, algorithm) {
  const buffer = await file.arrayBuffer();
  if (algorithm === 'MD5') return hashBufferMD5(buffer);
  return hashBufferSHA(buffer, algorithm);
}
