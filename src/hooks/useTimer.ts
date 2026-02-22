import { useState, useEffect } from 'react';
export function useTimer() {
    const [secondsLeft, setSecondsLeft] = useState(25 * 60); // 25 minutes
    const [isRunning, setIsRunning] = useState(false);
    const pomodoroDuration = 25 * 60; // 25 minutes in seconds

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isRunning]);

    function start(secs=pomodoroDuration) {
        if (secondsLeft === 0) {
            setSecondsLeft(secs);
        }
        setIsRunning(true);
    }

    function pause() {
        setIsRunning(false);
    }

    function reset() {
        setSecondsLeft(25 * 60);
        setIsRunning(false);
    }


    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return {
        secondsLeft,
        isRunning,
        start,
        pause,
        reset,
        minutes,
        seconds,
        formattedTime,
    };
}