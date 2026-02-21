import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';
import XpDisplay from './components/XpDisplay';
import XpBar from './components/XpBar';
import SkillTree from './components/SkillTree';
import './App.css'

function App() {
    const [xp, setXp] = useState(() => {
        const saved = localStorage.getItem('pomorpg_xp');
        return saved ? Number(saved) : 0;
    });

    const {
        isRunning,
        secondsLeft,
        start,
        pause,
        reset,
        formattedTime
    } = useTimer();

    const level = Math.floor(xp / 100);

    useEffect(() => {
        if (secondsLeft === 0 && !isRunning) {
            setXp((prev) => prev + 10);
        }
    }, [secondsLeft, isRunning]);

    useEffect(() => {
        localStorage.setItem('pomorpg_xp', xp.toString());
    }, [xp]);

    return (
        <div>
            <h1>PomoRPG</h1>
            <TimerDisplay time={formattedTime}/>
            <TimerControls
                isRunning={isRunning}
                start={start}
                pause={pause}
                reset={reset}
            />

            <XpDisplay xp={xp} />
            <h2>Level: {level}</h2>
            <XpBar xp={xp} />
            <SkillTree xp={xp} />
        </div>
    );
}

export default App;
