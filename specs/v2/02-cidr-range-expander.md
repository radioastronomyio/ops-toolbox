# 02 — CIDR to IP Range Expander

## Objective

Expand a CIDR block into its full IP range, showing first/last addresses, total count, and optionally listing all IPs for small ranges.

## Route

`/cidr-expander`

## Dependencies

**None.** Reuses pure functions from `src/lib/subnet.js` (`ipToUint32`, `uint32ToIp`, `parseCIDR`, `getSubnetInfo`).

## Architecture

### Pure logic: `src/lib/subnet.js` (additions)

Add one function:

```js
// Expand a CIDR into an array of IP strings
// For ranges > 1024 IPs, returns null (too large to enumerate)
// For ranges <= 1024, returns full array
export function expandCIDR(cidr) {
  const parsed = parseCIDR(cidr);
  if (!parsed) return null;
  const info = getSubnetInfo(parsed.network, parsed.prefix);
  const totalIPs = Math.pow(2, 32 - parsed.prefix);
  if (totalIPs > 1024) return { ...info, totalIPs, ips: null }; // too many to list
  const ips = [];
  for (let i = 0; i < totalIPs; i++) {
    ips.push(uint32ToIp(parsed.network + i));
  }
  return { ...info, totalIPs, ips };
}
```

### React component: `src/tools/CidrExpander.jsx`

## Inputs

- **CIDR Input** — text field, e.g., `10.0.0.0/24`
- Live parsing as user types (debounce 300ms)

## Outputs

- **Summary card:** Network, broadcast, first/last host, total IPs, usable hosts
- **IP list:** If total IPs ≤ 1024, show a scrollable list of all IPs. Each IP on its own line in a monospace block. If > 1024, show message: "Range too large to enumerate (X IPs). Showing summary only."
- **Copy** button to copy the IP list to clipboard (only when list is shown)

## Behavior

- Parse on input change with 300ms debounce
- Invalid CIDR shows inline error
- Default input: `192.168.1.0/24`

## Tests: `tests/lib/subnet.test.js` (additions)

```
describe('expandCIDR')
  - '192.168.1.0/30' → 4 IPs listed, first is 192.168.1.0, last is 192.168.1.3
  - '10.0.0.0/24' → 256 IPs listed
  - '10.0.0.0/16' → ips is null (too large), totalIPs is 65536
  - invalid input → returns null
```

## Tests: `tests/tools/CidrExpander.test.jsx`

```
- renders without crashing
- displays summary for valid CIDR input
- shows "too large" message for wide ranges
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/cidr-expander`
- Small CIDR ranges show full IP enumeration
- Large ranges show summary only with appropriate message
