import { useState, useEffect } from "react";

const STREAK_STORAGE_KEY = "daiett_streak_data";

/**
 * Custom hook for managing user streak data
 * Tracks consecutive days of recording data
 */
export const useStreak = () => {
    const [streakData, setStreakData] = useState({
        currentStreak: 0,
        longestStreak: 0,
        lastRecordDate: null,
        totalDays: 0,
    });

    // Load streak data from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STREAK_STORAGE_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setStreakData(data);
            } catch (error) {
                console.error("Failed to parse streak data:", error);
            }
        }
    }, []);

    // Save streak data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakData));
    }, [streakData]);

    /**
     * Record a new entry for today
     * Updates streak if it's a consecutive day
     */
    const recordToday = () => {
        const today = new Date().toISOString().split("T")[0];
        const lastDate = streakData.lastRecordDate;

        if (lastDate === today) {
            // Already recorded today
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        let newCurrentStreak = 1;
        if (lastDate === yesterdayStr) {
            // Consecutive day
            newCurrentStreak = streakData.currentStreak + 1;
        }

        const newLongestStreak = Math.max(newCurrentStreak, streakData.longestStreak);

        setStreakData({
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastRecordDate: today,
            totalDays: streakData.totalDays + 1,
        });
    };

    /**
     * Check if streak is still valid (not broken)
     */
    const checkStreak = () => {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const lastDate = streakData.lastRecordDate;

        if (!lastDate) return;

        // If last record was not today or yesterday, streak is broken
        if (lastDate !== today && lastDate !== yesterdayStr) {
            setStreakData({
                ...streakData,
                currentStreak: 0,
            });
        }
    };

    // Check streak validity on mount and periodically
    useEffect(() => {
        checkStreak();
        const interval = setInterval(checkStreak, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [streakData.lastRecordDate]);

    return {
        ...streakData,
        recordToday,
    };
};
