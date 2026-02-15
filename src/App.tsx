import * as React from 'react';
import { useState, useEffect } from 'react';
import './App.css'

function App() {
    const [secondsLeft, setSecondsLeft] = useState(25 * 60); // 25 minutes
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isRunning]);

    function returnFormattedTime(seconds: number) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    return (
        <div>
            <h1>PomoRPG</h1>
            <h2>{returnFormattedTime(secondsLeft)}</h2>

            <button onClick={() => setIsRunning(true)}>Start</button>
            <button onClick={() => setIsRunning(false)}>Pause</button>
            <button onClick={() => setSecondsLeft(25 * 60)}>Reset</button>
        </div>
    );
}

export default App;
