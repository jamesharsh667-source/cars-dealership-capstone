import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../api';

function Header({ userName, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, { credentials: 'include' });
    } catch (e) {
      // ignore network errors on logout
    }
    onLogout();
    navigate('/');
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        🚗 Cars Dealership
      </Link>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dealers">Dealers</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        {userName ? (
          <>
            <span style={{ marginLeft: 20 }}>Hi, {userName}</span>
            <button className="btn btn-secondary" style={{ marginLeft: 10 }} onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
