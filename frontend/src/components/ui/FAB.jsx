import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FAB = ({ onAddWeight }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleAction = (action) => {
        setIsOpen(false);
        switch (action) {
            case "weight":
                onAddWeight?.();
                break;
            case "meal":
                navigate("/meals/new");
                break;
            case "exercise":
                navigate("/exercises/new");
                break;
            default:
                break;
        }
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fab-backdrop"
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.3)",
                        zIndex: 998,
                        animation: "fadeIn 0.2s ease",
                    }}
                />
            )}
            <div className="fab-container">
                {isOpen && (
                    <div className="fab-menu">
                        <button
                            className="fab-menu-item scale-in"
                            onClick={() => handleAction("weight")}
                            style={{ animationDelay: "0ms" }}
                        >
                            <span className="fab-menu-icon">⚖️</span>
                            <span className="fab-menu-label">体重を追加</span>
                        </button>
                        <button
                            className="fab-menu-item scale-in"
                            onClick={() => handleAction("meal")}
                            style={{ animationDelay: "50ms" }}
                        >
                            <span className="fab-menu-icon">🍙</span>
                            <span className="fab-menu-label">食事を追加</span>
                        </button>
                        <button
                            className="fab-menu-item scale-in"
                            onClick={() => handleAction("exercise")}
                            style={{ animationDelay: "100ms" }}
                        >
                            <span className="fab-menu-icon">💪</span>
                            <span className="fab-menu-label">運動を追加</span>
                        </button>
                    </div>
                )}
                <button
                    className="fab-button"
                    onClick={toggleMenu}
                    aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
                >
                    <span className={`fab-icon ${isOpen ? "fab-icon-open" : ""}`}>+</span>
                </button>
            </div>
        </>
    );
};

export default FAB;
