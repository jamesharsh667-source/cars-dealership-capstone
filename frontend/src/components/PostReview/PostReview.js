import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../api';

function PostReview({ userName }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    review: '',
    purchase: false,
    purchase_date: '',
    car_make: '',
    car_model: '',
    car_year: new Date().getFullYear(),
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/add_review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          dealership: Number(id),
          name: userName,
        }),
      });
      const data = await res.json();
      if (data.status === 200) {
        navigate(`/dealer/${id}`);
      } else {
        setError(data.message || 'Could not submit review.');
      }
    } catch (e) {
      setError('Network error submitting review.');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Write a Review</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="review">Your review</label>
          <textarea id="review" name="review" rows="4" required onChange={handleChange} />

          <label htmlFor="car_make">Car make</label>
          <input id="car_make" name="car_make" required onChange={handleChange} />

          <label htmlFor="car_model">Car model</label>
          <input id="car_model" name="car_model" required onChange={handleChange} />

          <label htmlFor="car_year">Car year</label>
          <input
            id="car_year"
            name="car_year"
            type="number"
            value={form.car_year}
            onChange={handleChange}
          />

          <label htmlFor="purchase_date">Purchase date</label>
          <input id="purchase_date" name="purchase_date" type="date" onChange={handleChange} />

          <label>
            <input
              type="checkbox"
              name="purchase"
              checked={form.purchase}
              onChange={handleChange}
              style={{ width: 'auto', marginRight: 8 }}
            />
            I purchased a car here
          </label>

          <button type="submit" className="btn" style={{ marginTop: 16 }}>
            Submit Review
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default PostReview;
