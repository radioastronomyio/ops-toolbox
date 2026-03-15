import { describe, it, expect } from 'vitest';
import { detectDelimiter, parseCsvString, toJsonString } from '../../src/lib/csvToJson.js';

describe('detectDelimiter', () => {
  it("'a,b,c\\n1,2,3' → ','", () => expect(detectDelimiter('a,b,c\n1,2,3')).toBe(','));
  it("'a;b;c\\n1;2;3' → ';'", () => expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';'));
  it("'a\\tb\\tc' → '\\t'", () => expect(detectDelimiter('a\tb\tc\n1\t2\t3')).toBe('\t'));
  it("'a|b|c' → '|'", () => expect(detectDelimiter('a|b|c\n1|2|3')).toBe('|'));
});

describe('parseCsvString', () => {
  it('header:true parses to objects', () => {
    const r = parseCsvString('name,age\nAlice,30\nBob,25', { header: true, dynamicTyping: true, skipEmptyLines: true });
    expect(r.data).toEqual([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]);
  });
  it('dynamicTyping:false → string values', () => {
    const r = parseCsvString('a,b\n1,2', { header: true, dynamicTyping: false, skipEmptyLines: true });
    expect(r.data[0].a).toBe('1');
  });
  it('empty string → data: []', () => {
    const r = parseCsvString('', { header: true, skipEmptyLines: true });
    expect(r.data).toEqual([]);
  });
  it('single column → array of objects with one key', () => {
    const r = parseCsvString('name\nAlice\nBob', { header: true, skipEmptyLines: true });
    expect(r.data[0]).toHaveProperty('name');
  });
});

describe('toJsonString', () => {
  it('[{a:1}] → formatted JSON', () => {
    const s = toJsonString([{ a: 1 }], 2);
    expect(s).toContain('"a": 1');
  });
  it('[] → "[]"', () => expect(toJsonString([], 2)).toBe('[]'));
  it('[{a:"hello"}] → contains "a": "hello"', () => {
    expect(toJsonString([{ a: 'hello' }])).toContain('"a": "hello"');
  });
});
