/**
 * @file mac.js
 * @description MAC address normalization and OUI (first 3 octets) extraction for vendor lookup
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

/**
 * Normalize any MAC format to colon-separated uppercase.
 * Accepts: AA:BB:CC:DD:EE:FF, AA-BB-CC-DD-EE-FF, AABB.CCDD.EEFF (Cisco), AABBCCDDEEFF
 * Returns uppercase colon-separated or null if invalid.
 */
export function normalizeMac(input) {
  if (!input || typeof input !== 'string') return null;

  // Strip common separators and try to get 12 hex chars
  let hex = input.trim();

  // Format: AABB.CCDD.EEFF (Cisco dot notation)
  if (/^[0-9a-fA-F]{4}\.[0-9a-fA-F]{4}\.[0-9a-fA-F]{4}$/.test(hex)) {
    hex = hex.replace(/\./g, '');
  }
  // Format: AA:BB:CC:DD:EE:FF or AA-BB-CC-DD-EE-FF
  else if (/^[0-9a-fA-F]{2}[:\-][0-9a-fA-F]{2}[:\-][0-9a-fA-F]{2}[:\-][0-9a-fA-F]{2}[:\-][0-9a-fA-F]{2}[:\-][0-9a-fA-F]{2}$/.test(hex)) {
    hex = hex.replace(/[:\-]/g, '');
  }
  // Format: AABBCCDDEEFF (raw 12 hex chars)
  else if (/^[0-9a-fA-F]{12}$/.test(hex)) {
    // already clean
  } else {
    return null;
  }

  if (hex.length !== 12) return null;
  if (!/^[0-9a-fA-F]{12}$/.test(hex)) return null;

  // Format as AA:BB:CC:DD:EE:FF uppercase
  return hex.toUpperCase().match(/.{2}/g).join(':');
}

/** Extract OUI prefix (first 3 octets) from a normalized MAC */
export function extractOUI(normalizedMac) {
  if (!normalizedMac) return null;
  const parts = normalizedMac.split(':');
  if (parts.length < 3) return null;
  return parts.slice(0, 3).join(':');
}

/** Validate MAC address format */
export function isValidMac(input) {
  return normalizeMac(input) !== null;
}
