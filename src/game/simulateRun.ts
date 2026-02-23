import { type Character } from './character';

export interface runResults {
    enemiesDefeated: number;
    goldEarned: number;
    characterXpEarned: number;
}

export function simulateRun(durationSeconds: number, character: Character): runResults {
    const enemiesDefeated = Math.floor((durationSeconds / 60) * character.attack); // Defeat 1 enemy per minute per attack
    const goldEarned = Math.floor(enemiesDefeated * (5 + character.speed * 0.1)); // 5 base + 0.1 per speed point    
    const characterXpEarned = enemiesDefeated * 2; // Earn 2 XP per enemy
    console.log(`Simulated run: ${enemiesDefeated} enemies defeated, ${goldEarned} gold earned, ${characterXpEarned} XP earned.`);
    return {
        enemiesDefeated,
        goldEarned,
        characterXpEarned,
    };
}