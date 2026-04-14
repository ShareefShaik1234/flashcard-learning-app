import { useEffect, useState } from "react";
import axios from "axios";

function Leaderboard() {

  const [scores, setScores] = useState([]);

  const fetchScores = () => {
    axios.get("http://localhost:5000/leaderboard")
      .then(res => setScores(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchScores();
  }, []);

  // 🔥 CLEAR ONLY WHEN USER CLICKS
  const clearScores = async () => {

    const confirmDelete = window.confirm("Are you sure you want to clear leaderboard?");

    if (!confirmDelete) return;

    await axios.delete("http://localhost:5000/leaderboard");

    fetchScores(); // reload after delete
  };

  return (
    <div className="card">

      <h2>🏆 Leaderboard</h2>

      {/* ACTION BUTTONS */}
      <div className="leaderboard-actions">
        <button onClick={fetchScores}>Refresh</button>
        <button className="danger" onClick={clearScores}>
          Clear Scores
        </button>
      </div>

      {/* LIST */}
      {scores.map((item, index) => (
        <div key={index} className="leaderboard-item">
          <span>#{index + 1}</span>
          <span>{item.name}</span>
          <span>{item.score} pts</span>
        </div>
      ))}

    </div>
  );
}

export default Leaderboard;