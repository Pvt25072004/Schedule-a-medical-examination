import React, { createContext, useState, useContext, useCallback } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import Button from "../components/common/Button";

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000); // Tự động ẩn sau 4 giây
  }, []);

  const showSuccess = useCallback((message) => showToast(message, "success"), [showToast]);
  const showError = useCallback((message) => showToast(message, "error"), [showToast]);
  const showInfo = useCallback((message) => showToast(message, "info"), [showToast]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirm = useCallback((title, message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        title,
        message,
        confirmText: options.confirmText || "Xác nhận",
        cancelText: options.cancelText || "Hủy",
        variant: options.variant || "danger", // 'danger' or 'primary'
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo, confirm }}>
      {children}

      {/* Toasts Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center p-4 bg-white border shadow-lg rounded-lg transform transition-all duration-300 ${
              toast.type === "success"
                ? "border-emerald-100"
                : toast.type === "error"
                ? "border-l-4 border-l-red-500 border-red-100"
                : "border-emerald-100"
            }`}
          >
            <div className="flex-shrink-0 mr-3">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-emerald-500" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                toast.type === "error" ? "text-red-800" : "text-slate-800"
              }`}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={confirmDialog.onCancel}></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={confirmDialog.onCancel}>
                {confirmDialog.cancelText}
              </Button>
              <Button 
                variant={confirmDialog.variant} 
                onClick={confirmDialog.onConfirm}
              >
                {confirmDialog.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
