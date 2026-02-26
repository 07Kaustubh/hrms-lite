import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    // Escape key handler
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handleKeyDown);

    // Lock body scroll
    document.body.style.overflow = "hidden";

    // Auto-focus first input (only on open, not on re-renders)
    setTimeout(() => {
      const firstInput = panelRef.current?.querySelector("input, select, textarea");
      if (firstInput) firstInput.focus();
    }, 100);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop with fade animation */}
      <div
        className="fixed inset-0 bg-black/50 animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Panel with scale animation */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-md mx-4 bg-white rounded-xl shadow-xl animate-[scaleIn_200ms_ease-out]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer rounded-lg p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
