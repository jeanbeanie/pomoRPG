// src/components/SkillTree.tsx

import React from 'react';
import { skills } from '../data/skills';

interface SkillTreeProps {
    xp: number;
}

const SkillTree: React.FC<SkillTreeProps> = ({ xp }) => {
    return (
        <div className="skill-tree">
            {skills.map(skill => {
                const unlocked = xp >= skill.xpRequired;
                return (
                    <div
                        key={skill.id}
                        className={`skill ${unlocked ? 'unlocked' : 'locked'}`}
                    >
                        <p>{skill.name}</p>
                        <small>{skill.xpRequired} XP</small>
                    </div>
                );
            })}
        </div>
    );
};

export default SkillTree;