/**
 * An inline error banner.
 * @param {{ message: string|null, onDismiss?: () => void }} props
 */
export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 text-red-400 hover:text-red-200 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
