import { useState } from "react";
import axios from "axios";

function FlashcardForm({ refresh }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const addCard = async () => {
    if (!question || !answer) {
      alert("Fill all fields");
      return;
    }

    await axios.post("api/flashcards", {
      question,
      answer
    });

    alert("Flashcard added");
    setQuestion("");
    setAnswer("");

    refresh(); // update list
  };

  return (
    <div>
      <h2>Add Flashcard</h2>

      <input
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <input
        placeholder="Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <button onClick={addCard}>Add</button>
    </div>
  );
}

export default FlashcardForm;
