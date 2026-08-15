import { createNewCharacter, type Character } from '../game/character';
import type { SkillBranch } from '../data/skills';
import type { PomoSession } from '../types/session';
import type { AdventureEntry } from '../game/adventureLog';

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

export type SaveDataV2 = {
    version: 2;

    // core game data
    xp: number;
    character: Character;
    unlockedBranches: SkillBranch[];
    unlockedSkills: string[]; // skill ids
    hardcoreEnabled: boolean;
    theme: Theme;
    notificationsEnabled: boolean;

    // boss pacing
    pomoCounter: number;
    // history/logs (capped to last 200)
    sessions: PomoSession[];
    adventureLog: AdventureEntry[];
}

// avoid importing SaveDataVX everywhere later
export type SaveData = SaveDataV2;

const SAVE_KEY = "pomorpg_save";
// legacy keys for migrating old data to new save structure
const LEGACY_POMO_COUNTER_KEY = "pomorpg_pomo_counter";
const LEGACY_SESSIONS_KEY = "pomorpg_sessions";
const LEGACY_ADVENTURE_LOG_KEY = "pomorpg_adventure_log";

const MAX_SESSIONS = 200
const MAX_ADVENTURE_LOG = 200;

const capTail = <T,>(arr: T[], max: number) => 
    arr.length > max ? arr.slice(arr.length - max) : arr;

const capHead = <T,>(arr: T[], max: number) => 
    arr.length > max ? arr.slice(0, max) : arr;

const defaultSaveV2 = (): SaveDataV2 => ({
    version: 2,
    xp: 0,
    character: createNewCharacter(),
    unlockedBranches: [],
    unlockedSkills: [],
    hardcoreEnabled: false,
    theme: "dark",
    notificationsEnabled: false,
    pomoCounter: 0,
    sessions: [],
    adventureLog: [],
});

function safeJsonParse<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function safeJsonParseUnknown(raw: string | null): unknown {
    if (!raw) return null;
    try {
        return JSON.parse(raw) as unknown;
    } catch {
        return null;
    }
}

function trySetItem(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch (err) {
        console.error("pomoRPG: failed to write save to localStorage", err);
    }
}

function readLegacyNumber(key: string): number {
    const raw = localStorage.getItem(key);
    // Try to parse as number, if it's not a valid number, return 0
    const n = raw ? Number(raw) : 0;
    // Ensure it's a valid finite number, otherwise return 0
    return Number.isFinite(n) ? n : 0;
}
function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isV1(value: unknown): value is SaveDataV1 {
    return isObject(value) && value["version"] === 1;
}

// treat V2 as partial in case we have missing fields
function isV2(value: unknown): value is Partial<SaveDataV2> & { version: 2 } {
    return isObject(value) && value["version"] === 2;
}

function migrateToV2(parsed: unknown): SaveDataV2 {
    const base = defaultSaveV2();

    // Pull legacy data (if any). run this once, then we delete the keys.
    const legacyPomoCount = readLegacyNumber(LEGACY_POMO_COUNTER_KEY);
    const legacySessions = safeJsonParse<PomoSession[]>(
        localStorage.getItem(LEGACY_SESSIONS_KEY),
        []
    );
    const legacyAdventureLog = safeJsonParse<AdventureEntry[]>(
        localStorage.getItem(LEGACY_ADVENTURE_LOG_KEY),
        []
    );

    // Cleanup function to remove legacy keys after migration
    const cleanupLegacy = () => {
        localStorage.removeItem(LEGACY_POMO_COUNTER_KEY);
        localStorage.removeItem(LEGACY_SESSIONS_KEY);
        localStorage.removeItem(LEGACY_ADVENTURE_LOG_KEY);
    };

    // if v2 already (still ensure caps + legacy import if fields missing)
    if (isV2(parsed)) {
        const next: SaveDataV2 = {
            ...base,
            ...parsed,
            version: 2,
            pomoCounter:
                typeof parsed.pomoCounter === "number" ? parsed.pomoCounter : legacyPomoCount,
            sessions: capTail(
                Array.isArray(parsed.sessions) ? parsed.sessions : legacySessions,
                MAX_SESSIONS
            ),
            // your adventure log is newest-first, keep that convention
            adventureLog: capHead(
                Array.isArray(parsed.adventureLog) ? parsed.adventureLog : legacyAdventureLog,
                MAX_ADVENTURE_LOG
            ),
        };

        cleanupLegacy();
        return next;
    }

    // v1 -> v2
    if (isV1(parsed)) {
        const next: SaveDataV2 = {
            ...base,
            ...parsed,
            version: 2,
            pomoCounter: legacyPomoCount,
            sessions: capTail(legacySessions, MAX_SESSIONS),
            adventureLog: capHead(legacyAdventureLog, MAX_ADVENTURE_LOG),
        };

        cleanupLegacy();
        return next;
    }

    // unknown / missing save -> defaults + legacy import
    const next: SaveDataV2 = {
        ...base,
        pomoCounter: legacyPomoCount,
        sessions: capTail(legacySessions, MAX_SESSIONS),
        adventureLog: capHead(legacyAdventureLog, MAX_ADVENTURE_LOG),
    };

    cleanupLegacy();
    return next;
}


export function loadSave(): SaveDataV2 {
    const raw = localStorage.getItem(SAVE_KEY);

    
    const parsed = safeJsonParseUnknown(raw);
    const next = migrateToV2(parsed);

    // persist any migrated/defaulted data back to storage to ensure it's in a consistent format for next time
    trySetItem(SAVE_KEY, JSON.stringify(next));
    return next;
}

export function writeSave(save: SaveDataV2) {
    // enforce caps on sessions and adventure log
    const next: SaveDataV2 = {
        ...save,
        version: 2,
        sessions: capTail(save.sessions ?? [], MAX_SESSIONS),
        adventureLog: capHead(save.adventureLog ?? [], MAX_ADVENTURE_LOG),
    };

    trySetItem(SAVE_KEY, JSON.stringify(next));
}

export function updateSave(patch: Partial<SaveDataV2>): SaveDataV2 {
    const current = loadSave();
    const merged: SaveDataV2 = { ...current, ...patch, version: 2 };
    writeSave(merged);
    return merged;
}

export function resetSave() {
    localStorage.removeItem(SAVE_KEY);

    // also remove legacy keys in case anything recreated them
    localStorage.removeItem(LEGACY_POMO_COUNTER_KEY);
    localStorage.removeItem(LEGACY_SESSIONS_KEY);
    localStorage.removeItem(LEGACY_ADVENTURE_LOG_KEY);
}