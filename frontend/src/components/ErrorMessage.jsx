export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
      <svg
        className="w-5 h-5 text-rose-500 mt-0.5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <div className="flex-1">
        <p className="text-sm text-rose-700 font-medium">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 text-sm font-medium text-rose-600 hover:text-rose-800 underline underline-offset-2 cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
}
