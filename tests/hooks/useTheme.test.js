import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme, THEMES, CONCRETE_THEMES } from '../../src/hooks/useTheme';

const STORAGE_KEY = 'ops-theme-preference';

/**
 * Build a controllable matchMedia mock. `matches` controls the system
 * preference and listeners are captured so a change can be dispatched.
 */
function mockMatchMedia(matches) {
  const listeners = new Set();
  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn((evt, cb) => {
      if (evt === 'change') listeners.add(cb);
    }),
    removeEventListener: vi.fn((evt, cb) => {
      if (evt === 'change') listeners.delete(cb);
    }),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatch: () => listeners.forEach((cb) => cb({ matches: mql.matches })),
  };
  return mql;
}

describe('useTheme', () => {
  let mql;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.backgroundColor = '';
    mql = mockMatchMedia(false);
    vi.stubGlobal('matchMedia', vi.fn(() => mql));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('exposes a declared theme list including system and slate', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.themes).toBe(THEMES);
    expect(THEMES.map((t) => t.value)).toEqual(['system', 'light', 'dark', 'slate']);
    expect(CONCRETE_THEMES).toEqual(['light', 'dark', 'slate']);
  });

  it('defaults to system preference when nothing is stored', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe('system');
  });

  it('reads a stored preference from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe('light');
  });

  it('resolves an explicit preference directly', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolved).toBe('dark');
  });

  it('resolves system to light when OS prefers light', () => {
    mql = mockMatchMedia(false);
    vi.stubGlobal('matchMedia', vi.fn(() => mql));
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolved).toBe('light');
  });

  it('resolves system to dark when OS prefers dark', () => {
    mql = mockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn(() => mql));
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolved).toBe('dark');
  });

  it('applies the resolved theme to the data-theme attribute', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('setTheme persists an explicit choice and updates preference', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme('dark'));
    expect(result.current.preference).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setTheme(system) clears the stored preference', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme('system'));
    expect(result.current.preference).toBe('system');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('tracks OS preference changes while in system mode', () => {
    mql = mockMatchMedia(false);
    vi.stubGlobal('matchMedia', vi.fn(() => mql));
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolved).toBe('light');

    act(() => {
      mql.matches = true;
      mql.dispatch();
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('does not subscribe to OS changes when an explicit theme is set', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    renderHook(() => useTheme());
    expect(mql.addEventListener).not.toHaveBeenCalled();
  });
});
