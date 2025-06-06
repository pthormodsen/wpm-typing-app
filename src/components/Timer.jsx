// src/components/Timer.jsx
export default function Timer({ seconds, isActive, onToggle }) {
    const formatTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = time % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="text-center mb-6">
            <div className="text-3xl font-bold mb-2 text-gray-800">
                {formatTime(seconds)}
            </div>
            <button
                onClick={onToggle}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
                {isActive ? '⏸️' : '▶️'}
                {isActive ? 'Pause' : 'Start'}
            </button>
        </div>
    );
}