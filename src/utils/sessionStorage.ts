// todo: this name is misleading, since it's not really session storage, it's more like local storage for sessions. 
// maybe rename to pomoSessionStorage or something ?

import { type PomoSession } from '../types/session';
import { loadSave, updateSave } from './storage';

export function loadPomoSessions(): PomoSession[] {
    return loadSave().sessions;
}
export function savePomoSession(session: PomoSession) {
    const current = loadSave().sessions;
    updateSave({ sessions: [...current, session]});
}