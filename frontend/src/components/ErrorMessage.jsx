import { AlertCircle } from "lucide-react";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />

      <div className="flex-1">
        <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">{message}</p>
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
