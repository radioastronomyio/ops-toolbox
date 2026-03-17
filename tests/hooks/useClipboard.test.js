import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../../src/hooks/useClipboard';

describe('useClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('copy() writes text to navigator.clipboard', async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.copy('hello');
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
  });

  it('copied is true immediately after copy()', async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.copy('hello');
    });
    expect(result.current.copied).toBe(true);
  });

  it('copied resets to false after the configured timeout', async () => {
    const { result } = renderHook(() => useClipboard(1000));
    await act(async () => {
      await result.current.copy('hello');
    });
    expect(result.current.copied).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(false);
  });

  it('rapid re-copy clears the previous timeout (no double-reset)', async () => {
    const { result } = renderHook(() => useClipboard(1000));
    await act(async () => {
      await result.current.copy('first');
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    await act(async () => {
      await result.current.copy('second');
    });
    // After another 500ms (total 1000ms from first), should still be copied (reset from second)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.copied).toBe(true);
    // After the full second timeout from the second copy, resets
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.copied).toBe(false);
  });

  it('copy() handles clipboard API failure gracefully (no throw)', async () => {
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('Permission denied'));
    const { result } = renderHook(() => useClipboard());
    await expect(
      act(async () => {
        await result.current.copy('hello');
      })
    ).resolves.not.toThrow();
    expect(result.current.copied).toBe(false);
  });
});
