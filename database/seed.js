require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Dealership, Review } = require('./models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo_db:27017/dealershipsDB';
const SENTIMENT_URL = process.env.SENTIMENT_URL || 'http://sentiment_analyzer:5050/analyze/';

async function getSentiment(text) {
  try {
    const res = await fetch(`${SENTIMENT_URL}${encodeURIComponent(text)}`);
    const data = await res.json();
    return data.sentiment || 'neutral';
  } catch (err) {
    console.warn('Sentiment service unavailable, defaulting to neutral:', err.message);
    return 'neutral';
  }
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding');

  await Dealership.deleteMany({});
  await Review.deleteMany({});

  const dealers = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/dealerships.json')));
  const reviews = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/reviews.json')));

  await Dealership.insertMany(dealers);
  console.log(`Inserted ${dealers.length} dealerships`);

  for (const r of reviews) {
    r.sentiment = await getSentiment(r.review);
  }
  await Review.insertMany(reviews);
  console.log(`Inserted ${reviews.length} reviews`);

  await mongoose.disconnect();
  console.log('Seeding complete');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
