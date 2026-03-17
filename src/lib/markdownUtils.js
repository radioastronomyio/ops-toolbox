/**
 * @file markdownUtils.js
 * @description Markdown to sanitized HTML rendering (marked + DOMPurify) with word count and read time
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderMarkdown(markdown, options = {}) {
  if (!markdown) return '';
  const { gfm = true, breaks = false } = options;
  const html = marked.parse(markdown, { gfm, breaks });
  try {
    return DOMPurify.sanitize(html);
  } catch {
    // Fail secure — escape HTML rather than returning unsanitized content
    return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

export function countWords(markdown) {
  if (!markdown || !markdown.trim()) return 0;
  // Strip markdown syntax
  const stripped = markdown
    .replace(/#+\s/g, '')
    .replace(/[*_`~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}

/** Estimate read time based on average 200 WPM reading speed */
export function estimateReadTime(markdown) {
  const words = countWords(markdown);
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}
