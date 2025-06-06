import { useEffect, useState } from "react";

export default function Stats({ textToType, typedText, timeElapsed, errors }) {
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [netWpm, setNetWpm] = useState(0);

    useEffect(() => {
        if (timeElapsed === 0) {
            setWpm(0);
            setNetWpm(0);
            return;
        }

        // Calculate words typed (standard: 5 characters = 1 word)
        const grossWpm = Math.round((typedText.length / 5) / (timeElapsed / 60));

        // Calculate net WPM (gross WPM - errors per minute)
        const errorRate = errors / (timeElapsed / 60);
        const netWpmCalc = Math.max(0, Math.round(grossWpm - errorRate));

        // Calculate accuracy
        let correctChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (i < textToType.length && typedText[i] === textToType[i]) {
                correctChars++;
            }
        }
        const acc = typedText.length === 0 ? 100 : Math.round((correctChars / typedText.length) * 100);

        setWpm(grossWpm);
        setNetWpm(netWpmCalc);
        setAccuracy(acc);
    }, [typedText, textToType, timeElapsed, errors]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
            <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{netWpm}</div>
                <div className="text-sm text-gray-600">Net WPM</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{wpm}</div>
                <div className="text-sm text-gray-600">Gross WPM</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errors}</div>
                <div className="text-sm text-gray-600">Errors</div>
            </div>
        </div>
    );
}