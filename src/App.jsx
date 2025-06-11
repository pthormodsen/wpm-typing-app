// src/App.jsx
import { useEffect, useState, useRef } from "react";
import TextDisplay from "./components/TextDisplay";
import TypingInput from "./components/TypingInput";
import Stats from "./components/Stats";
import Timer from "./components/Timer";
import "./index.css";
import { texts, wordList } from "./data/texts";

export default function App() {

    function generateRandomWords(count) {
        return Array.from({ length: count }, () => wordList[Math.floor(Math.random() * wordList.length)]).join(' ');
    }

    const getRandomIndex = () => Math.floor(Math.random() * texts.length);
    const [mode, setMode] = useState("sentences"); // "sentences" or "words"
    const [currentTextIndex, setCurrentTextIndex] = useState(getRandomIndex());
    const [textToType, setTextToType] = useState(texts[currentTextIndex]);
    const [typedText, setTypedText] = useState("");
    const [seconds, setSeconds] = useState(60);
    const [initialTime] = useState(60);
    const [timerActive, setTimerActive] = useState(false);
    const [errors, setErrors] = useState(0);
    const [testComplete, setTestComplete] = useState(false);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (mode === "sentences") {
            setTextToType(texts[currentTextIndex]);
        } else {
            setTextToType(generateRandomWords(50));
        }
        setTypedText("");
        setErrors(0);
        setTestComplete(false);
        setSeconds(initialTime);
        setTimerActive(false);
        startTimeRef.current = null;
    }, [mode, currentTextIndex]);

    useEffect(() => {
        if (!timerActive || seconds === 0) return;
        const interval = setInterval(() => {
            setSeconds(s => {
                if (s <= 1) {
                    setTimerActive(false);
                    setTestComplete(true);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timerActive, seconds]);

    const timeElapsed = initialTime - seconds;

    const handleTyping = (e) => {
        if (testComplete) return;

        const newText = e.target.value;

        // For "words" mode, extend text if user is near the end
        if (mode === "words" && newText.length > textToType.length - 10) {
            setTextToType(prev => prev + ' ' + generateRandomWords(20));
        }

        // Prevent typing beyond the text length in "sentences" mode
        if (mode === "sentences" && newText.length > textToType.length) return;

        if (!timerActive && !startTimeRef.current) {
            setTimerActive(true);
            startTimeRef.current = Date.now();
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
            return;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
        }
    };

    const resetTest = () => {
        if (mode === "sentences") {
            const randomIndex = getRandomIndex();
            setCurrentTextIndex(randomIndex);
        } else {
            setTextToType(generateRandomWords(50));
        }
        setTypedText("");
        setSeconds(initialTime);
        setTimerActive(false);
        setErrors(0);
        setTestComplete(false);
        startTimeRef.current = null;
    };

    const nextText = () => {
        if (mode === "sentences") {
            const nextIndex = (currentTextIndex + 1) % texts.length;
            setCurrentTextIndex(nextIndex);
        } else {
            setTextToType(generateRandomWords(50));
        }
        resetTest();
    };

    const toggleTimer = () => {
        if (!timerActive && !startTimeRef.current) {
            startTimeRef.current = Date.now();
        }
        setTimerActive(!timerActive);
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 px-2 sm:px-6 py-6 bg-white rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">WPM Typing Test</h1>
                    <p className="text-gray-600">Test your typing speed and accuracy</p>
                </div>
                <div>
                    <button
                        className={`px-4 py-2 rounded-l-lg ${mode === "sentences" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                        onClick={() => setMode("sentences")}
                    >
                        Sentence
                    </button>
                    <button
                        className={`px-4 py-2 rounded-r-lg ${mode === "words" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                        onClick={() => setMode("words")}
                    >
                        Words
                    </button>
                </div>
            </div>

            <Timer
                seconds={seconds}
                isActive={timerActive}
                onToggle={toggleTimer}
            />

            <TextDisplay text={textToType} typedText={typedText} />

            <TypingInput
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
            />

            <div className="flex justify-center gap-4 mt-6">
                <button
                    onClick={resetTest}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                    🔄 Reset Test
                </button>
                <button
                    onClick={nextText}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                    New Text
                </button>
            </div>

            {testComplete && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        Test Complete! 🎉
                    </h3>
                    <p className="text-blue-700">
                        Great job! You can start a new test or try different text.
                    </p>
                </div>
            )}
        </div>
    );
}