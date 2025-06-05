// src/App.jsx
import { useState } from "react";
import TextDisplay from "./components/TextDisplay";
import TypingInput from "./components/TypingInput";
import Stats from "./components/Stats";
import Timer from "./components/Timer";

export default function App() {
    const [textToType] = useState(
        "The quick brown fox jumps over the lazy dog"
    );
    const [typedText, setTypedText] = useState("");

    function handleTimeUp() {
        alert("Time's up!");
    }

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">WPM Typing Test</h1>
            <Timer initialSeconds={60} onTimeUp={handleTimeUp} />
            <TextDisplay text={textToType} />
            <TypingInput typedText={typedText} setTypedText={setTypedText} />
            <Stats textToType={textToType} typedText={typedText} />
        </div>
    );
}
