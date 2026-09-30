import { X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {

  const typeStyles = {
    success: "border-green-500/30 bg-green-500/10 text-green-400",
    error: "border-red-500/30 bg-red-500/10 text-red-400",
    warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  };

  return (
    <div
      className={`
        flex
        min-w-[300px]
        max-w-[400px]
        items-center
        justify-between
        gap-4
        rounded-lg
        border
        px-4
        py-3
        shadow-lg
        backdrop-blur-sm
        ${typeStyles[type]}
      `}
    >
      <p className="text-sm font-medium">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 opacity-70 hover:opacity-100"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;