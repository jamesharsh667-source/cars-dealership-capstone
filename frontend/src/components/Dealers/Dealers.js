import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../../api';

const STATES = ['All', 'TX', 'IL', 'CO', 'FL', 'WA'];

function Dealers() {
  const [dealers, setDealers] = useState([]);
  const [state, setState] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDealers = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint =
          state === 'All' ? `${API_BASE}/get_dealers` : `${API_BASE}/get_dealers/${state}`;
        const res = await fetch(endpoint);
        const data = await res.json();
        setDealers(data.dealers || []);
      } catch (e) {
        setError('Could not load dealers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDealers();
  }, [state]);

  return (
    <div className="container">
      <h1>Our Dealerships</h1>
      <div className="state-filter">
        <label htmlFor="state-select">Filter by state: </label>
        <select id="state-select" value={state} onChange={(e) => setState(e.target.value)}>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading dealers…</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="dealer-list">
        {dealers.map((dealer) => (
          <Link key={dealer.id} to={`/dealer/${dealer.id}`} className="card">
            <h3>{dealer.short_name}</h3>
            <p>
              {dealer.street}, {dealer.city}, {dealer.state} {dealer.zip}
            </p>
          </Link>
        ))}
        {!loading && dealers.length === 0 && !error && <p>No dealers found for this state.</p>}
      </div>
    </div>
  );
}

export default Dealers;
