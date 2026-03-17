/**
 * @file url-parser.js
 * @description URL component parsing via the native URL API
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

/**
 * Parse a URL string into a structured object.
 * Returns null if URL is invalid. Masks password field for safety.
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
