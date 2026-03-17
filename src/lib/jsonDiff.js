/**
 * @file jsonDiff.js
 * @description JSON structural diff via jsondiffpatch with HTML-formatted output
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { diff } from 'jsondiffpatch';
import { format as htmlFormat } from 'jsondiffpatch/formatters/html';

export function parseJson(str) {
  if (!str || !str.trim()) return { value: null, error: 'Input is empty' };
  try {
    return { value: JSON.parse(str), error: null };
  } catch (e) {
    return { value: null, error: e.message };
  }
}

export function computeDiff(left, right) {
  const delta = diff(left, right);
  return delta ?? null;
}

export function renderDiffHtml(left, delta) {
  if (!delta) return '';
  return htmlFormat(delta, left);
}
