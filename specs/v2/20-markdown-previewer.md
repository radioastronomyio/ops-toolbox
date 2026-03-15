# 20 — Markdown Previewer

## Objective

Live Markdown editor with side-by-side preview. Uses `marked` to compile Markdown to HTML and `DOMPurify` to sanitize the output against XSS before injecting into the DOM. Supports GitHub Flavored Markdown (GFM) via marked's built-in GFM option. Useful for drafting documentation, READMEs, and runbooks locally.

## Route

`/markdown-previewer`

## Dependencies

```
npm install marked dompurify
```

- `marked` — fast Markdown-to-HTML compiler with GFM support
- `dompurify` — DOM-based XSS sanitizer for browser environments

## Architecture

### Pure logic file: `src/lib/markdownUtils.js`

```js
// Compile a Markdown string to sanitized HTML.
// options: { gfm: boolean, breaks: boolean }
// Returns sanitized HTML string (safe to inject with dangerouslySetInnerHTML)
export function renderMarkdown(markdown, options) { ... }

// Estimate reading time from raw markdown text.
// Returns string, e.g., '2 min read'
export function estimateReadTime(markdown) { ... }

// Count words in raw markdown text (strips markdown syntax for count).
// Returns number
export function countWords(markdown) { ... }
```

### React component: `src/tools/MarkdownPreviewer.jsx`

Split-pane layout: editor (left) and rendered preview (right). Panes can be resized or toggled.

## Inputs

- **Markdown editor textarea** — full-height, monospace, with line numbers optional. Default content: starter template showing heading, list, code block, table, and link examples.
- **Options bar:**
  - **GFM toggle** — GitHub Flavored Markdown (default: on) — enables tables, strikethrough, task lists
  - **Line breaks toggle** — treat single newlines as `<br>` (default: off)
- **View mode toggle** — Split (default), Editor only, Preview only
- **Clear button** — clears editor content

## Outputs

- **Rendered HTML preview** — right pane with prose styling (headings, lists, code blocks, tables styled with Tailwind typography or equivalent custom CSS classes)
- **Stats bar** — "X words · Y min read · Z lines"
- **Copy Markdown button** — copies raw Markdown source
- **Copy HTML button** — copies the sanitized rendered HTML string
- **Download .md button** — downloads markdown as `document.md`

## Behavior

- Preview updates in real-time as user types (debounced 150 ms)
- DOMPurify runs on every render — `<script>` tags, `onclick` attributes, and other XSS vectors are stripped
- GFM tables render as styled `<table>` elements in the preview
- GFM task lists (`- [ ] item`) render as disabled checkboxes
- Code blocks render with monospace font and a subtle background; no syntax highlighting (keep it simple)
- Split view uses CSS flex with 50/50 split; both panes independently scrollable
- Clear button requires a single click (no confirm dialog — content can be re-entered)

## Tests: `tests/lib/markdownUtils.test.js`

```
describe('renderMarkdown')
  - '# Hello' → contains '<h1' and 'Hello'
  - '**bold**' → contains '<strong>bold</strong>'
  - '_italic_' → contains '<em>italic</em>'
  - '[link](https://example.com)' → contains '<a href="https://example.com"'
  - '<script>alert(1)</script>' → output does NOT contain '<script'
  - 'Hello <img src=x onerror=alert(1)>' → output does NOT contain 'onerror'
  - GFM table: '| a | b |\n|---|---|\n| 1 | 2 |' with gfm:true → contains '<table'
  - '`code`' → contains '<code>code</code>'

describe('countWords')
  - '# Hello World\n\nThis is a test.' → 6
  - '' → 0
  - '**bold** and _italic_' → 3

describe('estimateReadTime')
  - 200-word string → '1 min read'
  - 400-word string → '2 min read'
  - '' → '0 min read'
```

## Tests: `tests/tools/MarkdownPreviewer.test.jsx`

```
- renders without crashing
- editor textarea is present
- preview pane is present
- GFM toggle is present and checked by default
- Copy Markdown button is present
- Copy HTML button is present
- view mode toggle buttons are present (Split, Editor, Preview)
- stats bar is present
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/markdown-previewer`
- Typing `# Hello` in the editor shows an `<h1>Hello</h1>` in the preview
- XSS vectors (`<script>`, `onerror`) are stripped from preview output
- GFM tables render correctly with GFM toggle enabled
- Copy HTML copies the sanitized HTML string
