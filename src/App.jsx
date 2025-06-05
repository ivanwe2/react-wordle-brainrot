import { useState, useEffect } from "react";
import { languages } from "./data/languages";
import clsx from "clsx";
import { getFarewellText, getRandomWord } from "./utils/utils";
import Confetti from "react-confetti";

function App() {
  const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

  const [currentWord, setCurrentWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);

  const fetchWord = async () => {
    try {
      const response = await fetch(
        "https://random-words-api.kushcreates.com/api?category=brainrot&type=lowercase&words=1"
      );
      const data = await response.json();

      if (Array.isArray(data) && data[0]?.word) {
        setCurrentWord(data[0].word);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch word:", error);
      setCurrentWord(getRandomWord());
    }
  };

  useEffect(() => {
    fetchWord();
  }, []);

  const numGuessesLeft = languages.length - 1;
  const wrongGuessCount = guessedLetters.filter(
    (letter) => !currentWord.includes(letter)
  ).length;
  const isLost = wrongGuessCount >= languages.length - 1;
  const isWon = [...currentWord].every((letter) =>
    guessedLetters.includes(letter)
  );
  const isGameOver = isLost || isWon;
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
  const isLastGuessIncorrect =
    lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  function handleGuessLetter(letter) {
    setGuessedLetters((prev) =>
      prev.includes(letter) ? prev : [...prev, letter]
    );
  }

  const languageElements = languages.map((lang, index) => {
    const styles = {
      backgroundColor: lang.backgroundColor,
      color: lang.color,
    };
    const classes = clsx("chip", index < wrongGuessCount && "lost");
    return (
      <span className={classes} style={styles} key={lang.name}>
        {lang.name}
      </span>
    );
  });

  const letterElements = currentWord.split("").map((letter, index) => (
    <span
      key={index}
      style={{
        color: !guessedLetters.includes(letter) && isLost ? "red" : "white",
      }}
    >
      {guessedLetters.includes(letter) || isGameOver
        ? letter.toUpperCase()
        : ""}
    </span>
  ));

  const keyboardElements = [...ALPHABET].map((letter, key) => {
    const isGuessed = guessedLetters.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);
    const className = clsx({
      ["guess-correct"]: isCorrect,
      ["guess-wrong"]: isWrong,
    });

    return (
      <button
        className={className}
        key={letter}
        onClick={() => handleGuessLetter(letter)}
        disabled={isGameOver}
        aria-disabled={guessedLetters.includes(letter)}
        aria-label={`Letter ${letter}`}
      >
        {letter.toUpperCase()}
      </button>
    );
  });

  const statusSection = () => {
    const title = isWon
      ? "You win!"
      : isLost
      ? "Game over!"
      : isLastGuessIncorrect
      ? `${getFarewellText(languages[wrongGuessCount - 1].name) ?? ""}`
      : "";
    const message = isWon
      ? "Well done! 🎉"
      : isLost
      ? "You lose! Better start learning Assembly 😭"
      : "";
    const classes = clsx(
      "status-section",
      isWon && "won",
      isLost && "lost",
      isLastGuessIncorrect && "wrong"
    );
    return (
      <section className={classes}>
        <h2>{title}</h2>
        <p>{message}</p>
      </section>
    );
  };

  if (!currentWord) {
    return <p>Loading word...</p>;
  }

  return (
    <>
      {isWon && <Confetti />}
      <header>
        <h1>Assembly: <strong>Brainrot</strong> Endgame</h1>
        <p>
          Guess the word in under 8 attempts to keep the programming world safe
          from Assembly!
        </p>
      </header>
      <main>
        {statusSection()}
        <section className="languages-section">{languageElements}</section>

        <section className="word-section">{letterElements}</section>

        {/* Combined visually-hidden aria-live region for status updates */}
        <section className="sr-only" aria-live="polite" role="status">
          <p>
            {currentWord.includes(lastGuessedLetter)
              ? `Correct! The letter ${lastGuessedLetter} is in the word.`
              : `Sorry, the letter ${lastGuessedLetter} is not in the word.`}
            You have {numGuessesLeft} attempts left.
          </p>
          <p>
            Current word:{" "}
            {currentWord
              .split("")
              .map((letter) =>
                guessedLetters.includes(letter) ? letter + "." : "blank."
              )
              .join(" ")}
          </p>
        </section>

        <section className={`alphabet-section ${isGameOver ? "disabled" : ""}`}>
          {keyboardElements}
        </section>

        {isGameOver && (
          <button
            className="new-game"
            onClick={() => {
              setGuessedLetters([]);
              fetchWord();
            }}
          >
            New Game
          </button>
        )}
      </main>
    </>
  );
}

export default App;
