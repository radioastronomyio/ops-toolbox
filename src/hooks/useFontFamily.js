/**
 * @file useFontFamily.js
 * @description Font family preference management — system native, Inter, or monospace-heavy
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ops-font-preference';
const FONT_MAP = {
  system: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  inter: {
    sans: '"Inter Variable", "Inter", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
  },
  mono: {
    sans: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    mono: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
  },
};

export function useFontFamily() {
  const [fontFamily, setFontFamilyState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'inter';
    } catch {
      return 'inter';
    }
  });

  const setFontFamily = useCallback((value) => {
    setFontFamilyState(value);
    try {
      if (value === 'inter') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, value);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const fonts = FONT_MAP[fontFamily] || FONT_MAP.inter;
    document.documentElement.style.setProperty('--font-family-sans', fonts.sans);
    document.documentElement.style.setProperty('--font-family-mono', fonts.mono);
  }, [fontFamily]);

  return { fontFamily, setFontFamily };
}
