export interface Character {
    level: number;
    xp: number;
    attack: number;
    speed: number;
}

export const createNewCharacter = (): Character => ({
    level: 1,
    xp: 0,
    attack: 1,
    speed: 1,
});

export function applyCharacterXp(character: Character, xpEarned: number): Character {
    let newXp = character.xp + xpEarned;
    let newLevel = character.level;

    const XP_PER_LEVEL = 50;

    while (newXp >= XP_PER_LEVEL) {
        newXp -= XP_PER_LEVEL;
        newLevel += 1;
    }

    return {
        ...character,
        level: newLevel,
        xp: newXp,
    };
}
