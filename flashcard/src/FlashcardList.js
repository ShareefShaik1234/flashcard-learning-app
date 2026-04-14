import { useState } from "react";
import axios from "axios";

function FlashcardList({ cards, setCards }) {

  const [editingId, setEditingId] = useState(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");

  // 🔥 DELETE (with confirmation + error handling)
  const deleteCard = async (id) => {
    try {
      const confirmDelete = window.confirm("Delete this flashcard?");
      if (!confirmDelete) return;

      await axios.delete(`http://localhost:5000/flashcards/${id}`);

      setCards(prev => prev.filter(card => card._id !== id));

    } catch (err) {
      console.log("Delete error:", err);
      alert("Failed to delete flashcard");
    }
  };

  // 🔥 START EDIT
  const startEdit = (card) => {
    setEditingId(card._id);
    setEditQ(card.question);
    setEditA(card.answer);
  };

  // 🔥 SAVE EDIT (safe + error handling)
  const saveEdit = async (id) => {
    if (!editQ.trim() || !editA.trim()) {
      alert("Fields cannot be empty");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/flashcards/${id}`,
        {
          question: editQ,
          answer: editA
        }
      );

      setCards(prev =>
        prev.map(c => (c._id === id ? res.data : c))
      );

      setEditingId(null);

    } catch (err) {
      console.log("Update error:", err);
      alert("Failed to update flashcard");
    }
  };

  return (
    <div className="flashcard-container">

      <h2>Flashcards</h2>

      {cards.map(card => (

        <div className="flashcard" key={card._id}>

          {editingId === card._id ? (
            <>
              <input
                value={editQ}
                onChange={e => setEditQ(e.target.value)}
              />

              <input
                value={editA}
                onChange={e => setEditA(e.target.value)}
              />

              <div className="card-actions">
                <button onClick={() => saveEdit(card._id)}>
                  Save
                </button>

                <button onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="question">
  <strong>Q:</strong> {card.question}
</div>

<div className="answer">
  <strong>A:</strong> {card.answer}
</div>

              <div className="card-actions">
                <button onClick={() => startEdit(card)}>
                  Edit
                </button>

                <button
                  className="danger"
                  onClick={() => deleteCard(card._id)}
                >
                  Delete
                </button>
              </div>
            </>
          )}

        </div>

      ))}

    </div>
  );
}

export default FlashcardList;