import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register({ onLogin }) {
  const [form, setForm] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/djangoapp/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (data.status === 'Authenticated') {
        onLogin(data.userName);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error registering.');
    }
  };

  return (
    <div className="container">
      <div className="card register-card">
        <h1>Sign-up</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="userName">Username</label>
          <input id="userName" name="userName" placeholder="Username" value={form.userName} onChange={handleChange} required />

          <label htmlFor="firstName">First Name</label>
          <input id="firstName" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />

          <label htmlFor="lastName">Last Name</label>
          <input id="lastName" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />

          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn register-btn">
            Register
          </button>

          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Register;
