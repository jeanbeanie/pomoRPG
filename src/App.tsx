import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import './App.css'

function App() {
    const [xp, setXp] = useState(0);

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

    return (
        <div>
            <h1>PomoRPG</h1>
            <h2>{formattedTime}</h2>

            <button onClick={start} disabled={isRunning}>Start</button>
            <button onClick={pause} disabled={!isRunning }>Pause</button>
            <button onClick={() => reset()}>Reset</button>

            <h3>XP: {xp}</h3>
        </div>
    );
}

export default App;
