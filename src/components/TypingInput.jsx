// src/components/TypingInput.jsx
export default function TypingInput({ typedText, setTypedText }) {
    return (
        <textarea
            className="w-full p-3 border rounded mb-6 font-mono text-lg resize-none"
            rows={5}
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder="Start typing here..."
            spellCheck={false}
        />
    );
}
