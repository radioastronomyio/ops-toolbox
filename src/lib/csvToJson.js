import Papa from 'papaparse';

export function parseCsvString(csvString, options = {}) {
  const defaults = { header: true, skipEmptyLines: true, dynamicTyping: true };
  const config = { ...defaults, ...options };
  return Papa.parse(csvString, config);
}

export function toJsonString(data, indent = 2) {
  return JSON.stringify(data, null, indent);
}

export function detectDelimiter(sample) {
  const candidates = [',', ';', '\t', '|'];
  let best = ',';
  let bestCount = -1;
  for (const delim of candidates) {
    const count = sample.split(delim).length - 1;
    if (count > bestCount) { bestCount = count; best = delim; }
  }
  return best;
}
