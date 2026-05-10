// src/game/bosses.ts
import { loadSave, updateSave } from "../utils/storage";
import { type Character } from "./character";

export type Boss = {
    name: string;
    hp: number;
    attack: number;
}

export const bosses: Boss[] = [
    { name: "Candy the Caner", hp: 10, attack: 2 },
    { name: "Consort Orc Bjork", hp: 20, attack: 3 },
    { name: "Flippety Flop", hp: 50, attack: 6 },
];

const BOSS_COUNTER_KEY = "pomorpg_pomo_counter";
const BOSS_FIGHT_INTERVAL = 4; // Every 4 pomodoros

export function getBossProgress(total: number = BOSS_FIGHT_INTERVAL): number {
    const { pomoCounter } = loadSave();
    return pomoCounter % total;
}
export function incrementPomoCounter(): number {
    const current = loadSave().pomoCounter;
    const next = updateSave({ pomoCounter: current + 1 });
    return next.pomoCounter;
}

export type BossFightResult = {
    boss: Boss;
    victory: boolean;
    playerDamage: number;
    bossDamage: number;
};

export function simulateBossFight(character: Character):BossFightResult {
    // For now, just compare attack values with some randomness
    const boss = bosses[Math.floor(Math.random() * bosses.length)];
    const playerDamage = character.attack + Math.random() * 2;
    const bossDamage = boss.attack + Math.random() * 2;

    const victory = playerDamage >= bossDamage;
    return {
        boss,
        victory,
        playerDamage,
        bossDamage,
    }
}