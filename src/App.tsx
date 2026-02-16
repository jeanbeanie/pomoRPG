import * as React from 'react';
import { useTimer } from './hooks/useTimer';
import './App.css'

function App() {
    const {
        isRunning,
        start,
        pause,
        reset,
        formattedTime
    } = useTimer();

   

    return (
        <div>
            <h1>PomoRPG</h1>
            <h2>{formattedTime}</h2>

            <button onClick={start} disabled={isRunning}>Start</button>
            <button onClick={pause} disabled={!isRunning }>Pause</button>
            <button onClick={() => reset()}>Reset</button>
        </div>
    );
}

export default App;
