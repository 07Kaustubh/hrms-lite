import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function Toast({ message, onDismiss, duration = 4000, action }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in
    requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 300); // Wait for slide-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      role="alert"
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 shadow-lg flex items-center gap-3 max-w-sm">
        <CheckCircle className="w-5 h-5 shrink-0 text-green-500" />
        <div className="flex-1">
          <span className="text-sm font-medium">{message}</span>
          {action && (
            <Link to={action.href} className="block text-xs font-medium text-green-800 hover:text-green-900 mt-1 underline underline-offset-2">
              {action.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
