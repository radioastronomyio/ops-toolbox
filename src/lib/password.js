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
  // Build charset from options
  const charset = buildCharset(options);
  if (!charset) {
    throw new Error('At least one character set must be enabled');
  }

  // Generate random values
  const randomValues = window.crypto.getRandomValues(new Uint8Array(length));

  // Build password from random values
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomValue = randomValues[i] % charset.length;
    password += charset[randomValue];
  }

  return password;
}

/**
 * Calculates the entropy of a password in bits
 * @param {number} length - Password length
 * @param {string} charset - Character set string
 * @returns {number} Entropy in bits
 */
export function calculateEntropy(length, poolSize) {
  if (length === 0 || !poolSize) return 0;
  return Math.floor(length * Math.log2(poolSize));
}

export function generatePassphrase(wordCount, separator = '-', capitalize = false) {
  const wordlist = EFF_SHORT_WORDLIST;
  const randomValues = new Uint32Array(wordCount);
  crypto.getRandomValues(randomValues);

  const words = Array.from(randomValues).map(val => {
    const word = wordlist[val % wordlist.length];
    return capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
  });

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
