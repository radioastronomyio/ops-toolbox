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
      className={`px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 rounded text-xs transition-colors ${className}`}
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}
