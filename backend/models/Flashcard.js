const mongoose = require("mongoose");

const FlashcardSchema = new mongoose.Schema({
    question: String,
    answer: String
});

module.exports = mongoose.model("Flashcard", FlashcardSchema);