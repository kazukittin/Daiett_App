import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3000, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration, ...options };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration, options) => {
    return showToast(message, "success", duration, options);
  }, [showToast]);

  const error = useCallback((message, duration, options) => {
    return showToast(message, "error", duration, options);
  }, [showToast]);

  const info = useCallback((message, duration, options) => {
    return showToast(message, "info", duration, options);
  }, [showToast]);

  const warning = useCallback((message, duration, options) => {
    return showToast(message, "warning", duration, options);
  }, [showToast]);

  // Special toast for undo actions
  const showUndo = useCallback((message, onUndo, duration = 5000) => {
    return showToast(message, "info", duration, {
      undoAction: onUndo,
      undoLabel: "元に戻す",
    });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, success, error, info, warning, showUndo }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ id, message, type, onClose, undoAction, undoLabel }) => {
  const [isExiting, setIsExiting] = React.useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleUndo = () => {
    if (undoAction) {
      undoAction();
      handleClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
      default:
        return "ℹ";
    }
  };

  const getTitle = () => {
    switch (type) {
      case "success":
        return "成功";
      case "error":
        return "エラー";
      case "warning":
        return "警告";
      case "info":
      default:
        return "情報";
    }
  };

  return (
    <div className={`toast toast-${type} ${isExiting ? "toast-exit" : ""}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <div className="toast-title">{getTitle()}</div>
        <div className="toast-message">{message}</div>
      </div>
      {undoAction && (
        <button
          className="btn-hover"
          onClick={handleUndo}
          style={{
            background: "transparent",
            border: "1px solid currentColor",
            borderRadius: "999px",
            padding: "4px 12px",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            color: "inherit",
            marginLeft: "8px",
          }}
        >
          {undoLabel}
        </button>
      )}
      <button className="toast-close" onClick={handleClose} aria-label="閉じる">
        ×
      </button>
    </div>
  );
};

