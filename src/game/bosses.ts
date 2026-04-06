// src/game/bosses.ts

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
    const raw = localStorage.getItem(BOSS_COUNTER_KEY);
    const count = raw ? Number(raw) : 0;
    return count % total;
}
export function incrementPomoCounter(): number {
    const raw = localStorage.getItem(BOSS_COUNTER_KEY);
    const currentCount = raw ? Number(raw) : 0;
    const newCount = currentCount + 1;

    localStorage.setItem(BOSS_COUNTER_KEY, newCount.toString());
    return newCount;
}

export function simulateBossFight(character: Character) {
    // For now, just compare attack values with some randomness
    const boss = bosses[Math.floor(Math.random() * bosses.length)];
    const playerDamage = character.attack + Math.random() * 2;
    const bossDamage = boss.attack + Math.random() * 2;
    const victory = playerDamage >= bossDamage;
    console.log(`Boss fight against ${boss.name}: Player damage = ${playerDamage.toFixed(2)}, Boss damage = ${bossDamage.toFixed(2)}. Victory: ${victory}`);
    return {
        boss,
        victory
    }
}