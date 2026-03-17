/**
 * @file CopyButton.jsx
 * @description Reusable copy-to-clipboard button with transient "Copied!" feedback
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useClipboard } from '../hooks/useClipboard';

/**
 * A button that copies text to clipboard and shows "Copied!" feedback.
 * @param {{ text: string, label?: string, className?: string }} props
 */
export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const { copy, copied } = useClipboard();

  return (
    <button
      onClick={() => copy(text)}
      disabled={!text}
      className={`px-3 py-1 bg-surface-2 hover:bg-surface-3 disabled:opacity-40 text-text-primary rounded text-xs transition-micro ${className}`}
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}
