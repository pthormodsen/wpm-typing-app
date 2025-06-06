
export default function TypingInput({ typedText, onTyping, disabled, onKeyDown }) {
    return (
        <textarea
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-6 font-mono text-lg resize-none focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            rows={5}
            value={typedText}
            onChange={onTyping}
            onKeyDown={onKeyDown}
            placeholder="Start typing here..."
            spellCheck={false}
            disabled={disabled}
        />
    );
}