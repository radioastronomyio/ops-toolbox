# 01 — Subnet Calculator

## Objective

IPv4 subnet calculator. User enters a CIDR block, sees network parameters instantly.

## Route

`/subnet-calculator`

## Dependencies

**None.** Pure JavaScript bitwise arithmetic. Do NOT use `@cldn/ip` (doesn't exist on npm), `ip`, or any other npm package. IPv4 is 32-bit math — implement it directly.

## Architecture

### Pure logic: `src/lib/subnet.js`

Export these pure functions (no React, no DOM):

- `parseCIDR(cidrString)` — returns `{ ip: number, prefix: number }` or throws on invalid input
- `calculateSubnet(ip, prefix)` — returns `{ networkAddress, broadcastAddress, subnetMask, firstHost, lastHost, totalHosts, prefixLength }` with all addresses as strings
- `ipToString(ipInt)` — converts 32-bit integer to dotted quad string
- `stringToIP(ipStr)` — converts dotted quad to 32-bit integer

### React component: `src/tools/SubnetCalculator.jsx`

Imports from `src/lib/subnet.js`, handles UI state.

## Inputs

- Text input: CIDR notation string (e.g., `192.168.1.0/24`, `10.0.0.0/16`)
- Default value: `10.0.0.0/16`

## Computation

```
ip (32-bit integer) = octet1 << 24 | octet2 << 16 | octet3 << 8 | octet4
mask = (~0) << (32 - prefixLength) (unsigned)
networkAddress = ip & mask
broadcastAddress = networkAddress | ~mask
firstHost = networkAddress + 1
lastHost = broadcastAddress - 1
totalHosts = (broadcastAddress - networkAddress - 1) or 0 for /31, /32
```

Use `>>> 0` to force unsigned 32-bit when needed.

## Outputs (display as a card grid)

| Field | Value |
|-------|-------|
| Network Address | e.g., `10.0.0.0` |
| Broadcast Address | e.g., `10.0.255.255` |
| Subnet Mask | e.g., `255.255.0.0` |
| First Usable Host | e.g., `10.0.0.1` |
| Last Usable Host | e.g., `10.0.255.254` |
| Total Usable Hosts | e.g., `65,534` |
| Prefix Length | e.g., `/16` |

## Error Handling

If the CIDR string is malformed, show a red error banner: "Invalid CIDR notation."

Validate: 4 octets, each 0-255, prefix 0-32, contains exactly one `/`.

## UI Notes

- Use `useMemo` keyed on the CIDR input to cache computation
- Monospace font for all IP address values
- Highlight "Total Usable Hosts" card distinctly (sky/blue accent)
- Compute on every keystroke (lightweight enough, no debounce needed)

## Tests: `tests/lib/subnet.test.js`

Test the pure functions in `src/lib/subnet.js`:

```
describe('parseCIDR')
  - parseCIDR('192.168.1.0/24') → { ip: 3232235776, prefix: 24 }
  - parseCIDR('garbage') → throws
  - parseCIDR('256.0.0.0/24') → throws (invalid octet)
  - parseCIDR('10.0.0.0/33') → throws (invalid prefix)

describe('calculateSubnet')
  - /24: network 192.168.1.0, broadcast 192.168.1.255, mask 255.255.255.0, 254 hosts
  - /8: 10.0.0.0/8 → 16,777,214 hosts
  - /32: single host, 0 usable hosts
  - /16: 10.0.0.0/16 → network 10.0.0.0, broadcast 10.0.255.255, 65534 hosts

describe('ipToString')
  - 3232235776 → '192.168.1.0'
  - 0 → '0.0.0.0'
  - 4294967295 → '255.255.255.255'

describe('stringToIP')
  - '192.168.1.0' → 3232235776
  - round-trip: stringToIP(ipToString(n)) === n
```

## Tests: `tests/tools/SubnetCalculator.test.jsx`

Render the component with React Testing Library:

```
- renders without crashing
- displays default value (10.0.0.0/16) results on mount
- shows error message for invalid input
- displays correct number of result cards (7 fields)
```

## Done Criteria

- `npm run test -- tests/lib/subnet.test.js` — all pass
- `npm run test -- tests/tools/SubnetCalculator.test.jsx` — all pass
- Component renders and computes correctly at `/subnet-calculator`
