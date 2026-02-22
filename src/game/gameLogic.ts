export const BASE_XP_REWARD = 10;

export function getXpReward(unlockedSkills: string[]) {
    let reward = BASE_XP_REWARD;

    if (unlockedSkills.includes('focus1')) {
        reward += 2;
    }

    if (unlockedSkills.includes('focus2')) {
        reward += 3;
    }

    return reward;
}