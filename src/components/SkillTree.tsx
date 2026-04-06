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
// helper functions for checking unlock status and prerequisites
function branchIsUnlocked(unlockedBranches: SkillBranch[], branch: SkillBranch): boolean {
    return unlockedBranches.includes(branch);
}

function skillIsUnlocked(unlockedSkillIds: string[], skillId: string): boolean {
    return unlockedSkillIds.includes(skillId);
}

function prereqsMet(unlockedSkillIds: string[], skill: Skill): boolean {
    return (skill.requires ?? []).every((req) => unlockedSkillIds.includes(req));
}

const skillById = new Map(skills.map((s) => [s.id, s]));
function getSkillName(skillId: string): string {
    return skillById.get(skillId)?.name ?? skillId;
}
function getNamesForIds(ids: string[]): string {
    return ids.map(getSkillName).join(", ");
}

const SkillTree: React.FC<SkillTreeProps> = ({ skillPoints, unlockedBranches, unlockedSkillIds, onUnlockBranch, onUnlockSkill }) => {
    const hasChosenFirstBranch = unlockedBranches.length > 0;

    // Visible before choosing the first branch
    if (!hasChosenFirstBranch) {
        return (
            <div>
                <h2>Choose your first path.</h2>
                <p>Pick the first skill branch for free!</p>
                <div className="branches">
                    {BRANCHES.map((b) => (
                        <div key={b.id} className="skill unlocked">
                            <p>{b.name}</p>
                            <small>{b.description} </small>
                            <div><button className="btn" onClick={() => onUnlockBranch(b.id)}>Unlock (Free)</button></div>
                        </div>
                    ))}
                   </div>
            </div>
        );
    }

    return (
        <div className="skill-tree">
            <h2>Skill Tree</h2>
            <p>Skill Points: {skillPoints}</p>
            <div className="branches">
            {BRANCHES.map((branch) => {
                const unlocked = branchIsUnlocked(unlockedBranches, branch.id);
                const branchSkills = skills.filter((s) => s.branch === branch.id);

                return (
                    <div key={branch.id} className={`branch ${unlocked ? "unlocked" : "locked"}`}>
                        <h3 className="branch-title">{branch.name}</h3>
                        <p className="branch-desc">{branch.description}</p>

                        {!unlocked && (
                            <div className="skill locked">
                                <p>
                                    <b>{branch.name}</b> is locked.
                                </p>
                                <small>Cost: {BRANCH_UNLOCK_COST} SP</small>
                                <div>
                                    <button
                                        className="btn"
                                        disabled={skillPoints < BRANCH_UNLOCK_COST}
                                        onClick={() => onUnlockBranch(branch.id)}
                                    >
                                        Unlock Branch
                                    </button>
                                </div>
                            </div>
                        )}

                        {unlocked &&
                            branchSkills.map((skill) => {
                                const isUnlocked = skillIsUnlocked(unlockedSkillIds, skill.id);
                                const canUnlock =
                                    !isUnlocked &&
                                    prereqsMet(unlockedSkillIds, skill) &&
                                    skillPoints >= skill.cost;

                                const missingPrereqs = (skill.requires ?? []).filter(
                                    (req) => !unlockedSkillIds.includes(req)
                                );

                                return (
                                    <div
                                        key={skill.id}
                                        className={`skill ${isUnlocked ? "unlocked" : "locked"}`}
                                    >
                                        <p>
                                            <b>{skill.name}</b>
                                        </p>
                                        <small>{skill.description}</small>
                                        <div style={{ marginTop: 6 }}>
                                            <small>
                                                Cost: {skill.cost} SP
                                                {skill.requires && skill.requires.length > 0 ? (
                                                    <> • Requires: {getNamesForIds(skill.requires)}</>
                                                ) : null}
                                            </small>
                                        </div>

                                        {!isUnlocked && missingPrereqs.length > 0 && (
                                            <div style={{ marginTop: 6 }}>
                                                <small style={{ opacity: 0.8 }}>
                                                    Missing: {getNamesForIds(missingPrereqs)}
                                                </small>
                                            </div>
                                        )}

                                        <div style={{ marginTop: 8 }}>
                                            <button
                                                className="btn"
                                                disabled={!canUnlock}
                                                onClick={() => onUnlockSkill(skill.id)}
                                            >
                                                Unlock
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                );
            })}
            </div>
        </div>
    );
};

export default SkillTree;