import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './LoginPage.css';
import logo from '../assets/focusflow-logo.png';

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="FocusFlow Logo" className="logo" />
      <h2 className="login-title">Sign Up for FocusFlow</h2>
      <form className="login-box" onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
        <button type="submit" className="login-button">Register</button>
        <p className="signup-text">
          Already have an account? <a href="/">Login here</a>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;