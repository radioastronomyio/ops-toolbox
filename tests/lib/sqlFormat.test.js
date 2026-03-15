import { describe, it, expect } from 'vitest';
import { formatSql, looksLikeSql } from '../../src/lib/sqlFormat.js';

describe('looksLikeSql', () => {
  it("'SELECT * FROM users' → true", () => expect(looksLikeSql('SELECT * FROM users')).toBe(true));
  it("'INSERT INTO foo VALUES (1)' → true", () => expect(looksLikeSql('INSERT INTO foo VALUES (1)')).toBe(true));
  it("'hello world' → false", () => expect(looksLikeSql('hello world')).toBe(false));
  it("'' → false", () => expect(looksLikeSql('')).toBe(false));
  it("'UPDATE orders SET status=1 WHERE id=5' → true", () => expect(looksLikeSql('UPDATE orders SET status=1 WHERE id=5')).toBe(true));
});

describe('formatSql', () => {
  it('uppercases keywords', () => {
    const r = formatSql('select * from users where id=1', 'sql', { keywordCase: 'upper' });
    expect(r).toMatch(/SELECT/);
    expect(r).toMatch(/FROM/);
    expect(r).toMatch(/WHERE/);
  });

  it('normalizes whitespace', () => {
    const r = formatSql('SELECT   *   FROM   foo', 'sql', { keywordCase: 'upper' });
    expect(r).not.toMatch(/  {2,}/); // no double spaces
  });

  it('keyword case lower', () => {
    const r = formatSql('SELECT * FROM t', 'sql', { keywordCase: 'lower' });
    expect(r.trim().startsWith('select')).toBe(true);
  });

  it('keyword case upper', () => {
    const r = formatSql('select * from t', 'sql', { keywordCase: 'upper' });
    expect(r.trim().startsWith('SELECT')).toBe(true);
  });

  it('tabWidth 4', () => {
    const r = formatSql('SELECT * FROM users WHERE id=1', 'sql', { keywordCase: 'upper', tabWidth: 4 });
    expect(r).toBeTruthy();
  });

  it('empty string → empty string', () => {
    expect(formatSql('')).toBe('');
  });
});
