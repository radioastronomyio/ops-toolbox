/**
 * @file chmod.js
 * @description Unix file permission conversion between octal, symbolic (rwx), and boolean representations
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

/** Convert octal string (e.g. "755") to permission object. Max valid octal is 777 (decimal 511). */
export function octalToPermissions(octalStr) {
  const n = parseInt(octalStr, 8);
  if (isNaN(n) || n < 0 || n > 511) return null;
  const bit = (val, shift) => !!(val & (1 << shift));
  const owner = { read: bit(n, 8), write: bit(n, 7), execute: bit(n, 6) };
  const group = { read: bit(n, 5), write: bit(n, 4), execute: bit(n, 3) };
  const other = { read: bit(n, 2), write: bit(n, 1), execute: bit(n, 0) };
  return { owner, group, other, octal: octalStr.padStart(3, '0'), symbolic: permissionsToSymbolic({ owner, group, other }) };
}

/** Convert boolean permission object back to octal. Each role maps to 3 bits (r=4, w=2, x=1). */
export function permissionsToOctal(perms) {
  const val = (p) => (p.read ? 4 : 0) + (p.write ? 2 : 0) + (p.execute ? 1 : 0);
  const n = val(perms.owner) * 64 + val(perms.group) * 8 + val(perms.other);
  return n.toString(8).padStart(3, '0');
}

export function permissionsToSymbolic(perms) {
  const s = (p) => (p.read ? 'r' : '-') + (p.write ? 'w' : '-') + (p.execute ? 'x' : '-');
  return s(perms.owner) + s(perms.group) + s(perms.other);
}

/** Parse a 9-char symbolic string like "rwxr-xr--" into boolean permission object */
export function symbolicToPermissions(symbolic) {
  if (!symbolic || symbolic.length !== 9) return null;
  const parse = (chars) => ({ read: chars[0] === 'r', write: chars[1] === 'w', execute: chars[2] === 'x' });
  const owner = parse(symbolic.slice(0, 3));
  const group = parse(symbolic.slice(3, 6));
  const other = parse(symbolic.slice(6, 9));
  return { owner, group, other };
}

export function octalToSymbolic(octalStr) {
  const perms = octalToPermissions(octalStr);
  return perms ? perms.symbolic : null;
}

export function symbolicToOctal(symbolic) {
  const perms = symbolicToPermissions(symbolic);
  if (!perms) return null;
  return permissionsToOctal(perms);
}
