import './Dashboard.css';
import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/focusflow-logo.png';

function Dashboard() {
  const user = auth.currentUser;

  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  return (
    <div className="dashboard-container">
      <img src={logo} alt="FocusFlow Logo" className="dashboard-logo" />
      <h2 className="dashboard-title">Welcome to FocusFlow!</h2>
      {user && <p className="dashboard-email">Logged in as <strong>{user.email}</strong></p>}
  
      <div className="dashboard-grid">
  <div className="dashboard-card" onClick={() => navigate('/todo')}>📝<br />New To-Do List</div>
  <div className="dashboard-card" onClick={() => navigate('/timetable')}>📅<br />View Timetable</div>
  <div className="dashboard-card" onClick={() => navigate('/mood')}>😊<br />How I’m Feeling</div>
  <div className="dashboard-card" onClick={() => navigate('/goals')}>🎯<br />Goal Setting</div>
</div>
  
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );  
}

export default Dashboard;