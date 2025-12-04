import React, { useState, useEffect } from "react";

const AchievementBadge = ({ title, description, icon = "🏆", show = false, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                handleClose();
            }, 4000); // Auto-close after 4 seconds

            return () => clearTimeout(timer);
        }
    }, [show]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            setIsExiting(false);
            onClose?.();
        }, 300);
    };

    if (!isVisible) return null;

    const backdropStyle = {
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        animation: isExiting ? "fadeOut 0.3s ease" : "fadeIn 0.3s ease",
    };

    const badgeStyle = {
        background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        borderRadius: "24px",
        padding: "32px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        maxWidth: "400px",
        textAlign: "center",
        animation: isExiting ? "scaleOut 0.3s ease" : "scaleInBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    };

    const iconStyle = {
        fontSize: "4rem",
        marginBottom: "16px",
        animation: "bounce 1s ease infinite",
    };

    const titleStyle = {
        fontSize: "1.5rem",
        fontWeight: 700,
        color: "#92400e",
        margin: "0 0 8px",
    };

    const descriptionStyle = {
        fontSize: "1rem",
        color: "#78350f",
        margin: 0,
    };

    return (
        <div style={backdropStyle} onClick={handleClose}>
            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes scaleInBounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          @keyframes scaleOut {
            from { transform: scale(1); }
            to { transform: scale(0); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
            </style>
            <div style={badgeStyle} onClick={(e) => e.stopPropagation()}>
                <div style={iconStyle}>{icon}</div>
                <h3 style={titleStyle}>{title}</h3>
                <p style={descriptionStyle}>{description}</p>
            </div>
        </div>
    );
};

export default AchievementBadge;
