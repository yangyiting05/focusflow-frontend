import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GoalPage.css";

export default function GoalPage() {
  const navigate = useNavigate();

  const [selectedGoals, setSelectedGoals] = useState(
    JSON.parse(localStorage.getItem("selectedGoals")) || []
  );

  const suggestedGoals = [
    "Exercise regularly",
    "Read 20 pages daily",
    "Practice meditation",
    "Learn a new language",
    "Work on personal project",
    "Improve diet & cooking",
    "Write a journal",
    "Study for exams",
    "Networking & meet new people",
    "Improve mental well-being",
    "Spend time outdoors",
  ];

  useEffect(() => {
    const storedGoals = JSON.parse(localStorage.getItem("selectedGoals")) || [];
    setSelectedGoals(storedGoals);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedGoals", JSON.stringify(selectedGoals));
  }, [selectedGoals]);

  const toggleGoal = (goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal]
    );
  };

  return (
    <div className="goal-page">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <h2 className="goal-title">Your Goals</h2>
      <p className="goal-subtitle">
        Select personal goals, and FocusFlow will schedule tasks to help you achieve them.
        Click on the goal again to deselect it.
      </p>

      {}
      <div className="goal-buttons">
        {suggestedGoals.map((goal) => (
          <button
            key={goal}
            className={`goal-btn ${
              selectedGoals.includes(goal) ? "selected" : ""
            }`}
            onClick={() => toggleGoal(goal)}
          >
            {goal}
          </button>
        ))}
      </div>

      {}
      {selectedGoals.length > 0 && (
        <div className="selected-goals">
          <h3>Selected Goals:</h3>
          <ul>
            {selectedGoals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
