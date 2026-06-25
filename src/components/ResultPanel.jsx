/**
 * @file ResultPanel.jsx
 * @description Read-only output panel with optional copy button and error state styling
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import CopyButton from './CopyButton';
import StatusBadge from './StatusBadge';

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
        <label className="block text-sm text-text-secondary">{label}</label>
        {copyable && value && !error && <CopyButton text={value} />}
      </div>
      <div
        className={`w-full min-h-[3rem] px-3 py-2 rounded-md text-sm overflow-auto ${
          mono ? 'font-mono' : ''
        } ${
          error
            ? 'bg-status-error/20 border-2 border-status-error text-status-error'
            : 'bg-surface-2 border border-border text-text-primary'
        }`}
      >
        {error ? (
          <>
            <StatusBadge status="error" label="Error" className="block mb-1" />
            <div className="whitespace-pre-wrap">{error}</div>
          </>
        ) : value ? (
          <pre className="whitespace-pre-wrap">{value}</pre>
        ) : (
          <span className="text-text-muted">No output</span>
        )}
      </div>
    </div>
  );
}
