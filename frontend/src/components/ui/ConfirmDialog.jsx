import React from "react";

const ConfirmDialog = ({
    open,
    title = "確認",
    message,
    confirmText = "削除",
    cancelText = "キャンセル",
    onConfirm,
    onCancel,
    variant = "danger", // "danger" or "warning"
}) => {
    if (!open) return null;

    const backdropStyle = {
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeIn 0.2s ease",
    };

    const dialogStyle = {
        background: "#fff",
        borderRadius: "20px",
        padding: "32px",
        maxWidth: "480px",
        width: "90%",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        animation: "scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    };

    const titleStyle = {
        margin: "0 0 16px",
        fontSize: "1.5rem",
        fontWeight: 700,
        color: variant === "danger" ? "#dc2626" : "#f59e0b",
    };

    const messageStyle = {
        margin: "0 0 24px",
        fontSize: "1rem",
        color: "#4b5563",
        lineHeight: 1.6,
    };

    const actionsStyle = {
        display: "flex",
        gap: "12px",
        justifyContent: "flex-end",
    };

    const buttonBaseStyle = {
        padding: "12px 24px",
        borderRadius: "999px",
        border: "none",
        fontSize: "0.95rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    };

    const cancelButtonStyle = {
        ...buttonBaseStyle,
        background: "#f3f4f6",
        color: "#374151",
    };

    const confirmButtonStyle = {
        ...buttonBaseStyle,
        background: variant === "danger" ? "#dc2626" : "#f59e0b",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    };

    return (
        <div style={backdropStyle} onClick={onCancel}>
            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
            </style>
            <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
                <h3 style={titleStyle}>{title}</h3>
                <p style={messageStyle}>{message}</p>
                <div style={actionsStyle}>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={cancelButtonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.background = "#e5e7eb";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#f3f4f6";
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        style={confirmButtonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
