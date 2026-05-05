/* Main application component for PomoRPG - a gamified Pomodoro timer with RPG elements. */

import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

/* UI component imports */
import Button from "./components/Button";
import TimerDisplay from "./components/TimerDisplay";
import TimerControls from "./components/TimerControls";
import BreakSummary from "./components/BreakSummary";
import AdventureLog from "./components/AdventureLog";
import BossMeter from "./components/BossMeter";
import SkillTree from "./components/SkillTree";

/* Game logic imports */
import { useTimer } from "./hooks/useTimer";
import { type SkillBranch, BRANCH_UNLOCK_COST, skills } from "./data/skills";
import { getDailyStreak, getBestDailyStreak } from "./game/streaks";
import { getXpReward } from "./game/gameLogic";
import { applyCharacterXp, createNewCharacter, type Character } from "./game/character";
import { type runResults, simulateRun } from "./game/simulateRun";
import {
    type BossFightResult,
    incrementPomoCounter,
    simulateBossFight,
    getBossProgress,
} from "./game/bosses";
import { generateUpgradeOptions, type UpgradeOption } from "./game/upgrades";
import { generateAdventureEntry, saveAdventureEntry } from "./game/adventureLog";
import { savePomoSession } from "./utils/sessionStorage";

/* Styles */
import "./App.css";

// todo move constants to separate config file
const FOCUS_DURATION = 1 * 60; // 25 minutes in seconds
const HARDCORE_BREAK_DURATION = 5 * 60; // 5 minutes in seconds
const CLEAN_BONUS_XP = 10; // XP bonus for completing a pomodoro without pausing

type Theme = "dark" | "light";
const THEME_KEY = "pomorpg_theme";

