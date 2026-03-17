# 05 — Registry Metadata Fields and Directory Badges

## Objective

Extend `src/lib/toolRegistry.js` (created in spec 02) with capability metadata fields so the app can honestly surface which tools are local-only vs. online, which are beta, and which work offline. Then update `DirectoryGrid.jsx` to display badges based on this metadata.

This addresses the core architectural finding: the MAC Vendor Lookup tool calls an external API but the suite presents all tools as equivalent "100% client-side" utilities. Rather than removing the tool or rewriting docs, encode the distinction in the data model so the UI can communicate it.

## Registry Schema Extension

### New fields on each tool entry in `toolRegistry`

Add these fields to every entry in the `toolRegistry` array:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `processingMode` | `'local' \| 'remote' \| 'hybrid'` | `'local'` | Where computation happens. `'local'` = all in-browser. `'remote'` = calls an external API. `'hybrid'` = local with optional remote enhancement. |
| `offlineCapable` | `boolean` | `true` | Whether the tool works without internet. |
| `status` | `'stable' \| 'beta' \| 'experimental'` | `'stable'` | Maturity indicator. |

### Tool-by-tool metadata assignment

Most tools are `{ processingMode: 'local', offlineCapable: true, status: 'stable' }`. The exceptions:

| Tool ID | processingMode | offlineCapable | status | Reason |
|---------|---------------|----------------|--------|--------|
| `mac-lookup` | `'remote'` | `false` | `'stable'` | Calls `api.donfather.dev` for OUI data |
| `ssh-keygen` | `'local'` | `true` | `'beta'` | Uses node-forge in-browser, may have edge cases |

All other tools get the defaults. If a tool's entry omits these fields, the UI should treat it as `{ processingMode: 'local', offlineCapable: true, status: 'stable' }`.

### Implementation in `toolRegistry.js`

Add the fields directly to each object. For the 23 tools that are all-defaults, still include the fields explicitly — no implicit defaults in the data, only in the UI rendering logic. This makes the registry self-documenting.

Example entries:

```js
{
  id: 'subnet-calculator',
  name: 'Subnet Calculator',
  description: 'IPv4 CIDR arithmetic — network, broadcast, host range, and mask calculations.',
  path: 'subnet-calculator',
  category: 'Networking',
  componentPath: './tools/SubnetCalculator',
  processingMode: 'local',
  offlineCapable: true,
  status: 'stable',
},
{
  id: 'mac-lookup',
  name: 'MAC Vendor Lookup',
  description: 'Look up the manufacturer for a MAC address via OUI prefix.',
  path: 'mac-lookup',
  category: 'Networking',
  componentPath: './tools/MacVendorLookup',
  processingMode: 'remote',
  offlineCapable: false,
  status: 'stable',
},
{
  id: 'ssh-keygen',
  name: 'SSH Keypair Generator',
  description: 'Generate RSA SSH keypairs in-browser using node-forge. Private key stays on your device.',
  path: 'ssh-keygen',
  category: 'Security',
  componentPath: './tools/SshKeyGenerator',
  processingMode: 'local',
  offlineCapable: true,
  status: 'beta',
},
```

### New helper in `toolRegistry.js`

```js
/**
 * Get tools that require network access.
 */
export function getRemoteTools() {
  return toolRegistry.filter(t => t.processingMode === 'remote' || t.processingMode === 'hybrid');
}

/**
 * Get tools by status.
 */
export function getToolsByStatus(status) {
  return toolRegistry.filter(t => t.status === status);
}
```

## UI Changes: `src/components/DirectoryGrid.jsx`

Add small badges to tool cards based on the metadata. Badges should be subtle — not distracting — but clearly communicate the distinction.

### Badge rendering

Add a badge row between the tool name and description in each card:

```jsx
<Link to={tool.path} key={tool.path} className="...existing classes...">
  <h3 className="...existing classes...">{tool.name}</h3>
  <div className="flex gap-1.5 mb-1.5">
    {tool.processingMode === 'remote' && (
      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-900/40 text-amber-400 border border-amber-700/50">
        Online
      </span>
    )}
    {tool.processingMode === 'hybrid' && (
      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-900/40 text-blue-400 border border-blue-700/50">
        Online Optional
      </span>
    )}
    {tool.status === 'beta' && (
      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-900/40 text-purple-400 border border-purple-700/50">
        Beta
      </span>
    )}
  </div>
  <p className="...existing classes...">{tool.description}</p>
</Link>
```

**Design rules:**
- `processingMode: 'local'` → no badge (the default expectation, no need to label it)
- `processingMode: 'remote'` → amber "Online" badge
- `processingMode: 'hybrid'` → blue "Online Optional" badge
- `status: 'beta'` → purple "Beta" badge
- `status: 'experimental'` → red "Experimental" badge (not currently used, but support it)
- `status: 'stable'` → no badge
- `offlineCapable` → not shown as a badge directly, but could be used in a future tooltip or tool detail page
- If no badges apply, don't render the badge container div (avoid empty margins)

### Conditional badge container

Only render the badge `<div>` if at least one badge would be shown:

```jsx
const showBadges = tool.processingMode !== 'local' || tool.status !== 'stable';
```

## Tests: Update `tests/lib/toolRegistry.test.js`

Add to the existing registry tests from spec 02:

```
describe('toolRegistry — metadata fields')
  - every tool has processingMode field with value 'local', 'remote', or 'hybrid'
  - every tool has offlineCapable field (boolean)
  - every tool has status field with value 'stable', 'beta', or 'experimental'
  - mac-lookup has processingMode 'remote' and offlineCapable false
  - ssh-keygen has status 'beta'
  - all other tools have processingMode 'local'

describe('getRemoteTools')
  - returns only tools with remote or hybrid processingMode
  - includes mac-lookup
  - does not include subnet-calculator

describe('getToolsByStatus')
  - returns tools matching the given status
  - returns empty array for unused status values
```

## Tests: Update `tests/components/DirectoryGrid.test.jsx`

If this test file doesn't exist, create it. If it does, add:

```
describe('DirectoryGrid — badges')
  - renders "Online" badge for MAC Vendor Lookup card
  - renders "Beta" badge for SSH Keypair Generator card
  - does not render badges for Subnet Calculator card (all defaults)
  - badge container is not rendered when no badges apply
```

Use `MemoryRouter` wrapper for routing context.

## Do NOT

- Do not modify any tool component files — this spec only touches the registry and directory
- Do not add tooltips or detail pages — those are future work
- Do not change the MAC Vendor Lookup behavior — just label it honestly
- Do not remove the "100% client-side" messaging from AGENTS.md or docs — add a nuance once docs are written (e.g., "all tools process locally except those marked 'Online'")

## Done Criteria

- `npm run test` — all tests pass
- Every entry in `toolRegistry` has `processingMode`, `offlineCapable`, and `status` fields
- MAC Vendor Lookup card shows an "Online" badge in the directory
- SSH Keypair Generator card shows a "Beta" badge in the directory
- Subnet Calculator card (and other all-default tools) show no badges
- `getRemoteTools()` and `getToolsByStatus()` work correctly
- Badge styling is subtle and consistent with the dark-mode design
