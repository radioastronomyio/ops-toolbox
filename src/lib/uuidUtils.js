import { v4 as uuidv4, v7 as uuidv7, validate } from 'uuid';

export function generateV4() {
  return uuidv4();
}

export function generateV7() {
  return uuidv7();
}

export function generateBatch(version, n) {
  const gen = version === 'v7' ? generateV7 : generateV4;
  return Array.from({ length: n }, gen);
}

export function formatUuid(uuid, format) {
  switch (format) {
    case 'no-hyphens': return uuid.replace(/-/g, '');
    case 'uppercase': return uuid.toUpperCase();
    case 'uppercase-no-hyphens': return uuid.replace(/-/g, '').toUpperCase();
    default: return uuid;
  }
}

export function isValidUuid(str) {
  if (!str) return false;
  return validate(str);
}
