/**
 * @file useTheme.js
 * @description Theme management hook — light/dark/system with localStorage persistence
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ops-theme-preference';

function getSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved) {
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
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

  return { preference, resolved, setTheme };
}
