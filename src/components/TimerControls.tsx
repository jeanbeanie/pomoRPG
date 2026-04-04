// src/components/TimerControls.tsx

import Button from './Button';
interface TimerControlsProps {
    isRunning: boolean;
    start: () => void;
    pause: () => void;
    reset: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ isRunning, start, pause, reset }) => {
    return (
        <div className="timerControls">
            <Button onClick={start} disabled={isRunning}>Start</Button>
            <Button onClick={pause} disabled={!isRunning}>Pause</Button>
            <Button onClick={reset}>Reset</Button>
        </div>
    );
};

export default TimerControls;