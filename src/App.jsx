// src/App.jsx
import { useEffect, useState, useRef } from "react";
import TextDisplay from "./components/TextDisplay";
import TypingInput from "./components/TypingInput";
import Stats from "./components/Stats";
import Timer from "./components/Timer";
import "./index.css";
import { texts, wordList } from "./data/texts";
import { calculateAccuracy } from "./utils/typing";

export default function App() {
    function generateRandomWords(count) {
        return Array.from({ length: count }, () => wordList[Math.floor(Math.random() * wordList.length)]).join(' ');
    }

    const getRandomIndex = () => Math.floor(Math.random() * texts.length);
    const [mode, setMode] = useState("sentences");
    const [difficulty, setDifficulty] = useState("medium"); // New: difficulty levels
    const [timeLimit, setTimeLimit] = useState(60); // New: customizable time
    const [currentTextIndex, setCurrentTextIndex] = useState(getRandomIndex());
    const [textToType, setTextToType] = useState(texts[currentTextIndex]);
    const [typedText, setTypedText] = useState("");
    const [seconds, setSeconds] = useState(60);
    const [initialTime, setInitialTime] = useState(60);
    const [timerActive, setTimerActive] = useState(false);
    const [errors, setErrors] = useState(0);
    const [testComplete, setTestComplete] = useState(false);
    const [showResults, setShowResults] = useState(false); // New: results modal
    const [personalBest, setPersonalBest] = useState(() => {
        // Load from localStorage if available
        const saved = localStorage.getItem('wpm-personal-best');
        return saved ? JSON.parse(saved) : { wpm: 0, accuracy: 0, date: null };
    });
    const [testHistory, setTestHistory] = useState(() => {
        // Load test history from localStorage
        const saved = localStorage.getItem('wpm-test-history');
        return saved ? JSON.parse(saved) : [];
    });
    const startTimeRef = useRef(null);
    const inputRef = useRef(null);
    const [keystrokes, setKeystrokes] = useState([]); // Track keystroke timing

    // Generate words based on difficulty
    const generateWordsByDifficulty = (count) => {
        let wordPool = wordList;
        if (difficulty === "easy") {
            wordPool = wordList.filter(word => word.length <= 4);
        } else if (difficulty === "hard") {
            wordPool = [...wordList, ...wordList.filter(word => word.length > 6)];
        }
        return Array.from({ length: count }, () => wordPool[Math.floor(Math.random() * wordPool.length)]).join(' ');
    };

    useEffect(() => {
        if (mode === "sentences") {
            setTextToType(texts[currentTextIndex]);
        } else {
            setTextToType(generateWordsByDifficulty(50));
        }
        setTypedText("");
        setErrors(0);
        setTestComplete(false);
        setShowResults(false);
        setSeconds(timeLimit);
        setInitialTime(timeLimit);
        setTimerActive(false);
        setKeystrokes([]);
        startTimeRef.current = null;

        // Focus input after state changes
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    }, [mode, currentTextIndex, difficulty, timeLimit]);

    useEffect(() => {
        if (!timerActive || seconds === 0) return;
        const interval = setInterval(() => {
            setSeconds(s => {
                if (s <= 1) {
                    setTimerActive(false);
                    setTestComplete(true);
                    setShowResults(true);
                    saveTestResult();
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timerActive, seconds]);

    // Save test results and check for personal best
    const saveTestResult = () => {
        const timeElapsed = initialTime - seconds;
        if (timeElapsed === 0) return;

        const wordsTyped = typedText.trim().split(' ').length;
        const grossWpm = Math.round((typedText.length / 5) / (timeElapsed / 60));
        const netWpm = Math.max(0, Math.round(grossWpm - (errors / (timeElapsed / 60))));

        const accuracy = calculateAccuracy(typedText, textToType);

        const result = {
            date: new Date().toISOString(),
            mode,
            difficulty,
            timeLimit,
            grossWpm,
            netWpm,
            accuracy,
            errors,
            wordsTyped,
            timeElapsed
        };

        // Update test history
        const newHistory = [result, ...testHistory].slice(0, 50); // Keep last 50 tests
        setTestHistory(newHistory);
        localStorage.setItem('wpm-test-history', JSON.stringify(newHistory));

        // Check for personal best
        if (netWpm > personalBest.wpm || (netWpm === personalBest.wpm && accuracy > personalBest.accuracy)) {
            const newBest = { wpm: netWpm, accuracy, date: new Date().toISOString() };
            setPersonalBest(newBest);
            localStorage.setItem('wpm-personal-best', JSON.stringify(newBest));
        }
    };

    const timeElapsed = initialTime - seconds;

    const handleTyping = (e) => {
        if (testComplete) return;

        const newText = e.target.value;
        const now = Date.now();

        // Track keystroke timing for consistency analysis
        if (newText.length > typedText.length) {
            setKeystrokes(prev => [...prev, now]);
        }

        // For "words" mode, extend text if user is near the end
        if (mode === "words" && newText.length > textToType.length - 10) {
            setTextToType(prev => prev + ' ' + generateWordsByDifficulty(20));
        }

        // Prevent typing beyond the text length in "sentences" mode
        if (mode === "sentences" && newText.length > textToType.length) return;

        if (!timerActive && !startTimeRef.current) {
            setTimerActive(true);
            startTimeRef.current = now;
        }

        if (newText.length > typedText.length) {
            const newCharIndex = newText.length - 1;
            if (newCharIndex < textToType.length && newText[newCharIndex] !== textToType[newCharIndex]) {
                setErrors(prev => prev + 1);
            }
        }

        setTypedText(newText);

        // Only stop the test in "sentences" mode when finished
        if (mode === "sentences" && newText.length === textToType.length) {
            setTimerActive(false);
            setTestComplete(true);
            setShowResults(true);
            saveTestResult();
            return;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
        }
        // Add Escape to restart
        if (e.key === 'Escape') {
            resetTest();
        }
        // Ctrl+Enter to start/pause
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            toggleTimer();
        }
    };

    const resetTest = () => {
        if (mode === "sentences") {
            const randomIndex = getRandomIndex();
            setCurrentTextIndex(randomIndex);
        } else {
            setTextToType(generateWordsByDifficulty(50));
        }
        setTypedText("");
        setSeconds(timeLimit);
        setInitialTime(timeLimit);
        setTimerActive(false);
        setErrors(0);
        setTestComplete(false);
        setShowResults(false);
        setKeystrokes([]);
        startTimeRef.current = null;

        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    };

    const nextText = () => {
        if (mode === "sentences") {
            const nextIndex = (currentTextIndex + 1) % texts.length;
            setCurrentTextIndex(nextIndex);
        } else {
            setTextToType(generateWordsByDifficulty(50));
        }
        resetTest();
    };

    const toggleTimer = () => {
        if (!timerActive && !startTimeRef.current) {
            startTimeRef.current = Date.now();
        }
        setTimerActive(!timerActive);

        // Focus input when starting
        if (!timerActive && inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="w-full max-w-6xl mx-auto px-4">
                {/* Header with improved styling */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                                WPM Typing Test
                            </h1>
                            <p className="text-gray-600 text-lg">Test your typing speed and accuracy</p>
                            {personalBest.wpm > 0 && (
                                <p className="text-sm text-green-600 mt-1">
                                    🏆 Personal Best: {personalBest.wpm} WPM ({personalBest.accuracy}% accuracy)
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Mode Selection */}
                            <div className="flex bg-gray-100 rounded-xl p-1">
                                <button
                                    className={`px-4 py-2 rounded-lg transition-all ${mode === "sentences" ? "bg-white shadow-md text-blue-600 font-semibold" : "text-gray-600 hover:text-gray-800"}`}
                                    onClick={() => setMode("sentences")}
                                >
                                    Sentences
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg transition-all ${mode === "words" ? "bg-white shadow-md text-blue-600 font-semibold" : "text-gray-600 hover:text-gray-800"}`}
                                    onClick={() => setMode("words")}
                                >
                                    Words
                                </button>
                            </div>

                            {/* Time Selection */}
                            <div className="flex gap-2">
                                {[15, 30, 60, 120].map(time => (
                                    <button
                                        key={time}
                                        className={`px-3 py-1 rounded-lg text-sm transition-all ${timeLimit === time ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                        onClick={() => setTimeLimit(time)}
                                    >
                                        {time < 60 ? `${time}s` : `${time/60}m`}
                                    </button>
                                ))}
                            </div>

                            {/* Difficulty Selection (for words mode) */}
                            {mode === "words" && (
                                <div className="flex gap-2">
                                    {["easy", "medium", "hard"].map(diff => (
                                        <button
                                            key={diff}
                                            className={`px-3 py-1 rounded-lg text-sm capitalize transition-all ${difficulty === diff ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                            onClick={() => setDifficulty(diff)}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <Timer
                        seconds={seconds}
                        isActive={timerActive}
                        onToggle={toggleTimer}
                        initialTime={initialTime}
                    />

                    <TextDisplay text={textToType} typedText={typedText} />

                    <TypingInput
                        ref={inputRef}
                        typedText={typedText}
                        onTyping={handleTyping}
                        onKeyDown={handleKeyDown}
                        disabled={seconds === 0 || testComplete}
                    />

                    <Stats
                        textToType={textToType}
                        typedText={typedText}
                        timeElapsed={timeElapsed}
                        errors={errors}
                        keystrokes={keystrokes}
                    />

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={resetTest}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                            🔄 Reset Test
                        </button>
                        <button
                            onClick={nextText}
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                            ⏭️ New Text
                        </button>
                        {testHistory.length > 0 && (
                            <button
                                onClick={() => setShowResults(true)}
                                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                📊 View History
                            </button>
                        )}
                    </div>

                    {/* Keyboard shortcuts info */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>💡 Tips: Press <kbd className="px-2 py-1 bg-gray-100 rounded">Escape</kbd> to restart, <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+Enter</kbd> to start/pause</p>
                    </div>

                    {/* Test Complete Message */}
                    {testComplete && !showResults && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl text-center">
                            <h3 className="text-xl font-semibold text-blue-800 mb-2">
                                Test Complete! 🎉
                            </h3>
                            <p className="text-blue-700">
                                Great job! Your results have been saved automatically.
                            </p>
                        </div>
                    )}
                </div>

                {/* Results Modal */}
                {showResults && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Test History</h3>
                                <button
                                    onClick={() => setShowResults(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="space-y-3">
                                {testHistory.slice(0, 10).map((test, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold">{test.netWpm} WPM ({test.accuracy}% accuracy)</div>
                                            <div className="text-sm text-gray-600">
                                                {test.mode} • {test.difficulty || 'normal'} • {new Date(test.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {test.errors} errors
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}