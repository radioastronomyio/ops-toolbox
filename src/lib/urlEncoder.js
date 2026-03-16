export function encodeComponent(str) {
  if (!str) return '';
  return encodeURIComponent(str);
}

export function decodeComponent(str) {
  if (!str) return { decoded: '', error: null };
  try {
    return { decoded: decodeURIComponent(str), error: null };
  } catch (e) {
    return { decoded: '', error: e.message };
  }
}

export function parseUrl(urlString) {
  if (!urlString) return { error: 'Empty URL' };
  try {
    const url = new URL(urlString);
    const params = Object.fromEntries(url.searchParams);
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      params,
      error: null,
    };
  } catch (e) {
    return { error: e.message };
  }
}

export function buildUrl(base, params) {
  const url = new URL(base);
  Object.entries(params).forEach(([k, v]) => {
    if (k) url.searchParams.append(k, v);
  });
  return url.toString();
}

export function parseQueryString(qs) {
  if (!qs) return [];
  const s = qs.startsWith('?') ? qs.slice(1) : qs;
  if (!s) return [];
  // Parse manually to get raw encoded values
  const result = [];
  s.split('&').forEach(pair => {
    const eqIdx = pair.indexOf('=');
    const key = eqIdx === -1 ? pair : pair.slice(0, eqIdx);
    const encoded = eqIdx === -1 ? '' : pair.slice(eqIdx + 1);
    let decoded = '';
    try { decoded = decodeURIComponent(encoded.replace(/\+/g, ' ')); } catch { decoded = encoded; }
    let decodedKey = key;
    try { decodedKey = decodeURIComponent(key); } catch {}
    if (decodedKey) result.push({ key: decodedKey, encoded, decoded });
  });
  return result;
}
