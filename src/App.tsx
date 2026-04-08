// src/App.tsx
/* Main application component for PomoRPG - a gamified Pomodoro timer with RPG elements. */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
/* UI component imports */
import Button from './components/Button';
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';
import BreakSummary from './components/BreakSummary';
import AdventureLog from './components/AdventureLog';
import BossMeter from './components/BossMeter';
import SkillTree from './components/SkillTree';

/* Game logic imports */
import { useTimer } from './hooks/useTimer';
import { type SkillBranch, BRANCH_UNLOCK_COST, skills } from './data/skills';
import { getDailyStreak, getBestDailyStreak } from './game/streaks';
import { getXpReward } from './game/gameLogic';
import { applyCharacterXp, createNewCharacter, type Character } from './game/character';
import { type runResults, simulateRun } from './game/simulateRun';
import { type Boss, incrementPomoCounter, simulateBossFight, getBossProgress } from './game/bosses';
import { generateUpgradeOptions, type UpgradeOption } from './game/upgrades';
import { generateAdventureEntry, saveAdventureEntry } from './game/adventureLog';
import { savePomoSession } from './utils/sessionStorage';
/* Styles */
import './App.css';


function App() {
    // todo move constants to separate config file
    const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

    /* STATE INIT */
    const [mode, setMode] = useState<'home' | 'focus' | 'break'>('home');
    const [autoCycle, setAutoCycle] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [xp, setXp] = useState(() => {
        const saved = localStorage.getItem('pomorpg_xp');
        return saved ? Number(saved) : 0;
    });
    const [unlockedBranches, setUnlockedBranches] = useState<SkillBranch[]>(() => {
        const saved = localStorage.getItem('pomorpg_unlocked_branches');
        return saved ? JSON.parse(saved) : [];
    });
    const [unlockedSkills, setUnlockedSkills] = useState<string[]>(() => { // unlocked skill ids
        const saved = localStorage.getItem('pomorpg_unlocked_skills');
        return saved ? JSON.parse(saved) : [];
    });

    const [character, setCharacter] = useState<Character>(() => {
        const saved = localStorage.getItem('pomorpg_character');
        return saved ? JSON.parse(saved) : createNewCharacter();
    });
    const [lastRunSummary, setLastRunSummary] = useState<runResults | null>(null);
    const [bossResult, setBossResult] = useState < { boss:Boss, victory:boolean } | null>(null);
    const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
    const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeOption | null>(null);

    /* TIMER HOOK */
    const {
        isRunning,
        secondsLeft,
        start,
        pause,
        reset,
        formattedTime
    } = useTimer(POMODORO_DURATION);

    // when a pomodoro completes, calculate rewards and start break
    function triggerBossFight() {
        const result = simulateBossFight(character);
        setBossResult(result);
    }

     // persist character and xp to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('pomorpg_character', JSON.stringify(character));
    }, [character]);
    useEffect(() => {
        localStorage.setItem('pomorpg_xp', xp.toString());
    }, [xp]);
    useEffect(() => {
        localStorage.setItem('pomorpg_unlocked_branches', JSON.stringify(unlockedBranches));
    }, [unlockedBranches]);
    useEffect(() => {
        localStorage.setItem('pomorpg_unlocked_skills', JSON.stringify(unlockedSkills));
    }, [unlockedSkills]);

    // main effect: when a pomodoro session ends, calculate rewards, log the adventure, and start break
    // TODO refactor into smaller effects or a reducer because this is getting icky
    useEffect(() => {
        if (secondsLeft === 0 && !isRunning && mode === 'focus') {
            function completePomodoro() {
                const reward = getXpReward(unlockedSkills);
                const session = {
                    id: crypto.randomUUID(),
                    project: projectName || "Untitled",
                    completedAt: Date.now(),
                    xpEarned: reward,
                    duration: POMODORO_DURATION
                };
                savePomoSession(session);
                setXp((prev) => {
                    const nextXp = prev + reward;
                    console.log(`Pomodoro saved! Earned ${reward} XP for working on ${session.project}. Total XP: ${nextXp}`);
                    return nextXp;
                });
                
            }
            completePomodoro();

            const run = simulateRun(POMODORO_DURATION, character);
            setLastRunSummary(run);

            const entry = generateAdventureEntry(projectName, run.enemiesDefeated);
            saveAdventureEntry(entry);

            const count = incrementPomoCounter();
            if (count % 4 === 0) {
                triggerBossFight();
            }

            setUpgradeOptions(generateUpgradeOptions());
            console.log(`Run summary: ${run.enemiesDefeated} enemies defeated, ${run.goldEarned} gold earned, ${run.characterXpEarned} XP earned.`);

            // TODO hardcore more : 5 minute break after each pomodoro
            setMode('break');
            //setTimeout(() => {
            //    start(5 * 60);
            //}, 5 * 60 * 1000);
            // longer/unlimited break every 4 pomodoros
        }
    }, [secondsLeft, isRunning, mode, POMODORO_DURATION, character, unlockedSkills, projectName]);

    /* SKILL LOGIC */

    const totalSkillPointsEarned = Math.floor(xp / 100);
    const spSpentOnBranches = unlockedBranches.length <= 1 ? 0 : (unlockedBranches.length - 1) * BRANCH_UNLOCK_COST; // first branch is free
    const spentOnSkills = unlockedSkills.reduce((sum, skillId) => {
        const skill = skills.find(s => s.id === skillId);
        return sum + (skill ? skill.cost : 0);
    }, 0);
    const skillPointsAvailable = totalSkillPointsEarned - spSpentOnBranches - spentOnSkills;

    /* DISPLAY HANDLERS LOGIC */

    const handleContinue = () => {
        if (!selectedUpgrade) return;
        applyUpgrade(selectedUpgrade);
        const xpEarned = lastRunSummary?.characterXpEarned || 0;
        setCharacter(prev => applyCharacterXp(prev, xpEarned));
        setLastRunSummary(null);
        setBossResult(null);
        if (autoCycle) {
            setMode('focus');
            start()
        } else {
            setMode('home');
        }
    };

    const handleUpgradeSelect = (option: UpgradeOption) => {
        // highlight selected option in UI
        setSelectedUpgrade(option);
    }

    function applyUpgrade(option: UpgradeOption) {
        if (option.type === 'attack') {
            setCharacter(prev => ({ ...prev, attack: prev.attack + option.value }));
        }

        if (option.type === 'speed') {
            setCharacter(prev => ({ ...prev, speed: prev.speed + option.value }));
        }

        if (option.type === 'accountXpBoost') {
            // Add to account XP multiplier state later  
        }
    }

    const handleUnlockBranch = (branch: SkillBranch) => {
        if (unlockedBranches.includes(branch)) return; // already unlocked
        const isFirstBranch = unlockedBranches.length === 0;
        const cost = isFirstBranch ? 0 : BRANCH_UNLOCK_COST;

        if (skillPointsAvailable < cost) return; // not enough SP
        setUnlockedBranches((prev) => [...prev, branch]);
    };

    const handleUnlockSkill = (skillId: string) => {
        if (unlockedSkills.includes(skillId)) return; // already unlocked

        const skill = skills.find(s => s.id === skillId);
        if (!skill) return; // skill not found

        if (!unlockedBranches.includes(skill.branch)) return; // branch not unlocked
        // check every prerequisite skill is unlocked
        const prerequisitesMet = (skill.requires ?? []).every(requirement => unlockedSkills.includes(requirement));
        if (!prerequisitesMet) return; // prerequisites not met)

        if (skillPointsAvailable < skill.cost) return; // not enough SP

        setUnlockedSkills((prev) => [...prev, skillId]);
    }

    const handleResetData = () => {
        if (window.confirm("Are you SURE you want to reset all data? This will permanently delete all your progress.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    /* RENDER */
    const streak = getDailyStreak();
    const bestStreak = getBestDailyStreak();
    const bossProgress = getBossProgress(4);
    let content: ReactNode;
   
    switch (mode) {
        case "home":
            content = (
                <div>
                    <h1>PomoRPG</h1>
                    <p>The adventurer is itchin' to explore...</p>
                    <div className="streak">
                        <p>🔥 {streak} day streak</p>
                        <p style={{ opacity: 0.85 }} > 🏆 Best: {bestStreak}</p>
                    </div>
                    <input
                        type="text"
                        placeholder="What are you working on?"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />

                    <Button onClick={() => { setMode('focus'); start(); }}>Start Focus Session</Button>
                    <p>XP: {xp} | SP: {skillPointsAvailable}</p>
                    <hr />
                    <div>
                        <h3>Character Level {character.level}</h3>
                        <p>Attack: {character.attack}</p>
                        <p>Speed: {character.speed}</p>

                    </div>
                    <hr />
                    <AdventureLog />
                    <hr />
                    <SkillTree
                        skillPoints={skillPointsAvailable}
                        unlockedBranches={unlockedBranches}
                        unlockedSkillIds={unlockedSkills}
                        onUnlockBranch={handleUnlockBranch}
                        onUnlockSkill={handleUnlockSkill}
                    />
                </div>
            ); break;
        case "break":
            content = (
                <div>
                    {!bossResult && <BossMeter progress={bossProgress} total={4} />}
                    <BreakSummary
                        bossResult={bossResult ?? undefined}
                        enemiesDefeated={lastRunSummary?.enemiesDefeated}
                        goldEarned={lastRunSummary?.goldEarned}
                        characterXpEarned={lastRunSummary?.characterXpEarned}
                        xpEarned={getXpReward(unlockedSkills)}
                        callback={handleContinue}
                        upgradeOptions={upgradeOptions}
                        selectedOption={selectedUpgrade ?? undefined}
                        onUpgradeSelect={handleUpgradeSelect}
                        projectName={projectName}
                    />
                </div>
            ); break;
        case "focus":
            content = (
                <div>
                    <h1>PomoRPG</h1>
                    <TimerDisplay time={formattedTime} />
                    <TimerControls
                        isRunning={isRunning}
                        start={() => { setMode('focus'); start() }}
                        pause={pause}
                        reset={() => { setMode('focus'); reset() }}
                    />
                    <hr />

                    <BossMeter progress={bossProgress} total={4} />
                    <p>While you work on {projectName.toLowerCase()}, the adventurer ventures into the woods...</p>
                    <hr />

                    <Button onClick={() => { setMode('home'); reset(); }}>End Session</Button>
                    <label>
                        <input
                            type="checkbox"
                            checked={autoCycle}
                            onChange={(e) => setAutoCycle(e.target.checked)}
                        />
                        Auto-start Next Session
                    </label>
                </div>
            ); break;
    }

    return (
        <div>
            {content}
            <div className="footer">Made with love ❤️ - Jeane Ramos 2026</div>
            <hr />
            <button className="btn" onClick={handleResetData}>Reset Data</button>
        </div>
    );
       
}

export default App;
