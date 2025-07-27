import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function MoodPage() {
  const [energy, setEnergy] = useState(5);
  const [savedEnergy, setSavedEnergy] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const storedEnergy = localStorage.getItem(`energy-${today}`);
    if (storedEnergy) {
      setSavedEnergy(parseInt(storedEnergy));
      setEnergy(parseInt(storedEnergy));
    }
  }, []);

  const handleSave = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`energy-${today}`, energy);
    setSavedEnergy(energy);
    alert("Your energy level for today has been saved!");
  };

  return (
    <div className="dashboard-container">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>
      <h2 className="dashboard-title">How’s Your Energy Today?</h2>
      <p>Set your energy level (1 = very low, 10 = very high):</p>
      <input
        type="range"
        min="1"
        max="10"
        value={energy}
        onChange={(e) => setEnergy(parseInt(e.target.value))}
        style={{ width: "80%", margin: "1rem 0" }}
      />
      <h3>{energy} / 10</h3>
      <button onClick={handleSave} className="edit-btn">
        Save Energy Level
      </button>
      {savedEnergy !== null && <p>Saved energy level: {savedEnergy}</p>}
    </div>
  );
}

export default MoodPage;


