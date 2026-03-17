/**
 * @file ErrorBanner.jsx
 * @description Dismissible inline error banner that renders only when a message is provided
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

/**
 * An inline error banner.
 * @param {{ message: string|null, onDismiss?: () => void }} props
 */
export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-status-error/10 border border-status-error/50 rounded-md text-status-error text-sm">
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 text-status-error hover:text-text-primary transition-micro"
        >
          ✕
        </button>
      )}
    </div>
  );
}
