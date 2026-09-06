// src/App.jsx
import { useEffect, useState, useRef } from "react";
import TextDisplay from "./components/TextDisplay";
import TypingInput from "./components/TypingInput";
import Stats from "./components/Stats";
import Timer from "./components/Timer";
import { BarChart3, RotateCcw, Shuffle, X } from "lucide-react";
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

    const generateWordsByDifficulty = (count) => {
        const wordPool = wordList[difficulty] || wordList.medium;
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
        <div className="min-h-screen bg-stone-100 py-6 text-stone-900 sm:py-10">
            <div className="w-full max-w-6xl mx-auto px-4">
                {/* Header with improved styling */}
                <div className="rounded-lg border border-stone-200 bg-white/90 p-5 shadow-sm mb-5 sm:p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-normal text-stone-950 mb-2 sm:text-4xl">
                                WPM Typing Test
                            </h1>
                            <p className="text-stone-600">Test your typing speed and accuracy</p>
                            {personalBest.wpm > 0 && (
                                <p className="text-sm text-stone-500 mt-2">
                                    Personal best: <span className="font-medium text-stone-800">{personalBest.wpm} WPM</span> ({personalBest.accuracy}% accuracy)
                                </p>
                            )}
                        </div>

                        <div className="flex w-full flex-col gap-3 lg:w-auto">
                            {/* Mode Selection */}
                            <div className="flex rounded-md border border-stone-200 bg-stone-100 p-1">
                                <button
                                    className={`flex-1 rounded px-4 py-2 text-sm transition-colors lg:flex-none ${mode === "sentences" ? "bg-white text-stone-950 shadow-sm font-medium" : "text-stone-600 hover:text-stone-900"}`}
                                    onClick={() => setMode("sentences")}
                                >
                                    Sentences
                                </button>
                                <button
                                    className={`flex-1 rounded px-4 py-2 text-sm transition-colors lg:flex-none ${mode === "words" ? "bg-white text-stone-950 shadow-sm font-medium" : "text-stone-600 hover:text-stone-900"}`}
                                    onClick={() => setMode("words")}
                                >
                                    Words
                                </button>
                            </div>

                            {/* Time Selection */}
                            <div className="flex flex-wrap gap-2">
                                {[15, 30, 60, 120].map(time => (
                                    <button
                                        key={time}
                                        className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${timeLimit === time ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900"}`}
                                        onClick={() => setTimeLimit(time)}
                                    >
                                        {time < 60 ? `${time}s` : `${time/60}m`}
                                    </button>
                                ))}
                            </div>

                            {/* Difficulty Selection (for words mode) */}
                            {mode === "words" && (
                                <div className="flex flex-wrap gap-2">
                                    {["easy", "medium", "hard"].map(diff => (
                                        <button
                                            key={diff}
                                            className={`rounded-md border px-3 py-1.5 text-sm capitalize transition-colors ${difficulty === diff ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900"}`}
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
                <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
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
                    <div className="flex flex-col justify-center gap-3 mt-7 sm:flex-row">
                        <button
                            onClick={resetTest}
                            className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
                        >
                            <RotateCcw size={16} aria-hidden="true" />
                            Reset Test
                        </button>
                        <button
                            onClick={nextText}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                        >
                            <Shuffle size={16} aria-hidden="true" />
                            New Text
                        </button>
                        {testHistory.length > 0 && (
                            <button
                                onClick={() => setShowResults(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
                            >
                                <BarChart3 size={16} aria-hidden="true" />
                                View History
                            </button>
                        )}
                    </div>

                    {/* Keyboard shortcuts info */}
                    <div className="mt-5 text-center text-sm text-stone-500">
                        <p>Press <kbd className="rounded border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-xs text-stone-700">Escape</kbd> to restart, <kbd className="rounded border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-xs text-stone-700">Ctrl+Enter</kbd> to start/pause</p>
                    </div>

                    {/* Test Complete Message */}
                    {testComplete && !showResults && (
                        <div className="mt-8 rounded-lg border border-stone-200 bg-stone-50 p-5 text-center">
                            <h3 className="text-xl font-semibold text-stone-900 mb-2">
                                Test Complete
                            </h3>
                            <p className="text-stone-600">
                                Your results have been saved automatically.
                            </p>
                        </div>
                    )}
                </div>

                {/* Results Modal */}
                {showResults && (
                    <div className="fixed inset-0 bg-stone-950/45 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg border border-stone-200 p-5 w-full max-w-2xl max-h-96 overflow-y-auto shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-stone-900">Test History</h3>
                                <button
                                    onClick={() => setShowResults(false)}
                                    className="rounded-md p-1 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
                                    aria-label="Close test history"
                                >
                                    <X size={20} aria-hidden="true" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {testHistory.slice(0, 10).map((test, index) => (
                                    <div key={index} className="flex items-center justify-between rounded-md border border-stone-200 bg-stone-50 p-3">
                                        <div>
                                            <div className="font-medium text-stone-900">{test.netWpm} WPM ({test.accuracy}% accuracy)</div>
                                            <div className="text-sm text-stone-500">
                                                {test.mode} • {test.difficulty || 'normal'} • {new Date(test.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-sm text-stone-500">
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
