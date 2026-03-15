# 13 — SQL Query Formatter

## Objective

Paste-and-format SQL tool that pretty-prints and indents SQL queries for readability. Uses `sql-formatter` which supports multiple SQL dialects including PostgreSQL, MySQL, T-SQL (SQL Server), BigQuery, SQLite, and standard SQL. Useful for formatting minified queries, cleaning up auto-generated SQL, or preparing queries for documentation.

## Route

`/sql-formatter`

## Dependencies

```
npm install sql-formatter
```

- `sql-formatter` — multi-dialect SQL pretty-printer with configurable indentation

## Architecture

### Pure logic file: `src/lib/sqlFormat.js`

```js
// Format a SQL string using sql-formatter.
// dialect: 'sql' | 'postgresql' | 'mysql' | 'tsql' | 'bigquery' | 'sqlite'
// options: { tabWidth: number, useTabs: boolean, keywordCase: 'upper'|'lower'|'preserve' }
// Returns formatted SQL string, or throws on hard parse error
export function formatSql(sql, dialect, options) { ... }

// Check if a string appears to be SQL (basic heuristic).
// Returns boolean
export function looksLikeSql(str) { ... }
```

### React component: `src/tools/SqlFormatter.jsx`

Split layout: input textarea (top/left) and formatted output (bottom/right).

## Inputs

- **SQL input textarea** — large, monospace, placeholder with sample minified query
- **Dialect selector** — dropdown: SQL (Standard), PostgreSQL, MySQL, T-SQL, BigQuery, SQLite (default: SQL)
- **Indent size** — dropdown: 2 spaces, 4 spaces, tab (default: 2 spaces)
- **Keyword case** — dropdown: UPPERCASE, lowercase, preserve (default: UPPERCASE)
- **Format button**

## Outputs

- **Formatted SQL** — monospace code block, syntax-highlighted if possible (plain monospace fallback)
- **Copy button** — copies formatted SQL to clipboard
- **Line count** — "X lines" shown in output panel header
- **Error message** — if sql-formatter throws, show inline error: "Could not format: [message]"

## Behavior

- Formatting triggered by button click
- Also auto-formats on dialect/option change if input is non-empty (debounced 300 ms)
- Empty input shows placeholder text in output panel: "Formatted SQL will appear here"
- Ctrl+Enter keyboard shortcut triggers format
- Copy button shows brief "Copied!" confirmation
- Output textarea is read-only with horizontal scroll for long lines

## Tests: `tests/lib/sqlFormat.test.js`

```
describe('looksLikeSql')
  - 'SELECT * FROM users' → true
  - 'INSERT INTO foo VALUES (1)' → true
  - 'hello world' → false
  - '' → false
  - 'UPDATE orders SET status=1 WHERE id=5' → true

describe('formatSql')
  - 'select * from users where id=1' with dialect 'sql', UPPERCASE keywords
    → starts with 'SELECT\n  *\nFROM\n  users\nWHERE\n  id = 1'
    (exact whitespace may vary — assert includes 'SELECT' and 'FROM' and 'WHERE' uppercased)
  - 'SELECT   *   FROM   foo' → normalized whitespace, no extra spaces
  - keyword case 'lower': 'SELECT * FROM t' → output starts with 'select'
  - keyword case 'upper': 'select * from t' → output starts with 'SELECT'
  - tabWidth 4: indentation is 4 spaces
  - empty string → returns empty string (no throw)
```

## Tests: `tests/tools/SqlFormatter.test.jsx`

```
- renders without crashing
- SQL input textarea is present
- dialect selector dropdown is present
- Format button is present
- Copy button is present in output area
- keyword case selector is present
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/sql-formatter`
- Pasting a minified SQL query and clicking Format produces readable, indented output
- Dialect and keyword case options apply correctly
- Copy button copies formatted output to clipboard
