# 08 — X.509 Certificate Parser

## Objective

Parse PEM-encoded X.509 certificates and display their metadata: subject, issuer, validity dates, serial number, signature algorithm, public key info, and extensions.

## Route

`/x509-parser`

## Dependencies

- `pkijs` — X.509 certificate parsing (ASN.1/DER decoder)
- `asn1js` — peer dependency of pkijs

Install: `npm install pkijs asn1js`

## Architecture

### Pure logic: `src/lib/x509.js`

```js
// Parse a PEM string into a structured certificate object
// Returns: { subject, issuer, serialNumber, validFrom, validTo, signatureAlgorithm, publicKeyAlgorithm, publicKeySize, extensions[], fingerprint }
// Returns null or throws on invalid input
export function parseCertificate(pemString) { ... }

// Extract PEM body (strip headers, decode base64 to ArrayBuffer)
export function pemToArrayBuffer(pem) { ... }

// Format a distinguished name (DN) object into a readable string
export function formatDN(dn) { ... }
```

### React component: `src/tools/X509Parser.jsx`

## Inputs

- **PEM textarea** — large, accepts paste of PEM-encoded certificate (-----BEGIN CERTIFICATE-----)
- **Upload** button — accepts .pem, .crt, .cer files via file input
- Default: empty (prompt user to paste or upload)

## Outputs

Display parsed certificate fields in organized sections:

**Identity:**
- Subject (CN, O, OU, etc.)
- Issuer (CN, O, OU, etc.)
- Serial Number

**Validity:**
- Not Before (formatted date)
- Not After (formatted date)
- Status: "Valid" / "Expired" / "Not Yet Valid" based on current date

**Cryptography:**
- Signature Algorithm (e.g., SHA256withRSA)
- Public Key Algorithm (e.g., RSA)
- Public Key Size (e.g., 2048 bits)

**Extensions** (if present):
- List key extensions (Basic Constraints, Key Usage, Subject Alt Names, etc.)

## Behavior

- Parse on paste/upload
- Invalid PEM shows error: "Could not parse certificate. Ensure it's a valid PEM-encoded X.509 certificate."
- Auto-detect if the pasted text includes the PEM headers or is raw base64

## Tests: `tests/lib/x509.test.js`

```
describe('pemToArrayBuffer')
  - valid PEM with headers → returns ArrayBuffer
  - strips BEGIN/END CERTIFICATE lines correctly
  - empty string → throws or returns null

describe('formatDN')
  - formats common DN fields into readable string
```

Note: Full certificate parsing requires valid test certificates. Include a test PEM constant (a self-signed cert generated for testing). Test that `parseCertificate` extracts subject, issuer, and dates from it.

## Tests: `tests/tools/X509Parser.test.jsx`

```
- renders without crashing
- shows textarea for PEM input
- shows upload button
- displays error for invalid PEM input
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/x509-parser`
- Pasting a valid PEM certificate displays all parsed fields
- Invalid input shows clear error message
