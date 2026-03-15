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