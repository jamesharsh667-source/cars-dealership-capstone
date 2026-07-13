import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../../api';

function Login({ onLogin }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userName, password }),
      });
      const data = await res.json();
      if (data.status === 'Authenticated') {
        onLogin(data.userName);
        navigate('/');
      } else {
        setError('Invalid username or password.');
      }
    } catch (e) {
      setError('Network error logging in.');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 400, margin: '0 auto' }}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="userName">Username</label>
          <input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} required />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn" style={{ marginTop: 16 }}>
            Log In
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
        <p style={{ marginTop: 12 }}>
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
