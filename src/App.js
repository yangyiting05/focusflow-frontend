import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import TodoPage from './pages/TodoPage';
import TimetablePage from './pages/TimetablePage';
import MoodPage from './pages/MoodPage';
import GoalPage from './pages/GoalPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/todo" element={
          <PrivateRoute>
            <TodoPage />
          </PrivateRoute>
        } />
        <Route path="/timetable" element={
          <PrivateRoute>
            <TimetablePage />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;