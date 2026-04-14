
let scores = [];

export default function handler(req, res) {

  if (req.method === "GET") {
    res.status(200).json(scores);
  }

  else if (req.method === "POST") {
    const { name, score } = req.body;
    const newScore = { id: Date.now(), name, score };
    scores.push(newScore);
    res.status(200).json(newScore);
  }

  else if (req.method === "DELETE") {
    scores = [];
    res.status(200).json({ message: "Leaderboard cleared" });
  }
}
