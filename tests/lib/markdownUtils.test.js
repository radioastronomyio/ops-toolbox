import { describe, it, expect } from 'vitest';
import { renderMarkdown, countWords, estimateReadTime } from '../../src/lib/markdownUtils.js';

describe('renderMarkdown', () => {
  it('# Hello → contains <h1 and Hello', () => {
    const html = renderMarkdown('# Hello');
    expect(html).toContain('<h1');
    expect(html).toContain('Hello');
  });

  it('**bold** → contains <strong>bold</strong>', () => {
    expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>');
  });

  it('_italic_ → contains <em>', () => {
    expect(renderMarkdown('_italic_')).toContain('<em>');
  });

  it('link → contains <a href', () => {
    expect(renderMarkdown('[link](https://example.com)')).toContain('<a href="https://example.com"');
  });

  it('<script> → stripped by DOMPurify', () => {
    expect(renderMarkdown('<script>alert(1)</script>')).not.toContain('<script');
  });

  it('onerror → stripped by DOMPurify', () => {
    expect(renderMarkdown('Hello <img src=x onerror=alert(1)>')).not.toContain('onerror');
  });

  it('GFM table → contains <table', () => {
    const md = '| a | b |\n|---|---|\n| 1 | 2 |';
    expect(renderMarkdown(md, { gfm: true })).toContain('<table');
  });

  it('`code` → contains <code>', () => {
    expect(renderMarkdown('`code`')).toContain('<code>code</code>');
  });
});

describe('countWords', () => {
  it('heading and paragraph → 6 words', () => {
    expect(countWords('# Hello World\n\nThis is a test.')).toBe(6);
  });
  it('"" → 0', () => expect(countWords('')).toBe(0));
  it('markdown syntax stripped', () => {
    expect(countWords('**bold** and _italic_')).toBe(3);
  });
});

describe('estimateReadTime', () => {
  it('200-word string → "1 min read"', () => {
    const words = Array(200).fill('word').join(' ');
    expect(estimateReadTime(words)).toBe('1 min read');
  });
  it('400-word string → "2 min read"', () => {
    const words = Array(400).fill('word').join(' ');
    expect(estimateReadTime(words)).toBe('2 min read');
  });
  it('"" → "0 min read"', () => {
    expect(estimateReadTime('')).toBe('0 min read');
  });
});
