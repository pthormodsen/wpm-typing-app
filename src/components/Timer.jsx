import { useState, useEffect } from "react";

export default function Timer({ initialSeconds = 60, onTimeUp }) {
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        if (seconds === 0) {
            if (onTimeUp) onTimeUp();
            return;
        }
        const interval = setInterval(() => {
            setSeconds((s) => s - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [seconds, onTimeUp]);

    return (
        <div className="text-xl font-mono mb-4 text-center">
            Time left: {seconds}s
        </div>
    );
}