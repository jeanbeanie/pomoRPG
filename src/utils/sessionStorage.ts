import { type PomoSession } from '../types/session';

const STORAGE_KEY = 'pomorpg_sessions';

export function loadSessions(): PomoSession[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}
export function saveSession(session: PomoSession) {
    const sessions = loadSessions();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}