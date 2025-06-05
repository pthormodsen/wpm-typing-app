// src/components/Stats.jsx
import { useEffect, useState } from "react";

export default function Stats({ textToType, typedText }) {
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);

    useEffect(() => {
        const wordsTyped = typedText.trim().split(/\s+/).length;
        const totalWords = textToType.trim().split(/\s+/).length;

        // Simple accuracy: percentage of correct chars in typedText
        let correctChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === textToType[i]) correctChars++;
        }
        const acc = typedText.length === 0 ? 100 : (correctChars / typedText.length) * 100;

        setAccuracy(acc.toFixed(0));

        // For now, just show words typed as WPM (no timer yet)
        setWpm(wordsTyped);
    }, [typedText, textToType]);

    return (
        <div className="flex justify-between text-lg font-semibold">
            <div>WPM: {wpm}</div>
            <div>Accuracy: {accuracy}%</div>
        </div>
    );
}
