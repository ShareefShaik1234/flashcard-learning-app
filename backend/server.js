const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ================= MONGODB =================
mongoose.connect("mongodb://127.0.0.1:27017/flashcard_app")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

// ================= MODELS =================
const User = mongoose.model("User", {
  email: String,
  password: String
});

const Flashcard = mongoose.model("Flashcard", {
  question: String,
  answer: String
});

const Score = mongoose.model("Score", {
  name: String,
  score: Number
});

// ================= AUTH ROUTES =================

// Register
app.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: "User Registered Successfully" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.json({ message: "User not found" });

    if (user.password !== req.body.password)
      return res.json({ message: "Wrong password" });

    res.json({ message: "Login successful" });

  } catch (err) {
    res.status(500).json({ error: "Login error" });
  }
});

// ================= FLASHCARD ROUTES =================

// Add flashcard
app.post("/flashcards", async (req, res) => {
  try {
    const card = new Flashcard(req.body);
    await card.save();
    res.json({ message: "Flashcard added" });
  } catch (err) {
    res.status(500).json({ error: "Add failed" });
  }
});

// Get all flashcards
app.get("/flashcards", async (req, res) => {
  try {
    const cards = await Flashcard.find();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// 🔥 DELETE flashcard
app.delete("/flashcards/:id", async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.id);
    res.json({ message: "Flashcard deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// 🔥 UPDATE flashcard
app.put("/flashcards/:id", async (req, res) => {
  try {
    const updated = await Flashcard.findByIdAndUpdate(
      req.params.id,
      {
        question: req.body.question,
        answer: req.body.answer
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// ================= LEADERBOARD =================

// Save score
app.post("/score", async (req, res) => {
  try {
    const newScore = new Score(req.body);
    await newScore.save();
    res.json({ message: "Score saved" });
  } catch (err) {
    res.status(500).json({ error: "Save score failed" });
  }
});

// Get leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: "Fetch leaderboard failed" });
  }
});

// Clear leaderboard
app.delete("/leaderboard", async (req, res) => {
  try {
    await Score.deleteMany({});
    res.json({ message: "Leaderboard cleared" });
  } catch (err) {
    res.status(500).json({ error: "Clear failed" });
  }
});

// ================= START SERVER =================
app.listen(5000, () => {
  console.log("Server running on port 5000");
});