import CopyButton from './CopyButton';

/**
 * A read-only output panel with optional copy button.
 * @param {{ value: string, label?: string, error?: string|null, copyable?: boolean, mono?: boolean, className?: string }} props
 */
export default function ResultPanel({
  value = '',
  label = 'Output',
  error = null,
  copyable = true,
  mono = true,
  className = '',
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm text-slate-400">{label}</label>
        {copyable && value && !error && <CopyButton text={value} />}
      </div>
      <div
        className={`w-full min-h-[3rem] px-3 py-2 rounded-lg text-sm overflow-auto ${
          mono ? 'font-mono' : ''
        } ${
          error
            ? 'bg-red-900/20 border-2 border-red-500 text-red-400'
            : 'bg-slate-900 border border-slate-700 text-slate-300'
        }`}
      >
        {error ? (
          <div className="whitespace-pre-wrap">{error}</div>
        ) : value ? (
          <pre className="whitespace-pre-wrap">{value}</pre>
        ) : (
          <span className="text-slate-600">No output</span>
        )}
      </div>
    </div>
  );
}
