/* Main application component for PomoRPG - a gamified Pomodoro timer with RPG elements. */

import * as React from 'react';
import { useState, useEffect } from 'react';
/* UI component imports */
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';
import XpDisplay from './components/XpDisplay';
import XpBar from './components/XpBar';
import SkillTree from './components/SkillTree';
import BreakSummary from './components/BreakSummary';
/* Game logic imports */
import { useTimer } from './hooks/useTimer';
import { skills } from './data/skills';
import { getXpReward } from './game/gameLogic';
import { applyCharacterXp, createNewCharacter, type Character } from './game/character';
import { type runResults, simulateRun } from './game/simulateRun';
import { generateUpgradeOptions, type UpgradeOption } from './game/upgrades';
/* Styles */
import './App.css'
import Button from './components/Button';

function App() {
    const POMODORO_DURATION = 1 * 60; // 25 minutes in seconds

    /* STATE */
    const [mode, setMode] = useState<'home' | 'focus' | 'break'>('home');
    const [xp, setXp] = useState(() => {
        const saved = localStorage.getItem('pomorpg_xp');
        return saved ? Number(saved) : 0;
    });
    const [character, setCharacter] = useState<Character>(() => {
        const saved = localStorage.getItem('pomorpg_character');
        return saved ? JSON.parse(saved) : createNewCharacter();
    });
    const [lastRunSummary, setLastRunSummary] = useState<runResults | null>(null);
    const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<UpgradeOption | null>(null);

    /* TIMER HOOK */
    const {
        isRunning,
        secondsLeft,
        start,
        pause,
        reset,
        formattedTime
    } = useTimer(POMODORO_DURATION);

    // player level and unlocked skills
    const level = Math.floor(xp / 100);

    const unlockedSkills = skills
        .filter(skill => xp >= skill.xpRequired)
        .map(skill => skill.id);

     // persist character and xp to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('pomorpg_character', JSON.stringify(character));
    }, [character]);

    useEffect(() => {
        localStorage.setItem('pomorpg_xp', xp.toString());
    }, [xp]);

    // when a pomodoro completes, calculate rewards and start break
    useEffect(() => {
        if (secondsLeft === 0 && !isRunning && mode === 'focus') {
            const reward = getXpReward(unlockedSkills);
            console.log(`Pomodoro complete! Gained ${reward} XP.`);
            setXp((prev) => prev + reward);

            const run = simulateRun(POMODORO_DURATION, character);
            setLastRunSummary(run);
            setUpgradeOptions(generateUpgradeOptions());
            console.log(`Run summary: ${run.enemiesDefeated} enemies defeated, ${run.goldEarned} gold earned, ${run.characterXpEarned} XP earned.`);

            // TODO 5 minute break after each pomodoro
            setMode('break');
            //setTimeout(() => {
            //    start(5 * 60);
            //}, 5 * 60 * 1000);
            // longer break every 4 pomodoros
        }
    }, [secondsLeft, isRunning, mode, POMODORO_DURATION, character, unlockedSkills]);

    /* DISPLAY LOGIC */

    const shouldShowBreakSummary = mode === 'break' && lastRunSummary !== null;

    const handleContinue = () => {
        applyUpgrade(selectedOption!);
        const xpEarned = lastRunSummary?.characterXpEarned || 0;
        setCharacter(prev => applyCharacterXp(prev, xpEarned));
        setLastRunSummary(null);
        setMode('focus');
        reset();
    };

    const handleUpgradeSelect = (option: UpgradeOption) => {
        // highlight selected option in UI
        document.querySelectorAll('#breakSummary button').forEach((btn) => {
            if (btn.textContent === option.type) {
                btn.classList.add('selected');
            }
            else {
                btn.classList.remove('selected');
            }
        });

        setSelectedOption(option);
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

    /* RENDER */

   // return (
        if (mode === "home") {
            return (
                <div>
                    <h1>PomoRPG</h1>
                    <Button onClick={() => setMode('focus')}>Start Focus Session</Button>
                    <div>
                        <h3>Character: Level {character.level}</h3>
                        <p>Attack: {character.attack}</p>
                        <p>Speed: {character.speed}</p>
                    </div>
                </div>
            );
    } else {
        return shouldShowBreakSummary ? (
            <BreakSummary
                enemiesDefeated={lastRunSummary?.enemiesDefeated}
                goldEarned={lastRunSummary?.goldEarned}
                characterXpEarned={lastRunSummary?.characterXpEarned}
                callback={handleContinue}
                upgradeOptions={upgradeOptions}
                onUpgradeSelect={handleUpgradeSelect}
            />
        ) : (
            <div>
                <h1>PomoRPG</h1>
                <TimerDisplay time={formattedTime} />
                <TimerControls
                    isRunning={isRunning}
                    start={() => { setMode('focus'); start() }}
                    pause={pause}
                    reset={() => { setMode('focus'); reset() }}
                />
                
                <XpDisplay xp={xp} />
                <h4>Level: {level}</h4>
                <XpBar xp={xp} />
                <SkillTree xp={xp} />
            </div>
        )
    }
   // );
}

export default App;
