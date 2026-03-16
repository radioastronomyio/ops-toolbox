import cronstrue from 'cronstrue';

export function describeExpression(expr) {
  if (!expr || !expr.trim()) return { description: '', error: 'Empty expression' };
  try {
    const description = cronstrue.toString(expr, { throwExceptionOnParseError: true });
    return { description, error: null };
  } catch (e) {
    return { description: '', error: e.message || String(e) };
  }
}

export function parseFields(expr) {
  if (!expr || typeof expr !== 'string') return null;
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) return null;
  const [minute, hour, dom, month, dow] = fields;
  return { minute, hour, dom, month, dow };
}

export function isValidExpression(expr) {
  return describeExpression(expr).error === null;
}

export function getNextRuns(expr, n, fromDate = new Date()) {
  if (!isValidExpression(expr)) return [];
  const fields = parseFields(expr);
  if (!fields) return [];

  const results = [];
  const MAX_MINUTES = 60 * 24 * 365 * 4; // 4 years
  let current = new Date(fromDate);
  // Advance to next minute boundary
  current.setSeconds(0, 0);
  current = new Date(current.getTime() + 60000);

  for (let i = 0; i < MAX_MINUTES && results.length < n; i++) {
    if (matchesCron(current, fields)) {
      results.push(new Date(current));
    }
    current = new Date(current.getTime() + 60000);
  }
  return results;
}

function matchesCron(date, fields) {
  const minute = date.getUTCMinutes();
  const hour = date.getUTCHours();
  const dom = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const dow = date.getUTCDay();

  return (
    matchField(fields.minute, minute, 0, 59) &&
    matchField(fields.hour, hour, 0, 23) &&
    matchField(fields.dom, dom, 1, 31) &&
    matchField(fields.month, month, 1, 12) &&
    matchField(fields.dow, dow, 0, 7, true)
  );
}

function matchField(field, value, min, max, isDow = false) {
  if (field === '*') return true;

  // Step values: */n
  if (field.startsWith('*/')) {
    const step = parseInt(field.slice(2));
    return (value - min) % step === 0;
  }

  // Range: a-b
  if (field.includes('-') && !field.includes(',')) {
    const [a, b] = field.split('-').map(Number);
    if (isDow && value === 0) return a === 0 || b >= 7;
    return value >= a && value <= b;
  }

  // List: a,b,c
  if (field.includes(',')) {
    return field.split(',').some(f => matchField(f.trim(), value, min, max, isDow));
  }

  // Named days (MON-FRI etc) - basic numeric only for simplicity
  const n = parseInt(field);
  if (isDow && n === 7) return value === 0;
  return value === n;
}
