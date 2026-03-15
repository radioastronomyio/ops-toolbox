export function detectUnit(numericStr) {
  if (!numericStr) return 'seconds';
  const n = numericStr.replace(/^-/, '');
  return n.length >= 11 ? 'milliseconds' : 'seconds';
}

export function fromEpoch(value) {
  if (value === '' || value === null || value === undefined) return { error: 'Empty input' };
  const n = Number(value);
  if (isNaN(n)) return { error: 'Not a number' };
  const unit = detectUnit(String(Math.abs(n)));
  const ms = unit === 'milliseconds' ? n : n * 1000;
  const date = new Date(ms);
  if (isNaN(date.getTime())) return { error: 'Invalid date' };
  return { date, unit, error: null };
}

export function toEpoch(date) {
  const ms = date.getTime();
  return { seconds: Math.floor(ms / 1000), milliseconds: ms };
}

export function formatInTimezone(date, timezone) {
  if (!date || isNaN(date.getTime())) return '';
  try {
    const tz = timezone === 'local' ? undefined : timezone;
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    }).format(date);
  } catch {
    return date.toUTCString();
  }
}

export function parseHumanDate(str) {
  if (!str || !str.trim()) return { error: 'Empty input' };
  const d = new Date(str);
  if (isNaN(d.getTime())) return { error: 'Invalid date format' };
  return { date: d, error: null };
}
