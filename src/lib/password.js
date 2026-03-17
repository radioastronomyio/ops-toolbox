import { EFF_SHORT_WORDLIST } from './wordlist.js';

/**
 * Character pools for password generation
 */
const POOLS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numeric: '0123456789',
  special: '!@#$%^&*()_+-={}|;:,.<>?'
};

/**
 * Generates a random password using Web Crypto API
 * @param {number} length - Desired password length
 * @param {object} options - { uppercase, lowercase, numeric, special } booleans
 * @returns {string} Generated password
 */
export function generatePassword(length, options) {
  const charset = buildCharset(options);
  if (!charset) {
    throw new Error('At least one character set must be enabled');
  }

  const poolSize = charset.length;
  // Largest multiple of poolSize that fits in a Uint8 (0–255)
  const maxValid = 256 - (256 % poolSize);

  let password = '';
  while (password.length < length) {
    const randomValues = window.crypto.getRandomValues(new Uint8Array(length * 2));
    for (let i = 0; i < randomValues.length && password.length < length; i++) {
      if (randomValues[i] < maxValid) {
        password += charset[randomValues[i] % poolSize];
      }
      // else: reject this byte, try next
    }
  }

  return password;
}

/**
 * Calculates the entropy of a password in bits
 * @param {number} length - Password length
 * @param {number} poolSize - Number of possible characters in the pool
 * @returns {number} Entropy in bits
 */
export function calculateEntropy(length, poolSize) {
  if (length === 0 || !poolSize) return 0;
  return Math.floor(length * Math.log2(poolSize));
}

export function generatePassphrase(wordCount, separator = '-', capitalize = false) {
  const wordlist = EFF_SHORT_WORDLIST;
  const poolSize = wordlist.length;
  // Largest multiple of poolSize that fits in a Uint32 (0–4294967295)
  const maxValid = 4294967296 - (4294967296 % poolSize);

  const words = [];
  while (words.length < wordCount) {
    const randomValues = window.crypto.getRandomValues(new Uint32Array(wordCount * 2));
    for (let i = 0; i < randomValues.length && words.length < wordCount; i++) {
      if (randomValues[i] < maxValid) {
        let word = wordlist[randomValues[i] % poolSize];
        if (capitalize) word = word.charAt(0).toUpperCase() + word.slice(1);
        words.push(word);
      }
    }
  }

  return words.join(separator);
}

export function calculatePassphraseEntropy(wordCount, wordlistSize) {
  if (wordCount === 0 || !wordlistSize) return 0;
  return Math.floor(wordCount * Math.log2(wordlistSize));
}

/**
 * Builds a character set from options
 * @param {object} options - { uppercase, lowercase, numeric, special } booleans
 * @returns {string} Concatenated character set string, or null if all disabled
 */
export function buildCharset(options) {
  if (!options.uppercase && !options.lowercase && !options.numeric && !options.special) {
    return null;
  }

  let charset = '';
  if (options.uppercase) charset += POOLS.uppercase;
  if (options.lowercase) charset += POOLS.lowercase;
  if (options.numeric) charset += POOLS.numeric;
  if (options.special) charset += POOLS.special;

  return charset;
}
