// src/App.tsx
/* Main application component for PomoRPG - a gamified Pomodoro timer with RPG elements. */

import { useState, useEffect, useCallback } from 'react';
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
import { type Boss, type BossFightResult, incrementPomoCounter, simulateBossFight, getBossProgress } from './game/bosses';
import { generateUpgradeOptions, type UpgradeOption } from './game/upgrades';
import { generateAdventureEntry, saveAdventureEntry } from './game/adventureLog';
import { savePomoSession } from './utils/sessionStorage';
/* Styles */
import './App.css';


// todo move constants to separate config file
const FOCUS_DURATION = 1 * 60; // 25 minutes in seconds
const HARDCORE_BREAK_DURATION = 5 * 60; // 5 minutes in seconds
const CLEAN_BONUS_XP = 10; // XP bonus for completing a pomodoro without pausing

function App() {
   

    /* STATE INIT */
    const [mode, setMode] = useState<'home' | 'focus' | 'break'>('home');
    const [autoCycle, setAutoCycle] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [hardcoreEnabled, setHardcoreEnabled] = useState(() => {
        const saved = localStorage.getItem('pomorpg_hardcore');
        return saved ? JSON.parse(saved) : false;
    });
    const [isCleanRun, setIsCleanRun] = useState(true); // whether the user paused during the pomodoro, for bonus XP calculation
    const [breakLocked, setBreakLocked] = useState(false); 
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
    const [bossResult, setBossResult] = useState<BossFightResult | null>(null);
    const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
    const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeOption | null>(null);
    const [lastXpEarned, setLastXpEarned] = useState(0);
    const [lastCleanBonusXp, setLastCleanBonusXp] = useState(0);

    /* TIMER HOOK */
  
    const focusTimer = useTimer(FOCUS_DURATION);
    const {
      isRunning,
      secondsLeft,
      start,
      pause,
      reset,
      formattedTime
    } = focusTimer;
    const breakTimer = useTimer(HARDCORE_BREAK_DURATION);


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
    useEffect(() => {
        localStorage.setItem('pomorpg_hardcore', JSON.stringify(hardcoreEnabled));
    }, [hardcoreEnabled]);
    // main effect: when a pomodoro session ends, calculate rewards, log the adventure, and start break
    // TODO refactor into smaller effects or a reducer because this is getting icky
    useEffect(() => {
        if (secondsLeft === 0 && !isRunning && mode === 'focus') {
            function completePomodoro() {
                // calculate XP reward based on unlocked skills and whether it was a clean run (hardcore)
                const baseXp = getXpReward(unlockedSkills);
                const cleanBonusXp = hardcoreEnabled && isCleanRun ? CLEAN_BONUS_XP : 0;
                const reward = baseXp + cleanBonusXp;

                setLastXpEarned(reward);
                setLastCleanBonusXp(cleanBonusXp);
                const session = {
                    id: crypto.randomUUID(),
                    project: projectName || "Untitled",
                    completedAt: Date.now(),
                    xpEarned: reward,
                    duration: FOCUS_DURATION
                };

                savePomoSession(session);
                setXp((prev) => {
                    const nextXp = prev + reward;
                    console.log(`Pomodoro saved! Earned ${reward} XP for working on ${session.project}. Total XP: ${nextXp}, clean bonus: ${cleanBonusXp}`);
                    return nextXp;
                });
                
            }
            completePomodoro();

            const run = simulateRun(FOCUS_DURATION, character);
            setLastRunSummary(run);

            const entry = generateAdventureEntry(projectName, run.enemiesDefeated);
            // append bonus info to adventure log entry if it was a clean run in hardcore mode
            if (hardcoreEnabled && isCleanRun) {
                entry.text += ` Clean run! Bonus awarded (+${CLEAN_BONUS_XP} XP).`;
            }
            saveAdventureEntry(entry);

            const count = incrementPomoCounter();
            if (count % 4 === 0) {
                setBossResult(simulateBossFight(character));
            }

            setUpgradeOptions(generateUpgradeOptions());
            console.log(`Run summary: ${run.enemiesDefeated} enemies defeated, ${run.goldEarned} gold earned, ${run.characterXpEarned} XP earned`);
            setMode('break');
            // lock break timer and begin 5 minute timer if hardcore mode is enabled
            if (hardcoreEnabled) {
                setBreakLocked(true);
                breakTimer.reset();
                breakTimer.start();
            } else {
                setBreakLocked(false);
            }
            // longer/unlimited break every 4 pomodoros
        }
    }, [secondsLeft, isRunning, mode, character, unlockedSkills, projectName, hardcoreEnabled, isCleanRun]);


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

    const finalizeBreakAndAdvance = useCallback(() => {
        setBreakLocked(false);
        breakTimer.reset();

        // pick an upgrade if none selected
        const upgrade = selectedUpgrade ?? upgradeOptions[0];
        if (upgrade) applyUpgrade(upgrade);

        const xpEarned = lastRunSummary?.characterXpEarned || 0;
        setCharacter((prev) => applyCharacterXp(prev, xpEarned));

        setLastRunSummary(null);
        setBossResult(null);
        setSelectedUpgrade(null);

        if (autoCycle) {
            setIsCleanRun(true);
            setMode("focus");
            focusTimer.reset();
            focusTimer.start();
        } else {
            setMode("home");
        }
    }, [selectedUpgrade, upgradeOptions, lastRunSummary, autoCycle, focusTimer, breakTimer]);

    useEffect(() => {
        if (!hardcoreEnabled) return;
        if (mode !== "break") return;

        if (breakTimer.secondsLeft === 0 && !breakTimer.isRunning) {
            finalizeBreakAndAdvance();
        }
    }, [
        hardcoreEnabled,
        mode,
        breakTimer.secondsLeft,
        breakTimer.isRunning,
        finalizeBreakAndAdvance
    ]);

    /* SKILL LOGIC */

    const totalSkillPointsEarned = Math.floor(xp / 100);
    const spSpentOnBranches = unlockedBranches.length <= 1 ? 0 : (unlockedBranches.length - 1) * BRANCH_UNLOCK_COST; // first branch is free
    const spentOnSkills = unlockedSkills.reduce((sum, skillId) => {
        const skill = skills.find(s => s.id === skillId);
        return sum + (skill ? skill.cost : 0);
    }, 0);
    const skillPointsAvailable = totalSkillPointsEarned - spSpentOnBranches - spentOnSkills;


    /* DISPLAY HANDLERS LOGIC */

    const handleContinue = () => finalizeBreakAndAdvance();

    const handleUpgradeSelect = (option: UpgradeOption) => {
        // highlight selected option in UI
        setSelectedUpgrade(option);
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

    function resetPomoRpgStorage() {
        const keysToRemove: string[] = [];

        // only remove keys that start with "pomorpg_" to avoid clearing unrelated localStorage data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("pomorpg_")) keysToRemove.push(key);
        }

        keysToRemove.forEach((k) => localStorage.removeItem(k));
    }

    const handleResetData = () => {
        if (window.confirm("Are you SURE you want to reset all data? This will permanently delete all your progress.")) {
            resetPomoRpgStorage();
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

                    <Button onClick={() => {
                        setIsCleanRun(true);
                        setMode('focus');
                        reset();
                        start();
                    }}>
                        Start Focus Session
                    </Button>
                    <p>
                        <label>
                            <input
                                type="checkbox"
                                checked={hardcoreEnabled}
                                onChange={(e) => setHardcoreEnabled(e.target.checked)}
                            />
                            Hardcore Mode (No pausing, 5 min break, extra XP)
                        </label>
                    </p>
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
                    {<BossMeter progress={bossProgress} total={4} />}
                    {hardcoreEnabled && <p>Break time remaining: {breakTimer.formattedTime}</p>}
                    <p>You should probably choose an upgrade before the timer ends.</p>
                    <BreakSummary
                        breakLocked={breakLocked}
                        bossResult={bossResult ?? undefined}
                        enemiesDefeated={lastRunSummary?.enemiesDefeated}
                        goldEarned={lastRunSummary?.goldEarned}
                        characterXpEarned={lastRunSummary?.characterXpEarned}
                        xpEarned={lastXpEarned}
                        cleanBonusXp={lastCleanBonusXp}
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
                        pause={() => {
                            if(hardcoreEnabled) setIsCleanRun(false);
                            pause();
                        }}
                        reset={() => {
                            setMode('focus');
                            if (hardcoreEnabled) setIsCleanRun(false);
                            reset();
                        }}
                    />
                    <hr />

                    <BossMeter progress={bossProgress} total={4} />
                   
                    <p>While you work on {projectName.toLowerCase()}, the adventurer ventures into the woods...</p>
                    {hardcoreEnabled && (
                        <p style={{ opacity: 0.9 }}>
                            Hardcore: ON • Clean Run: {isCleanRun ? "✅" : "❌"}
                        </p>
                    )}
                    <hr />

                    <Button onClick={() => {
                        if (hardcoreEnabled) setIsCleanRun(false);
                        setMode('home');
                        reset();
                    }}>
                        End Session
                    </Button>
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
