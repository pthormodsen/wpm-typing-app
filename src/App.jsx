// src/App.jsx
import { useEffect, useState, useRef } from "react";
import TextDisplay from "./components/TextDisplay";
import TypingInput from "./components/TypingInput";
import Stats from "./components/Stats";
import Timer from "./components/Timer";
import "./index.css";

export default function App() {
    const texts = [
            "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice.",
            "React makes it painless to create interactive user interfaces. Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes.",
            "JavaScript is a versatile programming language that runs in web browsers and on servers. It enables dynamic content, interactive features, and modern web applications that users love.",
            "TypeScript adds optional static type definitions to JavaScript. It helps catch errors early through a type system and provides better development experience with improved tooling.",
            "The art of programming is the skill of controlling complexity. We must learn to write code that is not only functional but also readable, maintainable, and efficient for future developers.",
            "Version control systems like Git help developers track changes, collaborate with teammates, and maintain a clean project history. Mastering Git is essential for modern software development workflows.",
            "CSS, or Cascading Style Sheets, controls the visual appearance of a web page. With Flexbox and Grid, developers can create responsive layouts that adapt seamlessly to different screen sizes and devices.",
            "Clean code is easy to read, understand, and modify. It follows consistent formatting, meaningful naming, and well-organized logic, making software more reliable and easier to maintain over time.",
            "APIs, or Application Programming Interfaces, allow software systems to communicate with each other. They define endpoints for sending and receiving data, enabling integration between apps and services.",
            "Debugging is the process of finding and fixing bugs in a program. Effective debugging requires patience, logical thinking, and the ability to isolate the root cause of an issue using tools and techniques.",
            "The terminal provides powerful control over your computer using command-line tools. Learning shell commands like `cd`, `ls`, and `grep` can speed up development and automate repetitive tasks.",
            "Frontend development focuses on the visual and interactive parts of a website, while backend development handles server logic, databases, and application functionality behind the scenes.",
            "State management is a crucial aspect of complex web applications. Tools like Redux, Zustand, or React's Context API help maintain and synchronize application state across components.",
            "Modern browsers come with built-in developer tools that allow you to inspect HTML, debug JavaScript, and monitor network activity. These tools are invaluable for diagnosing and fixing bugs.",
            "Responsive design ensures that websites look and function well on a variety of devices, from desktops to mobile phones. Media queries and fluid layouts are essential techniques for this purpose.",
            "Web accessibility involves designing websites that can be used by people with disabilities. This includes using semantic HTML, providing text alternatives, and ensuring keyboard navigation support.",
            "Testing is an important part of software development. Unit tests, integration tests, and end-to-end tests help ensure your code behaves as expected and prevents regressions.",
            "Learning to type faster involves building muscle memory, improving accuracy, and practicing regularly with texts that challenge your fingers to reach every key comfortably and quickly.",
            "Asynchronous programming allows a program to perform tasks like network requests without blocking the main thread. JavaScript uses promises and async/await to handle asynchronous operations.",
            "A well organized file structure makes a project easier to navigate and maintain. Group related components, assets, and utilities into meaningful folders to keep everything tidy.",
            "Object-oriented programming is a paradigm based on the concept of objects, which contain data and behavior. It promotes code reuse through inheritance and encapsulation.",
            "Functional programming emphasizes pure functions, immutability, and avoiding side effects. It helps create predictable and testable code that is easier to reason about.",
            "Markdown is a lightweight markup language used for formatting text. It is commonly used in README files, documentation, and note-taking tools like Notion and Obsidian.",
            "Dark mode has become a popular feature in apps and websites. It reduces eye strain in low-light environments and gives users more control over their visual experience.",
            "Animations and transitions can enhance the user experience when used thoughtfully. They provide visual feedback and make interfaces feel more responsive and engaging."
        ];

    const getRandomIndex = () => Math.floor(Math.random() * texts.length);
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
        setTextToType(texts[currentTextIndex]);
    }, [currentTextIndex]);

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

        // Prevent typing beyond the text length
        if (newText.length > textToType.length) return;

        // Start timer on first keystroke
        if (!timerActive && !startTimeRef.current) {
            setTimerActive(true);
            startTimeRef.current = Date.now();
        }

        // Count errors
        if (newText.length > typedText.length) {
            const newCharIndex = newText.length - 1;
            if (newCharIndex < textToType.length && newText[newCharIndex] !== textToType[newCharIndex]) {
                setErrors(prev => prev + 1);
            }
        }

        setTypedText(newText);

        // Check if test is complete (Everything correctly typed)
        // if (newText === textToType) {
        //     setTimerActive(false);
        //     setTestComplete(true);
        //     return;
        // }

        // Check if the user has typed all characters in the text (length match)
        if (newText.length === textToType.length) {
            setTimerActive(false);
            setTestComplete(true);
            return;
        }
    };

    const handleKeyDown = (e) => {
        // Prevent tab key from changing focus
        if (e.key === 'Tab') {
            e.preventDefault();
        }
    };

    const resetTest = () => {
        const randomIndex = getRandomIndex();
        setCurrentTextIndex(randomIndex);
        setTypedText("");
        setSeconds(initialTime);
        setTimerActive(false);
        setErrors(0);
        setTestComplete(false);
        startTimeRef.current = null;
    };

    const nextText = () => {
        const nextIndex = (currentTextIndex + 1) % texts.length;
        setCurrentTextIndex(nextIndex);
        setTextToType(texts[nextIndex]);
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
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">WPM Typing Test</h1>
                <p className="text-gray-600">Test your typing speed and accuracy</p>
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