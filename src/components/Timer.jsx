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
        if (percentage > 50) return "text-green-500";
        if (percentage > 25) return "text-yellow-500";
        return "text-red-500";
    };

    const getProgressColor = () => {
        const percentage = (seconds / initialTime) * 100;
        if (percentage > 50) return "stroke-green-500";
        if (percentage > 25) return "stroke-yellow-500";
        return "stroke-red-500";
    };

    return (
        <div className="text-center mb-8">
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
                        className="text-gray-200"
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
                        strokeLinecap="round"
                    />
                </svg>

                {/* Timer display in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-2xl font-bold transition-colors duration-300 ${getTimerColor()}`}>
                        {formatTime(seconds)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {Math.round(progress)}%
                    </div>
                </div>
            </div>

            {/* Start/Pause Button */}
            <button
                onClick={onToggle}
                className={`flex items-center gap-3 mx-auto px-8 py-3 rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                    isActive
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                }`}
            >
                <span className="text-xl">
                    {isActive ? '⏸️' : '▶️'}
                </span>
                <span className="text-lg">
                    {isActive ? 'Pause Test' : 'Start Test'}
                </span>
            </button>

            {/* Status indicator */}
            <div className="mt-3 text-sm text-gray-600">
                {isActive && (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Test in progress...</span>
                    </div>
                )}
                {!isActive && seconds === initialTime && (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span>Ready to start</span>
                    </div>
                )}
                {!isActive && seconds < initialTime && seconds > 0 && (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Test paused</span>
                    </div>
                )}
            </div>
        </div>
    );
}