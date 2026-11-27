import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Toast, { type ToastType } from "./Toast";

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((
    message: string,
    type: ToastType
  ) => {

    const id = Date.now() + Math.floor(Math.random() * 1000);

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter((toast) => toast.id !== id)
      );
    }, 3000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id)
    );
  }, []);

  const contextValue = useMemo(
    () => ({ showToast }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>

      {children}

      <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {

  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider"
    );
  }

  return context;
};
