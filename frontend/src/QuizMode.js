import { useEffect, useState } from "react";
import axios from "axios";

function QuizMode() {

  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  // ================= FETCH FLASHCARDS =================
  useEffect(() => {
    axios.get("api/flashcards")
      .then(res =>
        // 🔥 Shuffle questions
        setCards(res.data.sort(() => Math.random() - 0.5))
      )
      .catch(err => console.log(err));
  }, []);

  // ================= LOADING =================
  if (cards.length === 0) {
    return <p>Loading...</p>;
  }

  // ================= FINISHED SCREEN =================
  if (finished) {
    return (
      <div className="quiz-container">
        <h2>🎉 Quiz Completed</h2>
        <h3>Your Score: {score} / {cards.length}</h3>

        <button
          className="quiz-btn"
          onClick={() => window.location.reload()}
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  const card = cards[index];

  // ================= CHECK ANSWER =================
  const checkAnswer = () => {
    if (!input.trim()) {
      alert("Enter answer");
      return;
    }

    if (input.toLowerCase() === card.answer.toLowerCase()) {
      setScore(prev => prev + 1);   // ✅ FIXED
      setResult("Correct");
    } else {
      setResult("Wrong");
    }

    setAnswered(true);
  };

  // ================= SAVE SCORE =================
  const finishQuiz = async () => {
    const name = localStorage.getItem("username");

    if (!name) {
      alert("User not logged in");
      return;
    }

    try {
      await axios.post("http://localhost:5000/score", {
        name: name,
        score: score
      });

      setFinished(true);   // ✅ Show final screen
    } catch (err) {
      console.log("Error saving score:", err);
    }
  };

  // ================= NEXT QUESTION =================
  const nextQuestion = () => {
    setInput("");
    setResult("");
    setAnswered(false);

    if (index + 1 < cards.length) {
      setIndex(index + 1);
    } else {
      finishQuiz();   // ✅ Last question
    }
  };

  // ================= UI =================
  return (
    <div className="quiz-container">

      <h2>Quiz Mode</h2>

      {/* Header */}
      <div className="quiz-header">
        <span>Question {index + 1} / {cards.length}</span>
        <span>Score: {score}</span>
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress">
        <div style={{ width: `${((index + 1) / cards.length) * 100}%` }}></div>
      </div>

      {/* Question */}
      <div className="quiz-card">
        {card.question}
      </div>

      {/* Input */}
      <input
        className="quiz-input"
        placeholder="Type your answer..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={answered}
      />

      {/* Buttons */}
      {!answered ? (
        <button className="quiz-btn" onClick={checkAnswer}>
          Submit
        </button>
      ) : (
        <button className="quiz-btn" onClick={nextQuestion}>
          Next
        </button>
      )}

      {/* Result */}
      {result && (
        <p className={`quiz-result ${result === "Correct" ? "correct" : "wrong"}`}>
          {result === "Correct" ? "✅ Correct!" : "❌ Wrong!"}
        </p>
      )}

    </div>
  );
}

export default QuizMode;
