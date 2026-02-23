import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';
import XpDisplay from './components/XpDisplay';
import XpBar from './components/XpBar';
import SkillTree from './components/SkillTree';
import { skills } from './data/skills';
import { getXpReward } from './game/gameLogic';
import { createNewCharacter, type Character } from './game/character';
import { type runResults, simulateRun } from './game/simulateRun';
import './App.css'

function App() {
    const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const [xp, setXp] = useState(() => {
        const saved = localStorage.getItem('pomorpg_xp');
        return saved ? Number(saved) : 0;
    });
    const [character, setCharacter] = useState<Character>(() => {
        const saved = localStorage.getItem('pomorpg_character');
        return saved ? JSON.parse(saved) : createNewCharacter();
    });
    const [lastRunSummary, setLastRunSummary] = useState<runResults | null>(null);

    const {
        isRunning,
        secondsLeft,
        start,
        pause,
        reset,
        formattedTime
    } = useTimer(POMODORO_DURATION);

    const level = Math.floor(xp / 100);

    const unlockedSkills = skills
        .filter(skill => xp >= skill.xpRequired)
        .map(skill => skill.id);

    useEffect(() => {
        localStorage.setItem('pomorpg_character', JSON.stringify(character));
    }, [character]);

    useEffect(() => {
        if (secondsLeft === 0 && !isRunning && mode === 'focus') {
            const reward = getXpReward(unlockedSkills);
            console.log(`Pomodoro complete! Gained ${reward} XP.`);
            setXp((prev) => prev + reward);

            const run = simulateRun(25 * 60, character);
            setLastRunSummary(run);
            console.log(`Run summary: ${run.enemiesDefeated} enemies defeated, ${run.goldEarned} gold earned, ${run.characterXpEarned} XP earned.`);
            // 5 minute break after each pomodoro
            setMode('break');
            //setTimeout(() => {
            //    start(5 * 60);
            //}, 5 * 60 * 1000);
            // longer break every 4 pomodoros
        }
    }, [secondsLeft, isRunning, mode]);

    useEffect(() => {
        localStorage.setItem('pomorpg_xp', xp.toString());
    }, [xp]);

    return (
        <div>
            <h1>PomoRPG</h1>
            <TimerDisplay time={formattedTime}/>
            <TimerControls
                isRunning={isRunning}
                start={() => { setMode('focus'); start() }}
                pause={pause}
                reset={() => { setMode('focus'); reset() }}
            />

            <XpDisplay xp={xp} />
            <h2>Level: {level}</h2>
            <XpBar xp={xp} />
            <SkillTree xp={xp} />
        </div>
    );
}

export default App;
