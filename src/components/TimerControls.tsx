interface TimerControlsProps {
    isRunning: boolean;
    start: () => void;
    pause: () => void;
    reset: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ isRunning, start, pause, reset }) => {
    return (
        <div className="timerControls">
            <button onClick={start} disabled={isRunning}>Start</button>
            <button onClick={pause} disabled={!isRunning}>Pause</button>
            <button onClick={() => reset()}>Reset</button>
        </div>
    );
};

export default TimerControls;