# 01 — Visual Subnet Calculator v2

## Objective

Replace the existing simple subnet calculator with an interactive visual subnet designer. Users input a network/CIDR, then split and join subnets visually. IPv4 only for this version.

This is inspired by [visualsubnetcalc.com](https://www.visualsubnetcalc.com/) — interactive split/join with color coding, notes, and host counts.

## Route

`/subnet-calculator` (replaces existing)

## Dependencies

**None.** All IPv4 subnet math is pure bitwise arithmetic on 32-bit integers. No external libraries.

## Architecture

### Pure logic: `src/lib/subnet.js` (rewrite)

This file already exists with basic subnet functions. **Rewrite it** to support the split/join tree model.

#### Core data model

A subnet tree is a recursive structure:

```js
// A SubnetNode represents one block in the visual tree
{
  network: 167772160,     // uint32 network address (e.g., 10.0.0.0)
  prefix: 16,             // CIDR prefix length
  color: null,            // user-assigned color string or null
  note: '',               // user-assigned note string
  children: null,         // null = leaf node, [SubnetNode, SubnetNode] = split
}
```

#### Exported pure functions

```js
// Convert dotted-quad string to uint32
export function ipToUint32(ip) { ... }

// Convert uint32 to dotted-quad string
export function uint32ToIp(num) { ... }

// Calculate subnet details from network (uint32) and prefix
export function getSubnetInfo(network, prefix) {
  // Returns: { network, prefix, networkStr, broadcastStr, firstHostStr, lastHostStr, netmask, hosts, broadcast }
  // hosts = 2^(32-prefix) - 2 for prefix <= 30, special cases for /31 (2) and /32 (1)
}

// Split a leaf node into two children (prefix + 1)
// Returns a new node with two children, or null if prefix >= 32
export function splitSubnet(node) { ... }

// Join a node's children back into a leaf
// Returns a new node with children = null
export function joinSubnet(node) { ... }

// Flatten the tree into an ordered array of leaf nodes for table rendering
export function flattenTree(node) { ... }

// Parse "10.0.0.0/16" string into { network: uint32, prefix: number }
export function parseCIDR(cidr) { ... }

// Create initial root node from CIDR string
export function createRootNode(cidr) { ... }
```

### React component: `src/tools/SubnetCalculator.jsx` (rewrite)

Replaces the existing file entirely.

## UI Layout

### Top section: Network input

- **Network Address** text input (e.g., `10.0.0.0`)
- **/ Prefix** text input (e.g., `16`)
- **Go** button — creates a new root node, resets the tree
- Input validation: reject invalid IPs, prefix must be 0–32, network must be properly aligned to prefix

### Main section: Subnet table

A table showing all **leaf nodes** of the subnet tree, rendered top to bottom in network address order.

| Column | Content |
|--------|---------|
| Subnet Address | `10.0.0.0/16` — the CIDR notation |
| Range of Addresses | `10.0.0.0 – 10.0.255.255` — first to last (broadcast) |
| Usable IPs | `10.0.0.1 – 10.0.255.254` — first host to last host |
| Hosts | `65534` — number of usable hosts |
| Note | Editable text input — user types a label (e.g., "Production VLAN") |
| Split/Join | Button column — see below |

### Split/Join behavior

Each leaf row gets a **Split** button (right side of row). Clicking it:
- Splits that subnet into two children at prefix+1
- The row is replaced by two new rows
- Cannot split beyond /32

Each pair of sibling rows shows a **Join** button on the parent level. Clicking it:
- Merges two sibling subnets back into their parent
- Both rows replaced by one row at prefix-1
- Can only join if both children are leaf nodes (no nested splits)

### Color coding

Each row has a small **color indicator** (left edge or background tint). Users can click it to cycle through a preset palette (8 colors: blue, green, yellow, orange, red, purple, teal, gray). Color is purely visual — helps users organize subnets.

### Visual sizing (stretch goal)

Rows are proportionally sized by their address space. A /16 row is visually taller/wider than a /24 row. This can be a simple height proportion: `height = baseHeight * (2^(32-prefix) / 2^(32-rootPrefix))`. Minimum height so small subnets are still readable.

If proportional sizing is too complex, equal-height rows are acceptable for v1.

## State Management

The component maintains:
- `rootCIDR` — the input network/prefix as a string
- `tree` — the recursive SubnetNode tree (use `useState`)
- Color and note state lives inside the tree nodes

When the user splits/joins, create a new tree (immutable updates) and set state. Flatten the tree for rendering.

## Behavior

- On initial load, show `10.0.0.0/16` as the default network
- Table renders immediately with one row (the root subnet)
- Split/Join operations update instantly (no loading states needed)
- Notes are editable inline — just a text input in the table cell
- Color selection: clicking the color swatch cycles through the palette or opens a small dropdown

## Tests: `tests/lib/subnet.test.js` (rewrite)

```
describe('ipToUint32')
  - '0.0.0.0' → 0
  - '255.255.255.255' → 4294967295
  - '10.0.0.0' → 167772160
  - '192.168.1.1' → 3232235777

describe('uint32ToIp')
  - 0 → '0.0.0.0'
  - 4294967295 → '255.255.255.255'
  - 167772160 → '10.0.0.0'

describe('getSubnetInfo')
  - (167772160, 24) → network '10.0.0.0', broadcast '10.0.0.255', hosts 254
  - (167772160, 16) → network '10.0.0.0', broadcast '10.0.255.255', hosts 65534
  - (167772160, 32) → hosts 1, network = broadcast = first = last
  - (167772160, 31) → hosts 2

describe('parseCIDR')
  - '10.0.0.0/16' → { network: 167772160, prefix: 16 }
  - '192.168.1.128/25' → correct values
  - 'invalid' → throws or returns null

describe('splitSubnet')
  - splitting 10.0.0.0/16 → two children: 10.0.0.0/17 and 10.128.0.0/17
  - splitting a /32 → returns null (cannot split further)

describe('joinSubnet')
  - joining two /17 siblings → parent /16 restored
  - joining node with no children → returns unchanged

describe('flattenTree')
  - root with no children → [root]
  - root split once → [child1, child2] in order
  - root split, first child split again → [grandchild1, grandchild2, child2]

describe('createRootNode')
  - '10.0.0.0/16' → node with correct network, prefix 16, no children
```

## Tests: `tests/tools/SubnetCalculator.test.jsx`

```
- renders without crashing
- shows default network 10.0.0.0/16
- displays subnet table with one row initially
- split button exists on the row
- clicking split creates two rows
- host count is correct for displayed subnets
```

## Done Criteria

- `npm run test` — all subnet tests pass
- Component renders at `/subnet-calculator` with interactive split/join
- Splitting and joining subnets updates the table correctly
- Notes are editable inline
- Color coding is functional (at minimum: clickable color swatch per row)
