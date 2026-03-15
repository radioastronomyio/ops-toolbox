/**
 * Encodes a text string to Base64 using UTF-8 encoding
 * @param {string} text - Text to encode
 * @returns {string} Base64 encoded string
 */
export function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

/**
 * Decodes a Base64 string to text using UTF-8 encoding
 * @param {string} base64String - Base64 string to decode
 * @returns {string} Decoded text
 * @throws {Error} If the Base64 string is invalid
 */
export function decodeBase64(base64String) {
  try {
    const binary = atob(base64String);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (error) {
    throw new Error('Invalid Base64 string — contains characters outside the Base64 alphabet.');
  }
}
