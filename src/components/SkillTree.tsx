// src/components/SkillTree.tsx

import React from 'react';
import {
    BRANCHES, BRANCH_UNLOCK_COST, skills,
    type Skill, type SkillBranch,
} from '../data/skills';

interface SkillTreeProps {
    skillPoints: number;
    unlockedBranches: SkillBranch[];
    unlockedSkillIds: string[];
    onUnlockBranch: (branch: SkillBranch) => void;
    onUnlockSkill: (skillId: string) => void;
}



const SkillTree: React.FC<SkillTreeProps> = ({ skillPoints, unlockedBranches, unlockedSkillIds, onUnlockBranch, onUnlockSkill }) => {
    const hasChosenFirstBranch = unlockedBranches.length > 0;

    // Visible before choosing the first branch
    if (!hasChosenFirstBranch) {
        return (
            <div className="skill-tree">
                <h2>Choose your first path.</h2>
                <p>Pick a first branch for free!</p>
            </div>
        );
    }

    return (
        <div className="skill-tree">
            <h2>Skill Tree</h2>
        </div>
    );
};

export default SkillTree;