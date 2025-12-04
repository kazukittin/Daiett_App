import React, { useMemo } from "react";

const QuickStats = ({ weightRecords = [], mealSummaries = [], exerciseSummaries = [], targetWeight }) => {
    const stats = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Filter records for this week and last week
        const thisWeekWeights = weightRecords.filter(r => new Date(r.date) >= oneWeekAgo);
        const lastWeekWeights = weightRecords.filter(r => {
            const date = new Date(r.date);
            return date >= twoWeeksAgo && date < oneWeekAgo;
        });

        // Calculate average weight
        const avgThisWeek = thisWeekWeights.length > 0
            ? thisWeekWeights.reduce((sum, r) => sum + r.weight, 0) / thisWeekWeights.length
            : null;
        const avgLastWeek = lastWeekWeights.length > 0
            ? lastWeekWeights.reduce((sum, r) => sum + r.weight, 0) / lastWeekWeights.length
            : null;

        const weightChange = avgThisWeek && avgLastWeek ? avgThisWeek - avgLastWeek : null;

        // Calculate progress to goal
        const latestWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : null;
        const progressToGoal = latestWeight && targetWeight
            ? Math.abs(latestWeight - targetWeight)
            : null;

        return {
            avgThisWeek,
            avgLastWeek,
            weightChange,
            progressToGoal,
        };
    }, [weightRecords, targetWeight]);

    const cardStyle = {
        background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
        padding: "24px",
        borderRadius: "20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    };

    const titleStyle = {
        margin: "0 0 20px",
        fontSize: "1.2rem",
        fontWeight: 700,
        color: "#1f2937",
    };

    const statsGridStyle = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
    };

    const statItemStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    };

    const statLabelStyle = {
        fontSize: "0.8rem",
        color: "#6b7280",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    };

    const statValueStyle = {
        fontSize: "1.8rem",
        fontWeight: 700,
        background: "linear-gradient(135deg, #3f8a62 0%, #2e6a4c 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    };

    const statChangeStyle = (isPositive) => ({
        fontSize: "0.85rem",
        fontWeight: 600,
        color: isPositive ? "#10b981" : "#ef4444",
    });

    const progressBarStyle = {
        width: "100%",
        height: "8px",
        background: "#e5e7eb",
        borderRadius: "999px",
        overflow: "hidden",
        marginTop: "8px",
    };

    const progressFillStyle = (percentage) => ({
        height: "100%",
        width: `${Math.min(percentage, 100)}%`,
        background: "linear-gradient(90deg, #3f8a62 0%, #2e6a4c 100%)",
        borderRadius: "999px",
        transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    });

    return (
        <div className="card-interactive fade-in" style={cardStyle}>
            <h3 style={titleStyle}>週間統計</h3>
            <div style={statsGridStyle}>
                <div style={statItemStyle}>
                    <div style={statLabelStyle}>今週の平均体重</div>
                    <div style={statValueStyle}>
                        {stats.avgThisWeek ? `${stats.avgThisWeek.toFixed(1)} kg` : "--"}
                    </div>
                    {stats.weightChange !== null && (
                        <div style={statChangeStyle(stats.weightChange <= 0)}>
                            先週比: {stats.weightChange > 0 ? "+" : ""}{stats.weightChange.toFixed(1)} kg
                        </div>
                    )}
                </div>

                <div style={statItemStyle}>
                    <div style={statLabelStyle}>目標まで</div>
                    <div style={statValueStyle}>
                        {stats.progressToGoal !== null ? `${stats.progressToGoal.toFixed(1)} kg` : "--"}
                    </div>
                    {stats.progressToGoal !== null && targetWeight && (
                        <>
                            <div style={progressBarStyle}>
                                <div style={progressFillStyle(100 - (stats.progressToGoal / Math.abs(weightRecords[0]?.weight - targetWeight || 1)) * 100)} />
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "4px" }}>
                                目標: {targetWeight.toFixed(1)} kg
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickStats;
