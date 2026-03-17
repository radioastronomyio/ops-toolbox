/**
 * @file useDensity.js
 * @description Interface density management — adjusts root font size via CSS custom property
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ops-density-preference';
const DENSITY_MAP = {
  compact: '13px',
  default: '14px',
  comfortable: '16px',
};

export function useDensity() {
  const [density, setDensityState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'default';
    } catch {
      return 'default';
    }
  });

  const setDensity = useCallback((value) => {
    setDensityState(value);
    try {
      if (value === 'default') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, value);
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', DENSITY_MAP[density] || '14px');
  }, [density]);

  return { density, setDensity };
}
