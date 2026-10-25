
import type { ReactNode } from "react";

interface ConfirmActionModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export default function ConfirmActionModal({
  title,
  message,
  confirmLabel,
  loading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmActionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#111114] p-6 text-white shadow-2xl"
      >
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>

        <p className="mt-2 text-sm text-gray-400">{message}</p>

        <div className="mt-4">{children}</div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
