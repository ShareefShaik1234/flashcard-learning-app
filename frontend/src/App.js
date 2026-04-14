import "./App.css";
import FlashcardForm from "./FlashcardForm";
import Register from "./Register";
import FlashcardList from "./FlashcardList";
import StudyMode from "./StudyMode";
import Login from "./Login";
import Leaderboard from "./Leaderboard";
import axios from "axios";
import { useState, useEffect, lazy, Suspense } from "react";

const QuizMode = lazy(() => import("./QuizMode"));

function App() {

  const [page, setPage] = useState("login");
  const [cards, setCards] = useState([]);

  const username = localStorage.getItem("username");

  // 🔥 PROTECT ROUTES (VERY IMPORTANT)
  useEffect(() => {
    const user = localStorage.getItem("username");

    if (!user && page !== "login" && page !== "register") {
      setPage("login");
    }
  }, [page]);

  // 🔥 AUTO LOGIN REDIRECT
  useEffect(() => {
    const user = localStorage.getItem("username");

    if (user && page === "login") {
      setPage("home");
    }
  }, []);

  // 🔥 LOAD CARDS
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await axios.get("http://localhost:5000/flashcards");
        setCards(res.data);
      } catch (err) {
        console.log("Error fetching cards:", err);
      }
    };

    fetchCards();
  }, []);

  // 🔄 Refresh cards
  const refreshCards = async () => {
    const res = await axios.get("http://localhost:5000/flashcards");
    setCards(res.data);
  };

  return (
    <div className="container">

      <h1>Flashcard Learning App</h1>

      {/* ✅ SHOW USER */}
      {username && <h3>Welcome, {username} 👋</h3>}

      {/* ================= MENU ================= */}
      <div className="menu">

        <button
          className={page === "register" ? "active" : ""}
          onClick={() => setPage("register")}
        >
          Register
        </button>

        <button
          className={page === "login" ? "active" : ""}
          onClick={() => setPage("login")}
        >
          Login
        </button>

        <button
          className={page === "home" ? "active" : ""}
          onClick={() => setPage("home")}
        >
          Home
        </button>

        <button
          className={page === "study" ? "active" : ""}
          onClick={() => setPage("study")}
        >
          Study
        </button>

        <button
          className={page === "quiz" ? "active" : ""}
          onClick={async () => {
            try {
              const res = await axios.get("http://localhost:5000/flashcards");
              setCards(res.data);
              setPage("quiz");
            } catch (err) {
              console.log(err);
            }
          }}
        >
          Quiz
        </button>

        <button
          className={page === "leaderboard" ? "active" : ""}
          onClick={() => setPage("leaderboard")}
        >
          Leaderboard
        </button>

        {/* 🔥 LOGOUT BUTTON */}
        {username && (
          <button
            onClick={() => {
              localStorage.removeItem("username");
              setPage("login");
            }}
          >
            Logout
          </button>
        )}

      </div>

      {/* ================= PAGES ================= */}

      {page === "register" && <Register setPage={setPage} />}
      {page === "login" && <Login setPage={setPage} />}

      {page === "home" && (
        <>
          <FlashcardForm refresh={refreshCards} />
          <FlashcardList cards={cards} setCards={setCards} />
        </>
      )}

      {page === "study" && <StudyMode cards={cards} />}

      {page === "quiz" && (
        <Suspense fallback={<p>Loading...</p>}>
          <QuizMode />
        </Suspense>
      )}

      {page === "leaderboard" && <Leaderboard />}

    </div>
  );
}

export default App;