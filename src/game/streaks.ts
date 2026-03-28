import { loadPomoSessions } from "../utils/sessionStorage";

export function getDailyStreak(): number {
    const sessions = loadPomoSessions();

    // Create a set of unique day strings (example: "Mon Sep 04 2023") from pomo session completion dates
    const sessionDates = new Set<string>(
        sessions.map(session =>
            new Date(session.completedAt).toDateString()
        )
    );

    // Sort the unique days in descending order (most recent first)
    const sortedDates = [...sessionDates]
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => b.getTime() - a.getTime());

    if (sortedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Start from either today or yesterday
    let startingDate = new Date();
    if (sortedDates[0].toDateString() === today.toDateString()) {
        startingDate = today;
    } else if (sortedDates[0].toDateString() === yesterday.toDateString()) {
        startingDate = yesterday;
    } else {
        // Most recent session is older than yesterday - streak is broken
        return 0;
    }

    // Count consecutive days
    for (const date of sortedDates) {
        if (date.toDateString() === startingDate.toDateString()) {
            streak++;
            startingDate.setDate(startingDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

export function getBestDailyStreak(): number {
    const sessions = loadPomoSessions();
    const uniqueDates = new Set<number>();

    for (const session of sessions) {
        const date = new Date(session.completedAt);
        uniqueDates.add(date.setHours(0, 0, 0, 0)); // Normalize to start of day
    }
    // Sort the unique dates in ascending order
    const sortedDates = Array.from(uniqueDates).sort((a, b) => a - b);
    let bestStreak = 0;
    let currentStreak = 0;
    let previousDate = null;
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day

    // Iterate through sorted dates and count consecutive days
    for (const date of sortedDates) {
        // If it's the first date or it's exactly one day after the previous date, continue the streak
        if (previousDate === null || date === previousDate + oneDay) {
            currentStreak++;
        } else {
            // Streak is broken, update best streak if needed and reset current streak
            bestStreak = Math.max(bestStreak, currentStreak);
            // reset streak
            currentStreak = 1; 
        } // Update previous date for next iteration
        previousDate = date;
    }
    // Check at the end in case the longest streak is at the end of list
    bestStreak = Math.max(bestStreak, currentStreak); 
    return bestStreak;
}