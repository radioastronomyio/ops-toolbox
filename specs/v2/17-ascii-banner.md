# 17 — ASCII Text Art Banner

## Objective

Generates terminal-style ASCII art text banners from user input using `figlet`. Supports multiple figlet fonts, adjustable width, and horizontal alignment. Output can be copied for use in scripts, READMEs, Slack messages, or terminal welcome screens.

## Route

`/ascii-banner`

## Dependencies

```
npm install figlet
```

- `figlet` — ASCII art text generator with bundled fonts

## Architecture

### Pure logic file: `src/lib/asciiBanner.js`

```js
// Generate ASCII art text using figlet.
// font: string (figlet font name, e.g., 'Standard', 'Big', 'Slant')
// options: { width: number, horizontalLayout: 'default'|'full'|'fitted'|'controlled smushing'|'universal smushing' }
// Returns Promise<string> — ASCII art string
export async function generateBanner(text, font, options) { ... }

// Get list of available font names bundled with figlet.
// Returns Array<string>
export function getAvailableFonts() { ... }
```

### React component: `src/tools/AsciiBanner.jsx`

## Inputs

- **Text input** — single-line text field, max 50 characters, placeholder: `Hello World`
- **Font selector** — searchable dropdown of available figlet fonts. Prominent presets as quick-select buttons: Standard, Big, Slant, Banner, Block, Doom, Larry 3D, ANSI Shadow
- **Width** — number input, default: 80 (range: 40–200)
- **Horizontal layout** — dropdown: Default, Full, Fitted (default: Default)

## Outputs

- **ASCII art output** — monospace `<pre>` block, horizontally scrollable if wider than viewport
- **Character count** — "X lines, Y characters" shown below output
- **Copy button** — copies raw ASCII art string to clipboard
- **Download .txt button** — downloads as `banner.txt`

## Behavior

- Banner regenerates automatically as user types (debounced 300 ms) or changes font/options
- Empty input shows placeholder output in a dimmed style using "Hello World"
- Font selector: quick-select buttons shown above the full dropdown
- figlet fonts are bundled with the npm package — no fetch calls required
- Long text that exceeds width wraps or overflows depending on figlet behavior (pass-through)
- Copy and Download show brief confirmations
- Output pre block uses `overflow-x: auto` and `whitespace: pre`

## Tests: `tests/lib/asciiBanner.test.js`

```
describe('getAvailableFonts')
  - returns an array with length > 0
  - array includes 'Standard'
  - array includes 'Big'
  - all entries are non-empty strings

describe('generateBanner')
  - 'Hi', font 'Standard' → resolves to a non-empty string
  - output contains multiple lines (includes '\n')
  - empty string '' → resolves to empty string or whitespace-only
  - invalid font name → rejects or resolves to error fallback (document behavior)
  - 'ABC', font 'Big' → output length > 'ABC'.length (ASCII art is larger than input)
```

## Tests: `tests/tools/AsciiBanner.test.jsx`

```
- renders without crashing
- text input field is present
- font selector dropdown is present
- preset font buttons (Standard, Big, Slant) are rendered
- Copy button is present
- Download button is present
- output pre block is present
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/ascii-banner`
- Typing text generates ASCII art in real-time
- Switching fonts updates the output
- Copy button copies correct ASCII art to clipboard
