// src/components/TextDisplay.jsx
export default function TextDisplay({ text }) {
    return (
        <p className="mb-6 p-4 bg-gray-100 rounded text-lg font-mono whitespace-pre-wrap">
            {text}
        </p>
    );
}
