/**
 * @file sqlFormat.js
 * @description SQL pretty-printing via sql-formatter with multi-dialect support
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { format } from 'sql-formatter';

export function formatSql(sql, dialect = 'sql', options = {}) {
  if (!sql || !sql.trim()) return '';
  const { tabWidth = 2, useTabs = false, keywordCase = 'upper' } = options;
  return format(sql, { language: dialect, tabWidth, useTabs, keywordCase });
}

/** Quick heuristic check for SQL keywords — used to auto-detect input type */
export function looksLikeSql(str) {
  if (!str || !str.trim()) return false;
  return /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN)\b/i.test(str);
}
