import React from "react";

const StreakCard = ({ currentStreak, longestStreak, totalDays }) => {
    const cardStyle = {
        background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        padding: "24px",
        borderRadius: "20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
        overflow: "hidden",
    };

    const flameStyle = {
        fontSize: "3rem",
        animation: "flicker 2s ease-in-out infinite",
    };

    const titleStyle = {
        margin: 0,
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "#92400e",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    };

    const valueStyle = {
        fontSize: "3rem",
        fontWeight: 700,
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        margin: 0,
        lineHeight: 1,
    };

    const labelStyle = {
        fontSize: "0.9rem",
        color: "#78350f",
        fontWeight: 600,
    };

    const statsStyle = {
        display: "flex",
        gap: "24px",
        marginTop: "8px",
    };

    const statItemStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    };

    const statLabelStyle = {
        fontSize: "0.75rem",
        color: "#92400e",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    };

    const statValueStyle = {
        fontSize: "1.5rem",
        fontWeight: 700,
        color: "#b45309",
    };

    return (
        <div className="card-interactive scale-in" style={cardStyle}>
            <style>
                {`
          @keyframes flicker {
            0%, 100% { transform: scale(1) rotate(-5deg); opacity: 1; }
            50% { transform: scale(1.1) rotate(5deg); opacity: 0.9; }
          }
        `}
            </style>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={flameStyle}>🔥</div>
                <div style={{ flex: 1 }}>
                    <h3 style={titleStyle}>連続記録</h3>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <div style={valueStyle}>{currentStreak}</div>
                        <div style={labelStyle}>日</div>
                    </div>
                </div>
            </div>

            <div style={statsStyle}>
                <div style={statItemStyle}>
                    <div style={statLabelStyle}>最長記録</div>
                    <div style={statValueStyle}>{longestStreak}日</div>
                </div>
                <div style={statItemStyle}>
                    <div style={statLabelStyle}>総記録日数</div>
                    <div style={statValueStyle}>{totalDays}日</div>
                </div>
            </div>
        </div>
    );
};

export default StreakCard;
