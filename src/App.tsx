import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import TimerDisplay from './components/TimerDisplay';
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

    useEffect(() => {
        if (secondsLeft === 0) {
            setXp((prev) => prev + 10);
        }
    }, [secondsLeft]);

    useEffect(() => {
        localStorage.setItem('pomorpg_xp', xp.toString());
    }, [xp]);

    return (
        <div>
            <h1>PomoRPG</h1>
            <TimerDisplay time={formattedTime}/>

            <button onClick={start} disabled={isRunning}>Start</button>
            <button onClick={pause} disabled={!isRunning }>Pause</button>
            <button onClick={() => reset()}>Reset</button>

            <h3>XP: {xp}</h3>
        </div>
    );
}

export default App;
