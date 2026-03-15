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

export async function hashFile(file, algorithm) {
  const buffer = await file.arrayBuffer();
  if (algorithm === 'MD5') return hashBufferMD5(buffer);
  return hashBufferSHA(buffer, algorithm);
}
