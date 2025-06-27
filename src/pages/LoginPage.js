import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './LoginPage.css';
import logo from '../assets/focusflow-logo.png';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="FocusFlow Logo" className="logo" />
      <h2 className="login-title">Login to FocusFlow</h2>
      <form className="login-box" onSubmit={handleLogin}>
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
        <button className="login-button" type="submit">Login</button>
        <p className="signup-text">
          Don’t have an account? <a href="/register">Sign up here</a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;