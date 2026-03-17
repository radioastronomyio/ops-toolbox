import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../../src/hooks/useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('updates the debounced value after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'initial' } }
    );
    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('updated');
  });

  it('resets the timer on rapid value changes (only last value propagates)', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'a' } }
    );
    rerender({ value: 'b' });
    act(() => { vi.advanceTimersByTime(150); });
    rerender({ value: 'c' });
    act(() => { vi.advanceTimersByTime(150); });
    // Only 150ms since 'c' was set — not yet updated
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(150); });
    // Now 300ms from 'c'
    expect(result.current).toBe('c');
  });

  it('respects custom delay values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 1000),
      { initialProps: { value: 'start' } }
    );
    rerender({ value: 'end' });
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe('start');
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe('end');
  });
});
