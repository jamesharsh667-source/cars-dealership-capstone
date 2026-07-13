import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../api';

function Register({ onLogin }) {
  const [form, setForm] = useState({
    userName: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'Authenticated') {
        onLogin(data.userName);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (e) {
      setError('Network error registering.');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="userName">Username</label>
          <input id="userName" name="userName" onChange={handleChange} required />

          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" onChange={handleChange} required />

          <label htmlFor="firstName">First name</label>
          <input id="firstName" name="firstName" onChange={handleChange} />

          <label htmlFor="lastName">Last name</label>
          <input id="lastName" name="lastName" onChange={handleChange} />

          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" onChange={handleChange} />

          <button type="submit" className="btn" style={{ marginTop: 16 }}>
            Create Account
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Register;
