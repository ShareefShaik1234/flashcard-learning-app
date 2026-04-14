
let cards = [];

export default function handler(req, res) {

  if (req.method === "GET") {
    res.status(200).json(cards);
  }

  else if (req.method === "POST") {
    const { question, answer } = req.body;
    const newCard = { id: Date.now(), question, answer };
    cards.push(newCard);
    res.status(200).json(newCard);
  }

  else if (req.method === "DELETE") {
    cards = [];
    res.status(200).json({ message: "All deleted" });
  }
}
