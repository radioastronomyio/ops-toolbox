import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the input value.
 * @param {*} value - The value to debounce.
 * @param {number} delayMs - Debounce delay in milliseconds. Default 300.
 * @returns {*} The debounced value.
 */
export function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
