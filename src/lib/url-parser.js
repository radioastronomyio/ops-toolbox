/**
 * Parse a URL string into a structured object.
 * Returns null if URL is invalid.
 */
export function parseURL(urlString) {
  if (!urlString || typeof urlString !== 'string' || !urlString.trim()) return null;
  try {
    const url = new URL(urlString.trim());
    return {
      href: url.href,
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || '(default)',
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      origin: url.origin,
      username: url.username,
      password: url.password ? '••••••' : '',
      searchParams: Object.fromEntries(url.searchParams),
    };
  } catch {
    return null;
  }
}
