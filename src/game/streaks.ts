import { loadSessions } from "../utils/sessionStorage";

export function getDailyStreak(): number {
    const sessions = loadSessions();

    // Get unique days from sessions
    const days = new Set<string>(
        sessions.map(session =>
            new Date(session.completedAt).toDateString()
        )
    );

    // Sort days in descending order
    const sorted = [...days]
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const currentDate = new Date();

    // Count consecutive days starting from today backwards
    for (const date of sorted) {
        if (date.toDateString() === currentDate.toDateString()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else { break; }
    }

    return streak;
}