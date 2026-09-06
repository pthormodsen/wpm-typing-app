import { forwardRef } from 'react';

const TypingInput = forwardRef(({ typedText, onTyping, disabled, onKeyDown }, ref) => {
    return (
        <textarea
            ref={ref}
            className="mb-5 w-full resize-none rounded-md border border-stone-300 bg-white p-4 font-mono text-lg text-stone-900 shadow-sm transition-colors placeholder:text-stone-400 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-200 disabled:cursor-not-allowed disabled:bg-stone-100"
            rows={4}
            value={typedText}
            onChange={onTyping}
            onKeyDown={onKeyDown}
            placeholder="Start typing here when you're ready..."
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
