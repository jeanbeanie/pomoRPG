export type SkillBranch = "consistency" | "focus" | "sustainability";

export type SkillEffect =
    | { type: "xp_flat"; amount: number }
    | { type: "xp_mult"; mult: number }
    | { type: "streak_xp_mult"; days: number; mult: number }
    | { type: "first_session_xp_flat"; amount: number };

export interface Skill {
    id: string;
    name: string;
    description: string;
    branch: SkillBranch;
    cost: number;          // Skill Points
    requires?: string[];   // array of prerequisite skill ids
    effects: SkillEffect[];
}

export const BRANCHES: { id: SkillBranch; name: string; description: string }[] = [
    { id: "consistency", name: "Consistency", description: "Build streaks and show up daily." },
    { id: "focus", name: "Focus", description: "Boost rewards for entering flow state." },
    { id: "sustainability", name: "Sustainability", description: "Build endurance and prevent burnout" },
];

// Cost to unlock additional branches after the first (which is free)
export const BRANCH_UNLOCK_COST = 3;

export const skills: Skill[] = [
    // CONSISTENCY
    {
        id: "consistency_spark",
        name: "Spark",
        description: "Bonus XP for your first focus session each day.",
        branch: "consistency",
        cost: 1,
        effects: [{ type: "first_session_xp_flat", amount: 2 }],
    },
    {
        id: "consistency_ember",
        name: "Ember Streak",
        description: "If your streak is at least 3 days, gain more XP.",
        branch: "consistency",
        cost: 2,
        requires: ["consistency_spark"],
        effects: [{ type: "streak_xp_mult", days: 3, mult: 1.1 }],
    },
    {
        id: "consistency_flame",
        name: "Flame Streak",
        description: "If your streak is at least 7 days, gain way more XP.",
        branch: "consistency",
        cost: 3,
        requires: ["consistency_ember"],
        effects: [{ type: "streak_xp_mult", days: 7, mult: 1.2 }],
    },

    // FOCUS
    {
        id: "focus_sharpened",
        name: "Sharpened Mind",
        description: "Gain a small XP bonus for every completed session.",
        branch: "focus",
        cost: 1,
        effects: [{ type: "xp_flat", amount: 2 }],
    },
    {
        id: "focus_deepwork",
        name: "Deep Work",
        description: "Gain 10% more XP from completed sessions.",
        branch: "focus",
        cost: 2,
        requires: ["focus_sharpened"],
        effects: [{ type: "xp_mult", mult: 1.1 }],
    },
    {
        id: "focus_flow",
        name: "Flow State",
        description: "Gain an additional XP bonus for every completed session.",
        branch: "focus",
        cost: 3,
        requires: ["focus_deepwork"],
        effects: [{ type: "xp_flat", amount: 3 }],
    },

    // SUSTAINABILITY (simple for now; TODO: expand later after tracking breaks behavior)
    {
        id: "sustainability_gentle",
        name: "Gentle Pace",
        description: "Small steady XP bonus, because consistency beats intensity.",
        branch: "sustainability",
        cost: 1,
        effects: [{ type: "xp_flat", amount: 1 }],
    },
    {
        id: "sustainability_rhythm",
        name: "Healthy Rhythm",
        description: "Gain 5% more XP from completed sessions.",
        branch: "sustainability",
        cost: 2,
        requires: ["sustainability_gentle"],
        effects: [{ type: "xp_mult", mult: 1.05 }],
    },
    {
        id: "sustainability_marathon",
        name: "Marathoner",
        description: "The first session each day is worth a little more XP.",
        branch: "sustainability",
        cost: 3,
        requires: ["sustainability_rhythm"],
        effects: [{ type: "first_session_xp_flat", amount: 2 }],
    },
];