import { type PomoSession } from '../types/session';

const STORAGE_KEY = 'pomorpg_sessions';

export function loadPomoSessions(): PomoSession[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}
export function savePomoSession(session: PomoSession) {
    const sessions = loadPomoSessions();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}