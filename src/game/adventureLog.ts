const STORAGE_KEY = "pomorpg_adventure_log";

export type AdventureEntry = {
    id: string;
    text: string;
    createdAt: number;
};

export function generateAdventureEntry(project: string, enemies: number): AdventureEntry {
    let text = "";

    if (enemies === 0) {
        text = `While you worked on ${project}, your adventurer explored the area.`;
    } else if (enemies === 1) {
        text = `While you worked on ${project}, your adventurer found and defeated a lone goblin.`;
    } else {
        text = `Oh wow, while you worked on ${project}, your adventurer defeated ${enemies} goblins!`;
    }

    return {
        id: crypto.randomUUID(),
        text,
        createdAt: Date.now(),
    };
}

export function loadAdventureLog(): AdventureEntry[] {
    const rawSavedLog = localStorage.getItem(STORAGE_KEY);
    if (!rawSavedLog) return [];
    return JSON.parse(rawSavedLog)
};

export function saveAdventureEntry(newEntry: AdventureEntry) {
    const log = loadAdventureLog();
    const updatedLog = [newEntry, ...log]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLog));
}