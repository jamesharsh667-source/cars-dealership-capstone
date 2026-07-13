import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE } from '../../api';

function Dealer({ userName }) {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dealerRes, reviewsRes] = await Promise.all([
          fetch(`${API_BASE}/dealer/${id}`),
          fetch(`${API_BASE}/reviews/dealer/${id}`),
        ]);
        const dealerData = await dealerRes.json();
        const reviewsData = await reviewsRes.json();
        setDealer(dealerData.dealer);
        setReviews(reviewsData.reviews || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="container">Loading…</div>;
  if (!dealer) return <div className="container">Dealer not found.</div>;

  const getSentimentEmoji = (sentiment) => {
    if (sentiment === 'positive') return '😄';
    if (sentiment === 'negative') return '😞';
    return '😐';
  };

  return (
    <div className="container">
      <div className="card">
        <h1>{dealer.full_name}</h1>
        <p>
          {dealer.street}, {dealer.city}, {dealer.state} {dealer.zip}
        </p>
        {userName ? (
          <Link to={`/postreview/${id}`}>
            <button className="btn">Write a Review</button>
          </Link>
        ) : (
          <p>
            <Link to="/login">Log in</Link> to write a review.
          </p>
        )}
      </div>

      <h2>Reviews</h2>
      {reviews.length === 0 && <p>No reviews yet. Be the first to write one!</p>}
      {reviews.map((r) => (
        <div key={r.id} className="card review-card">
          <p>
            <strong>{r.name}</strong> — {r.car_year} {r.car_make} {r.car_model}
          </p>
          <p>{r.review}</p>
          <p className={`sentiment-${r.sentiment}`}>
            <span style={{ marginRight: '8px', fontSize: '1.25rem', verticalAlign: 'middle' }}>
              {getSentimentEmoji(r.sentiment)}
            </span>
            Sentiment: {r.sentiment}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Dealer;
