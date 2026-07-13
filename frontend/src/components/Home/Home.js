import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container">
      <div className="card">
        <h1>Welcome to Cars Dealership</h1>
        <p>
          Find a dealership near you, read reviews from real customers, and
          share your own experience after a purchase.
        </p>
        <Link to="/dealers">
          <button className="btn">Browse Dealers</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
