import React from "react";

const LoadingSkeleton = ({ variant = "text", width, height, className = "" }) => {
    const getSkeletonClass = () => {
        switch (variant) {
            case "text":
                return "skeleton skeleton-text";
            case "avatar":
                return "skeleton skeleton-avatar";
            case "button":
                return "skeleton skeleton-button";
            case "card":
                return "skeleton skeleton-card";
            default:
                return "skeleton";
        }
    };

    const style = {
        ...(width && { width }),
        ...(height && { height }),
    };

    return <div className={`${getSkeletonClass()} ${className}`} style={style} />;
};

export const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <LoadingSkeleton variant="text" width="60%" height="24px" />
            <LoadingSkeleton variant="text" width="100%" />
            <LoadingSkeleton variant="text" width="100%" />
            <LoadingSkeleton variant="text" width="80%" />
        </div>
    );
};

export const SkeletonDashboard = () => {
    return (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
            <div className="skeleton-card" style={{ height: "300px" }}>
                <LoadingSkeleton variant="text" width="40%" height="24px" />
                <div style={{ marginTop: "16px", height: "240px" }}>
                    <LoadingSkeleton width="100%" height="100%" />
                </div>
            </div>
        </div>
    );
};

export default LoadingSkeleton;
