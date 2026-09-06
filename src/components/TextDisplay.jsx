export default function TextDisplay({ text, typedText }) {
    let globalCharIndex = 0;

    return (
        <div className="mb-5 w-full overflow-hidden rounded-md border border-stone-200 bg-stone-50 p-4 font-mono text-lg leading-8 text-stone-700 whitespace-pre-wrap break-normal">
            {text.split(' ').map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-1">
          {word.split('').map((char, charIndex) => {
              const index = globalCharIndex;
              let className = "relative ";

              if (index < typedText.length) {
                  if (typedText[index] === char) {
                      className += "bg-emerald-100 text-emerald-900";
                  } else {
                      className += "bg-rose-100 text-rose-900";
                  }
              } else if (index === typedText.length) {
                  className += "bg-stone-300 text-stone-950";
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
                                spaceClass = "bg-emerald-100 text-emerald-900";
                            } else {
                                spaceClass = "bg-rose-100 text-rose-900";
                            }
                        } else if (index === typedText.length) {
                            spaceClass = "bg-stone-300 text-stone-950";
                        }

                        globalCharIndex++;

                        return <span className={spaceClass}>&nbsp;</span>;
                    })()}
        </span>
            ))}
        </div>
    );
}
