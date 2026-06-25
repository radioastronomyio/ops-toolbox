/**
 * @file useTheme.js
 * @description Theme management hook — data-theme attribute with declared theme list, system resolution, localStorage persistence
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ops-theme-preference';

/**
 * Declared theme list. Drives the SettingsFlyout menu and bounds every
 * preference value. Concrete themes resolve to a data-theme attribute;
 * "system" resolves against prefers-color-scheme. Add a theme here and
 * define its tokens under [data-theme="<id>"] to make it selectable.
 */
export const THEMES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'slate', label: 'High-Contrast Slate' },
];

/**
 * Concrete themes a preference can resolve to (excludes "system").
 */
export const CONCRETE_THEMES = THEMES.filter((t) => t.value !== 'system').map((t) => t.value);

function getSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved) {
  document.documentElement.setAttribute('data-theme', resolved);
  // Clear the inline backgroundColor set by the FOUC script
  document.documentElement.style.backgroundColor = '';
}

export function useTheme() {
  const [preference, setPreference] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'system';
    } catch {
      return 'system';
    }
  });

  const resolved = preference === 'system' ? getSystemPreference() : preference;

  const setTheme = useCallback((value) => {
    setPreference(value);
    try {
      if (value === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, value);
      }
    } catch {}
  }, []);

  // Apply on mount and when preference changes
  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (preference !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(getSystemPreference());
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [preference]);

  return { preference, resolved, setTheme, themes: THEMES };
}
