import {type Character } from "./character";

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

    return {
        boss,
        victory
    }
}