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