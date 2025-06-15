// src/utils/typing.js
export function calculateAccuracy(typedText, textToType) {
    let correctChars = 0;
    for (let i = 0; i < typedText.length; i++) {
        if (i < textToType.length && typedText[i] === textToType[i]) {
            correctChars++;
        }
    }
    return typedText.length === 0 ? 100 : Math.round((correctChars / typedText.length) * 100);
}