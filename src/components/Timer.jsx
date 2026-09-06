import { Pause, Play } from "lucide-react";

// src/components/Timer.jsx
export default function Timer({ seconds, isActive, onToggle, initialTime = 60 }) {
    const formatTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = time % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = initialTime > 0 ? ((initialTime - seconds) / initialTime) * 100 : 0;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Color based on remaining time
    const getTimerColor = () => {
        const percentage = (seconds / initialTime) * 100;
        if (percentage > 50) return "text-emerald-700";
        if (percentage > 25) return "text-amber-700";
        return "text-rose-700";
    };

    const getProgressColor = () => {
        const percentage = (seconds / initialTime) * 100;
        if (percentage > 50) return "stroke-emerald-600";
        if (percentage > 25) return "stroke-amber-600";
        return "stroke-rose-600";
    };

    return (
        <div className="text-center mb-7">
            {/* Circular Progress Timer */}
            <div className="relative w-32 h-32 mx-auto mb-4">
                <svg
                    className="w-32 h-32 transform -rotate-90"
                    viewBox="0 0 100 100"
                >
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-stone-200"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={`transition-all duration-1000 ease-in-out ${getProgressColor()}`}
                        strokeLinecap="butt"
                    />
                </svg>

                {/* Timer display in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-2xl font-semibold transition-colors duration-300 ${getTimerColor()}`}>
                        {formatTime(seconds)}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                        {Math.round(progress)}%
                    </div>
                </div>
            </div>

            {/* Start/Pause Button */}
            <button
                onClick={onToggle}
                className={`flex items-center gap-2 mx-auto rounded-md px-5 py-2.5 text-sm font-medium text-white transition-colors ${
                    isActive
                        ? 'bg-rose-700 hover:bg-rose-800'
                        : 'bg-stone-900 hover:bg-stone-800'
                }`}
            >
                {isActive ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                {isActive ? 'Pause Test' : 'Start Test'}
            </button>

            {/* Status indicator */}
            <div className="mt-3 text-sm text-stone-600">
                {isActive && (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                        <span>Test in progress...</span>
                    </div>
                )}
                {!isActive && seconds === initialTime && (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-stone-500"></div>
                        <span>Ready to start</span>
                    </div>
                )}
                {!isActive && seconds < initialTime && seconds > 0 && (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                        <span>Test paused</span>
                    </div>
                )}
            </div>
        </div>
    );
}
