import { useState } from "react";

function StudyMode({ cards }) {

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!cards || cards.length === 0) {
    return <h3>No flashcards</h3>;
  }

  const card = cards[index];

  const nextCard = () => {
    setIndex((index + 1) % cards.length);
    setFlipped(false);
  };

  return (
    <div className="study-container">

      <h2>Study Mode</h2>

      <div
        className={`flip-card ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flip-inner">

          {/* FRONT */}
          <div className="flip-front">
            {card.question}
          </div>

          {/* BACK */}
          <div className="flip-back">
            {card.answer}
          </div>

        </div>
      </div>

      <div className="study-buttons">
        <button onClick={nextCard}>Next</button>
      </div>

    </div>
  );
}

export default StudyMode;