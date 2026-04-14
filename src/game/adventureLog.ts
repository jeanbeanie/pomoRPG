// src/game/adventureLog.ts

const STORAGE_KEY = "pomorpg_adventure_log";

export type AdventureEntry = {
    id: string;
    category: "run" | "boss";
    text: string;
    createdAt: number;
    cleanRun?: boolean; // hardcore mode - no pausing/resetting allowed

};

export function generateAdventureEntry(project: string, enemies: number): AdventureEntry {
    let text = "";

    if (enemies === 0) {
        text = `You  worked a bit on ${project}, your adventurer explored the area.`;
    } else if (enemies === 1) {
        text = `While you worked on ${project}, your adventurer found and defeated a lone goblin.`;
    } else {
        text = `You worked hard on ${project}, your adventurer defeated ${enemies} goblins.`;
    }

    return {
        id: crypto.randomUUID(),
        text,
        createdAt: Date.now(),
        category: "run",
    };
}

export function generateBossEntry(project: string, bossName: string, victory: boolean): AdventureEntry {
    const text = `Focus was on ${project}, while your adventurer faced off against ${bossName} and ${victory ? 'emerged victorious!' : 'was defeated.'}`;

    return {
        id: crypto.randomUUID(),
        text,
        createdAt: Date.now(),
        category: "boss",
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