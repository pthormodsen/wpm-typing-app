import { forwardRef } from 'react';

const TypingInput = forwardRef(({ typedText, onTyping, disabled, onKeyDown }, ref) => {
    return (
        <textarea
            ref={ref}
            className="w-full p-4 border-2 border-gray-300 rounded-xl mb-6 font-mono text-lg resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            rows={4}
            value={typedText}
            onChange={onTyping}
            onKeyDown={onKeyDown}
            placeholder="Start typing here when you're ready... ⌨️"
            spellCheck={false}
            disabled={disabled}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
        />
    );
});

TypingInput.displayName = 'TypingInput';

export default TypingInput;