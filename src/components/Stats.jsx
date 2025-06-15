import { useEffect, useState } from "react";
import { calculateAccuracy } from '../utils/typing';

export default function Stats({ textToType, typedText, timeElapsed, errors, keystrokes = [] }) {
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [netWpm, setNetWpm] = useState(0);
    const [consistency, setConsistency] = useState(100);

    useEffect(() => {
        if (timeElapsed === 0) {
            setWpm(0);
            setNetWpm(0);
            setConsistency(100);
            return;
        }

        // Calculate words typed (standard: 5 characters = 1 word)
        const grossWpm = Math.round((typedText.length / 5) / (timeElapsed / 60));

        // Calculate net WPM (gross WPM - errors per minute)
        const errorRate = errors / (timeElapsed / 60);
        const netWpmCalc = Math.max(0, Math.round(grossWpm - errorRate));

        // Calculate accuracy

        const accuracy = calculateAccuracy(typedText, textToType);

        // Calculate consistency based on keystroke timing
        let consistencyCalc = 100;
        if (keystrokes.length > 10) { // Need enough data points
            const intervals = [];
            for (let i = 1; i < keystrokes.length; i++) {
                intervals.push(keystrokes[i] - keystrokes[i - 1]);
            }

            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
            const standardDeviation = Math.sqrt(variance);

            // Convert to consistency percentage (lower deviation = higher consistency)
            consistencyCalc = Math.max(0, Math.min(100, 100 - (standardDeviation / avgInterval) * 100));
        }

        setWpm(grossWpm);
        setNetWpm(netWpmCalc);
        setAccuracy(accuracy);
        setConsistency(Math.round(consistencyCalc));
    }, [typedText, textToType, timeElapsed, errors, keystrokes]);

    const getColorClass = (value, thresholds) => {
        if (value >= thresholds.excellent) return "text-green-600 bg-green-50 border-green-200";
        if (value >= thresholds.good) return "text-blue-600 bg-blue-50 border-blue-200";
        if (value >= thresholds.fair) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const stats = [
        {
            label: "Net WPM",
            value: netWpm,
            icon: "⚡",
            description: "Words per minute (adjusted for errors)",
            colorClass: getColorClass(netWpm, { excellent: 60, good: 40, fair: 25 })
        },
        {
            label: "Gross WPM",
            value: wpm,
            icon: "📈",
            description: "Raw typing speed",
            colorClass: getColorClass(wpm, { excellent: 70, good: 50, fair: 30 })
        },
        {
            label: "Accuracy",
            value: `${accuracy}%`,
            icon: "🎯",
            description: "Percentage of correct characters",
            colorClass: getColorClass(accuracy, { excellent: 95, good: 90, fair: 80 })
        },
        {
            label: "Consistency",
            value: `${consistency}%`,
            icon: "⏱️",
            description: "Stability of typing rhythm",
            colorClass: getColorClass(consistency, { excellent: 80, good: 60, fair: 40 })
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${stat.colorClass}`}
                    title={stat.description}
                >
                    <div className="text-center">
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm font-medium">{stat.label}</div>
                    </div>
                </div>
            ))}

            {/* Additional error breakdown */}
            {errors > 0 && (
                <div className="col-span-2 lg:col-span-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-red-700">
                            <strong>{errors}</strong> total errors •
                            <strong> {Math.round((errors / typedText.length) * 100)}%</strong> error rate
                        </span>
                        <span className="text-red-600">
                            -{Math.round(errors / (timeElapsed / 60))} WPM penalty
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}