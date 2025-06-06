export default function TextDisplay({ text, typedText }) {
    let globalCharIndex = 0;

    return (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 text-lg font-mono leading-relaxed w-full whitespace-pre-wrap break-normal overflow-hidden">
            {text.split(' ').map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-1">
          {word.split('').map((char, charIndex) => {
              const index = globalCharIndex;
              let className = "relative ";

              if (index < typedText.length) {
                  if (typedText[index] === char) {
                      className += "bg-green-200 text-green-800";
                  } else {
                      className += "bg-red-200 text-red-800";
                  }
              } else if (index === typedText.length) {
                  className += "bg-blue-200 animate-pulse";
              }

              globalCharIndex++;

              return (
                  <span key={charIndex} className={className}>
                {char}
              </span>
              );
          })}
                    {/* Render the space after the word */}
                    {(() => {
                        const index = globalCharIndex;
                        let spaceClass = "";

                        if (index < typedText.length) {
                            if (typedText[index] === ' ') {
                                spaceClass = "bg-green-200 text-green-800";
                            } else {
                                spaceClass = "bg-red-200 text-red-800";
                            }
                        } else if (index === typedText.length) {
                            spaceClass = "bg-blue-200 animate-pulse";
                        }

                        globalCharIndex++;

                        return <span className={spaceClass}>&nbsp;</span>;
                    })()}
        </span>
            ))}
        </div>
    );
}
