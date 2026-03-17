/**
 * @file useClipboard.js
 * @description Clipboard copy hook with auto-reset feedback after a configurable delay
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Clipboard copy hook with automatic reset.
 * @param {number} resetMs - Time in ms before `copied` resets to false. Default 2000.
 * @returns {{ copy: (text: string) => Promise<void>, copied: boolean }}
 */
export function useClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  // Track timeout so rapid copies don't stack stale resets
  const timeoutRef = useRef(null);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), resetMs);
    } catch (err) {
      console.error('Clipboard write failed:', err);
    }
  }, [resetMs]);

  return { copy, copied };
}
