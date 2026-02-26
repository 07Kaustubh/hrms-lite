import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure? This action cannot be undone.",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center py-2">
        {/* Warning icon */}
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>

        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
