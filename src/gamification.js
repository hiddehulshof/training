import { getSetting, putSetting } from './db';

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500]; // XP needed for Level 1, 2, 3...

export const getLevel = (xp) => {
    let level = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
        } else {
            break;
        }
    }

    // Calculate progress to next level
    const currentThreshold = LEVEL_THRESHOLDS[level - 1];
    const nextThreshold = LEVEL_THRESHOLDS[level] || (currentThreshold + 1000); // Fallback for high levels
    const progress = Math.min(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100);

    return { level, progress, nextThreshold, currentThreshold };
};

export const addXP = async (amount) => {
    const stats = (await getSetting('user_stats')) || { xp: 0, level: 1, streak: 0, lastLogDate: null };
    stats.xp += amount;

    const { level } = getLevel(stats.xp);
    if (level > stats.level) {
        // Level Up!
        // We could trigger a callback or return a special flag here
        alert(`🎉 LEVEL UP! Je bent nu level ${level}!`);
    }
    stats.level = level;

    await putSetting('user_stats', stats);
    return stats;
};

export const updateStreak = async () => {
    const stats = (await getSetting('user_stats')) || { xp: 0, level: 1, streak: 0, lastLogDate: null };
    const today = new Date().toISOString().split('T')[0];

    if (stats.lastLogDate === today) return stats; // Already logged today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (stats.lastLogDate === yesterdayStr) {
        stats.streak += 1; // Continued streak
    } else {
        stats.streak = 1; // Reset or start new streak
    }

    stats.lastLogDate = today;
    await putSetting('user_stats', stats);
    return stats;
};

export const getUserStats = async () => {
    const stats = (await getSetting('user_stats')) || { xp: 0, level: 1, streak: 0, lastLogDate: null };
    const levelInfo = getLevel(stats.xp);
    return { ...stats, ...levelInfo };
};
