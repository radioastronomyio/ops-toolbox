/**
 * @file regexTester.js
 * @description Regex pattern compilation, match execution with capture groups, and highlight segmentation
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

export function compileRegex(pattern, flags) {
  if (!pattern) {
    try {
      return { regex: new RegExp('(?:)', flags || ''), error: null };
    } catch (e) {
      return { regex: null, error: e.message };
    }
  }
  try {
    return { regex: new RegExp(pattern, flags || ''), error: null };
  } catch (e) {
    return { regex: null, error: e.message };
  }
}

export function runMatches(regex, testString) {
  if (!regex || !testString) return { matches: [], error: null };
  try {
    const matches = [];
    if (regex.flags.includes('g')) {
      let match;
      // Recreate regex to reset lastIndex for safe iteration
      const re = new RegExp(regex.source, regex.flags);
      while ((match = re.exec(testString)) !== null) {
        matches.push({
          fullMatch: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups || null,
        });
        if (match[0].length === 0) re.lastIndex++; // Advance past zero-length match to prevent infinite loop
      }
    } else {
      const match = regex.exec(testString);
      if (match) {
        matches.push({
          fullMatch: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups || null,
        });
      }
    }
    return { matches, error: null };
  } catch (e) {
    return { matches: [], error: e.message };
  }
}

/** Split test string into alternating match/non-match segments for UI highlighting */
export function buildHighlightSegments(testString, matches) {
  if (!matches || matches.length === 0) {
    return [{ text: testString, isMatch: false, groupIndex: null }];
  }

  const segments = [];
  let lastIndex = 0;

  for (const match of matches) {
    if (match.index > lastIndex) {
      segments.push({ text: testString.slice(lastIndex, match.index), isMatch: false, groupIndex: null });
    }
    segments.push({ text: match.fullMatch, isMatch: true, groupIndex: null });
    lastIndex = match.index + match.fullMatch.length;
  }

  if (lastIndex < testString.length) {
    segments.push({ text: testString.slice(lastIndex), isMatch: false, groupIndex: null });
  }

  return segments;
}
