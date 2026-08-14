//src/hooks/useTimer.ts
import { useState, useEffect, useRef } from 'react';

export function useTimer(duration:number) {
    const [secondsLeft, setSecondsLeft] = useState(duration); // 25 minutes
    const [isRunning, setIsRunning] = useState(false);
    // tracks the real end time so drift from a throttled or backgrounded tab,
    // or the system sleeping, corrects itself on the next tick instead of building up
    const endTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            if (endTimeRef.current === null) return;
            const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
            setSecondsLeft(remaining);
            if (remaining === 0) {
                clearInterval(interval);
                setIsRunning(false);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isRunning]);

    function start(secs=duration) {
        const startFrom = secondsLeft === 0 ? secs : secondsLeft;
        if (secondsLeft === 0) {
            setSecondsLeft(startFrom);
        }
        endTimeRef.current = Date.now() + startFrom * 1000;
        setIsRunning(true);
    }

    function pause() {
        setIsRunning(false);
    }

    function reset() {
        endTimeRef.current = null;
        setSecondsLeft(duration);
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
