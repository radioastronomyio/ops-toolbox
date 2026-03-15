# 07 — SSH Keypair Generator

## Objective

Generate RSA SSH keypairs entirely in the browser using node-forge. Output private key in PEM format and public key in OpenSSH format.

## Route

`/ssh-keygen`

## Dependencies

- `node-forge` — pure JS RSA key generation and PEM/OpenSSH serialization

Install: `npm install node-forge`

## Architecture

### React component: `src/tools/SshKeyGenerator.jsx`

No separate lib file — node-forge handles the crypto. The component manages the generation flow.

## Inputs

- **Key Size** selector: 2048-bit (default), 4096-bit
- **Comment** text input — appended to the public key (default: `ops-toolbox-local`)
- **Generate** button

## Outputs

- **Private Key** — read-only textarea, PEM format (PKCS#1)
- **Public Key** — read-only textarea, OpenSSH format (`ssh-rsa AAAA... comment`)
- **Copy** buttons for each key
- **Sensitivity warning** on the private key: "Treat this key as highly sensitive"

## Behavior

- Key generation is CPU-intensive. Show "Generating... (this may take a few seconds)" loading state.
- Use `setTimeout` to defer generation, allowing the UI to update before the blocking computation.
- 4096-bit keys may take 5-15 seconds — warn the user.
- Do NOT auto-generate on mount. User must click Generate.
- After generation, both textareas populate.

## Tests: `tests/tools/SshKeyGenerator.test.jsx`

```
- renders without crashing
- shows key size selector with 2048 and 4096 options
- shows Generate button
- does not auto-generate on mount (textareas are empty initially)
```

Note: Actual key generation is too slow for unit tests. Do not test the generation itself — test the UI structure and state management only. Integration testing of node-forge key generation is out of scope.

## Done Criteria

- `npm run test` — all pass
- Component renders at `/ssh-keygen`
- Clicking Generate produces valid PEM private key and OpenSSH public key
- Loading state displays during generation
- Copy buttons work
