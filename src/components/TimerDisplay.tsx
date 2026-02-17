
interface TimerDisplayProps {
    time: string; // formatted time string
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time }) => {

    return (<h2 className="timer">{time}</h2>);
};

export default TimerDisplay;