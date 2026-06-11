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
  const [promptDialog, setPromptDialog] = useState(null);

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
        variant: options.variant || "primary", // 'danger' or 'primary'
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

  const prompt = useCallback((title, message, options = {}) => {
    return new Promise((resolve) => {
      setPromptDialog({
        title,
        message,
        placeholder: options.placeholder || "Nhập thông tin...",
        defaultValue: options.defaultValue || "",
        confirmText: options.confirmText || "Xác nhận",
        cancelText: options.cancelText || "Hủy",
        variant: options.variant || "primary",
        onConfirm: (inputValue) => {
          setPromptDialog(null);
          resolve(inputValue);
        },
        onCancel: () => {
          setPromptDialog(null);
          resolve(null);
        },
      });
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo, confirm, prompt }}>
      {children}

      {/* Toasts Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center p-4 border shadow-lg rounded-lg transform transition-all duration-300 ${
              toast.type === "success"
                ? "bg-emerald-500 border-emerald-600 text-white"
                : toast.type === "error"
                ? "bg-white border-l-4 border-l-red-500 border-red-100"
                : "bg-white border-emerald-100"
            }`}
          >
            <div className="flex-shrink-0 mr-3">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-white" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-emerald-500" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                toast.type === "success" ? "text-white" :
                toast.type === "error" ? "text-red-800" : "text-slate-800"
              }`}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`flex-shrink-0 ml-4 transition-colors ${
                toast.type === "success" ? "text-emerald-100 hover:text-white" : "text-slate-400 hover:text-slate-600"
              }`}
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

      {/* Prompt Dialog Modal */}
      {promptDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={promptDialog.onCancel}></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {promptDialog.title}
            </h3>
            {promptDialog.message && (
              <p className="text-sm text-slate-600 mb-4">
                {promptDialog.message}
              </p>
            )}
            <form onSubmit={(e) => {
              e.preventDefault();
              promptDialog.onConfirm(e.target.promptInput.value);
            }}>
              <input
                name="promptInput"
                type="text"
                autoFocus
                defaultValue={promptDialog.defaultValue}
                placeholder={promptDialog.placeholder}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={promptDialog.onCancel}>
                  {promptDialog.cancelText}
                </Button>
                <Button type="submit" variant={promptDialog.variant}>
                  {promptDialog.confirmText}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
