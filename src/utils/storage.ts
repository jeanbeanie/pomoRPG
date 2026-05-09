import { createNewCharacter, type Character } from '../game/character';
import type { SkillBranch } from '../data/skills';

export type Theme = "dark" | "light";

export type SaveDataV1 = {
    version: 1;
    xp: number;
    character: Character;
    unlockedBranches: SkillBranch[];
    unlockedSkills: string[]; // skill ids
    hardcoreEnabled: boolean;
    theme: Theme;
};

const SAVE_KEY = "pomorpg_save";

const defaultSave = (): SaveDataV1 => ({
    version: 1,
    xp: 0,
    character: createNewCharacter(),
    unlockedBranches: [],
    unlockedSkills: [],
    hardcoreEnabled: false,
    theme: "dark",
});

export function loadSave(): SaveDataV1 {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();

    try {
        const parsed = JSON.parse(raw);

        // validate save data structure and version
        if (!parsed || parsed.version !== 1) return defaultSave();
        return {
            // merge parsed data with default to ensure all fields are present
            ...defaultSave(),
            ...parsed,
        } satisfies SaveDataV1;
    } catch {
        return defaultSave();
    }
}

export function writeSave(save: SaveDataV1) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function updateSave(patch: Partial<SaveDataV1>): SaveDataV1 {
    const current = loadSave();
    const next: SaveDataV1 = { ...current, ...patch, version: 1 };
    writeSave(next);
    return next;
}

export function resetSave() {
    localStorage.removeItem(SAVE_KEY);
}