function App() {
    /* STATE INIT */
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem(THEME_KEY);
        return saved === "light" || saved === "dark" ? saved : "dark";
    });

    const [mode, setMode] = useState<"home" | "focus" | "break">("home");
    const [autoCycle, setAutoCycle] = useState(false);
    const [projectName, setProjectName] = useState("");

    const [hardcoreEnabled, setHardcoreEnabled] = useState(() => {
        const saved = localStorage.getItem("pomorpg_hardcore");
        return saved ? JSON.parse(saved) : false;
    });

    const [isCleanRun, setIsCleanRun] = useState(true);
    const [breakLocked, setBreakLocked] = useState(false);

    const [xp, setXp] = useState(() => {
        const saved = localStorage.getItem("pomorpg_xp");
        return saved ? Number(saved) : 0;
    });

    const [unlockedBranches, setUnlockedBranches] = useState<SkillBranch[]>(() => {
        const saved = localStorage.getItem("pomorpg_unlocked_branches");
        return saved ? JSON.parse(saved) : [];
    });

    const [unlockedSkills, setUnlockedSkills] = useState<string[]>(() => {
        const saved = localStorage.getItem("pomorpg_unlocked_skills");
        return saved ? JSON.parse(saved) : [];
    });

    const [character, setCharacter] = useState<Character>(() => {
        const saved = localStorage.getItem("pomorpg_character");
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
    const { isRunning, secondsLeft, start, pause, reset, formattedTime } = focusTimer;
    const breakTimer = useTimer(HARDCORE_BREAK_DURATION);

    /* THEME APPLY + PERSIST */
    useEffect(() => {
        document.documentElement.dataset.theme = theme; // <html data-theme="dark|light">
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    /* PERSIST GAME STATE */
    useEffect(() => {
        localStorage.setItem("pomorpg_character", JSON.stringify(character));
    }, [character]);

    useEffect(() => {
        localStorage.setItem("pomorpg_xp", xp.toString());
    }, [xp]);

    useEffect(() => {
        localStorage.setItem("pomorpg_unlocked_branches", JSON.stringify(unlockedBranches));
    }, [unlockedBranches]);

    useEffect(() => {
        localStorage.setItem("pomorpg_unlocked_skills", JSON.stringify(unlockedSkills));
    }, [unlockedSkills]);

    useEffect(() => {
        localStorage.setItem("pomorpg_hardcore", JSON.stringify(hardcoreEnabled));
    }, [hardcoreEnabled]);

    /* POMODORO COMPLETE */
    useEffect(() => {
        if (!(secondsLeft === 0 && !isRunning && mode === "focus")) return;

        // calculate XP reward based on unlocked skills and whether it was a clean run (hardcore)
        const baseXp = getXpReward(unlockedSkills); // IMPORTANT: pass unlockedSkills back in
        const cleanBonusXp = hardcoreEnabled && isCleanRun ? CLEAN_BONUS_XP : 0;
        const reward = baseXp + cleanBonusXp;

        setLastXpEarned(reward);
        setLastCleanBonusXp(cleanBonusXp);

        const session = {
            id: crypto.randomUUID(),
            project: projectName || "Untitled",
            completedAt: Date.now(),
            xpEarned: reward,
            duration: FOCUS_DURATION,
        };

        savePomoSession(session);
        setXp((prev) => prev + reward);

        const run = simulateRun(FOCUS_DURATION, character);
        setLastRunSummary(run);

        const entry = generateAdventureEntry(projectName, run.enemiesDefeated);
        if (hardcoreEnabled && isCleanRun) {
            entry.text += ` Clean run! Bonus awarded (+${CLEAN_BONUS_XP} XP).`;
        }
        saveAdventureEntry(entry);

        const count = incrementPomoCounter();
        if (count % 4 === 0) {
            setBossResult(simulateBossFight(character));
        } else {
            setBossResult(null);
        }

        setUpgradeOptions(generateUpgradeOptions());
        setMode("break");

        if (hardcoreEnabled) {
            setBreakLocked(true);
            breakTimer.reset();
            breakTimer.start();
        } else {
            setBreakLocked(false);
        }
    }, [
        secondsLeft,
        isRunning,
        mode,
        character,
        unlockedSkills,
        projectName,
        hardcoreEnabled,
        isCleanRun,
        breakTimer,
    ]);

    function applyUpgrade(option: UpgradeOption) {
        if (option.type === "attack") {
            setCharacter((prev) => ({ ...prev, attack: prev.attack + option.value }));
        }
        if (option.type === "speed") {
            setCharacter((prev) => ({ ...prev, speed: prev.speed + option.value }));
        }
    }

    const finalizeBreakAndAdvance = useCallback(() => {
        setBreakLocked(false);
        breakTimer.reset();

        const upgrade = selectedUpgrade ?? upgradeOptions[0];
        if (upgrade) applyUpgrade(upgrade);

        const gainedCharacterXp = lastRunSummary?.characterXpEarned || 0;
        setCharacter((prev) => applyCharacterXp(prev, gainedCharacterXp));

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
    }, [hardcoreEnabled, mode, breakTimer.secondsLeft, breakTimer.isRunning, finalizeBreakAndAdvance]);

    /* SKILL LOGIC */
    const totalSkillPointsEarned = Math.floor(xp / 100);
    const spSpentOnBranches =
        unlockedBranches.length <= 1 ? 0 : (unlockedBranches.length - 1) * BRANCH_UNLOCK_COST;

    const spentOnSkills = unlockedSkills.reduce((sum, skillId) => {
        const skill = skills.find((s) => s.id === skillId);
        return sum + (skill ? skill.cost : 0);
    }, 0);

    const skillPointsAvailable = totalSkillPointsEarned - spSpentOnBranches - spentOnSkills;

    /* RESET */
    function resetPomoRpgStorage() {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("pomorpg_")) keysToRemove.push(key);
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
    }

    const handleResetData = () => {
        if (!window.confirm("Are you SURE you want to reset all data? This will permanently delete all your progress."))
            return;
        resetPomoRpgStorage();
        window.location.reload();
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
                        <p style={{ opacity: 0.85 }}>🏆 Best: {bestStreak}</p>
                    </div>

                    <input
                        type="text"
                        placeholder="What are you working on?"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />

                    <Button
                        onClick={() => {
                            setIsCleanRun(true);
                            setMode("focus");
                            reset();
                            start();
                        }}
                    >
                        Start Focus Session
                    </Button>

                    <div style={{ marginTop: 10 }}>
                        <label style={{ display: "block" }}>
                            <input
                                type="checkbox"
                                checked={hardcoreEnabled}
                                onChange={(e) => setHardcoreEnabled(e.target.checked)}
                            />
                            Hardcore Mode (No pausing, 5 min break, extra XP)
                        </label>

                        <label style={{ display: "block", marginTop: 8 }}>
                            <input
                                type="checkbox"
                                checked={theme === "dark"}
                                onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
                            />
                            Dark mode
                        </label>
                    </div>

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
                        onUnlockBranch={(branch) => {
                            if (unlockedBranches.includes(branch)) return;
                            const isFirstBranch = unlockedBranches.length === 0;
                            const cost = isFirstBranch ? 0 : BRANCH_UNLOCK_COST;
                            if (skillPointsAvailable < cost) return;
                            setUnlockedBranches((prev) => [...prev, branch]);
                        }}
                        onUnlockSkill={(skillId) => {
                            if (unlockedSkills.includes(skillId)) return;

                            const skill = skills.find((s) => s.id === skillId);
                            if (!skill) return;

                            if (!unlockedBranches.includes(skill.branch)) return;

                            const prerequisitesMet = (skill.requires ?? []).every((req) => unlockedSkills.includes(req));
                            if (!prerequisitesMet) return;

                            if (skillPointsAvailable < skill.cost) return;

                            setUnlockedSkills((prev) => [...prev, skillId]);
                        }}
                    />
                </div>
            );
            break;

        case "break":
            content = (
                <div>
                    <BossMeter progress={bossProgress} total={4} />
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
                        callback={finalizeBreakAndAdvance}
                        upgradeOptions={upgradeOptions}
                        selectedOption={selectedUpgrade ?? undefined}
                        onUpgradeSelect={setSelectedUpgrade}
                        projectName={projectName}
                    />
                </div>
            );
            break;

        case "focus":
            content = (
                <div>
                    <h1>PomoRPG</h1>
                    <TimerDisplay time={formattedTime} />

                    <TimerControls
                        isRunning={isRunning}
                        start={() => {
                            setMode("focus");
                            start();
                        }}
                        pause={() => {
                            if (hardcoreEnabled) setIsCleanRun(false);
                            pause();
                        }}
                        reset={() => {
                            setMode("focus");
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

                    <Button
                        onClick={() => {
                            if (hardcoreEnabled) setIsCleanRun(false);
                            setMode("home");
                            reset();
                        }}
                    >
                        End Session
                    </Button>

                    <label style={{ display: "block", marginTop: 8 }}>
                        <input type="checkbox" checked={autoCycle} onChange={(e) => setAutoCycle(e.target.checked)} />
                        Auto-start Next Session
                    </label>
                </div>
            );
            break;
    }

    return (
        <div className="app">
            {content}
            <div className="footer">Made with love - Jeane Ramos 2026</div>
            <hr />
            <button className="btn" onClick={handleResetData}>
                Reset Data
            </button>
        </div>
    );
}

export default App;