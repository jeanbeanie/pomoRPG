import './App.css'
import { useState, useEffect } from 'react';
function App() {
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
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

    return (
        <div>
            <h1>PomoRPG</h1>
            <h2>{secondsLeft}</h2>
            <button onClick={() => setIsRunning(true)}>Start</button>
            <button onClick={() => setIsRunning(false)}>Pause</button>
            <button onClick={() => setSecondsLeft(25 * 60)}>Reset</button>
        </div>
    );
}

export default App;
