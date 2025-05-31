import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useState } from 'react';
import './LoginPage.css';
import logo from '../assets/focusflow-logo.png';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const toggleForm = () => setIsLogin(!isLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      alert('Please fill in all required fields.');
      return;
    }
  
    setLoading(true);
  
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in successfully!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Account created successfully!');
      }
  
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };    

  return (
    <div className="login-container">
      <img src={logo} alt="FocusFlow Logo" className="login-logo" />
      <h2 className="login-title">{isLogin ? 'Login to FocusFlow' : 'Create a FocusFlow Account'}</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
  {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
</button>
      </form>

      <p className="signup-prompt">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span onClick={toggleForm}>
          {isLogin ? 'Sign up here' : 'Login here'}
        </span>
      </p>
    </div>
  );
}

export default LoginPage;