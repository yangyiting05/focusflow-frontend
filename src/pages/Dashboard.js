import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './Dashboard.css';
import logo from '../assets/focusflow-logo.png';
import { List, Calendar, Smile, Target, LogOut } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Successfully logged out!');
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <div className="dashboard-container">
      <img src={logo} alt="FocusFlow logo" className="dashboard-logo" />

      <h1 className="dashboard-title">Welcome to FocusFlow</h1>

      <div className="dashboard-user-inline">
        <p className="dashboard-email">
          Logged in as <strong>{user?.email}</strong>
        </p>
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'User'}`}
          alt="User avatar"
          className="profile-avatar-inline"
        />
      </div>

      <p className="dashboard-subtitle">
        Where clarity meets productivity.
      </p>

      <div className="dashboard-quote">
        <em>"It’s not about having time. It’s about making time." – Unknown</em>
      </div>

      <div className="dashboard-grid">
        <Card icon={<List size={28} />} label="New To-Do List" href="/todo" />
        <Card icon={<Calendar size={28} />} label="View Timetable" href="/timetable" />
        <Card icon={<Smile size={28} />} label="How I'm Feeling" href="/mood" />
        <Card icon={<Target size={28} />} label="Goal Setting" href="/goals" />
      </div>

      <button onClick={handleLogout} className="logout-bar">
        <LogOut size={18} /> <span>Logout</span>
      </button>

      <ToastContainer position="bottom-center" />
    </div>
  );
}

function Card({ icon, label, href }) {
  const navigate = useNavigate();
  return (
    <div className="dashboard-card" onClick={() => navigate(href)}>
      <div className="dashboard-card-icon">{icon}</div>
      <div>{label}</div>
    </div>
  );
}