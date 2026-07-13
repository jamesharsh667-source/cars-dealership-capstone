require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Dealership, Review } = require('./models');

const app = express();
const PORT = process.env.PORT || 3030;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo_db:27017/dealershipsDB';

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB at', MONGO_URI))
  .catch((err) => console.error('MongoDB connection error:', err));

// Health check
app.get('/', (req, res) => {
  res.send('Cars Dealership - Dealer/Review microservice is running');
});

// GET all dealers, optionally filtered by state: /fetchDealers or /fetchDealers/:state
app.get('/fetchDealers', async (req, res) => {
  try {
    const dealers = await Dealership.find();
    res.json(dealers);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching dealers', details: err.message });
  }
});

app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const dealers = await Dealership.find({ state: req.params.state });
    res.json(dealers);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching dealers by state', details: err.message });
  }
});

// GET single dealer by id: /fetchDealer/:id
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealer = await Dealership.findOne({ id: req.params.id });
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
    res.json(dealer);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching dealer', details: err.message });
  }
});

// GET reviews for a dealer: /fetchReviews/dealer/:id
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ dealership: req.params.id });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching reviews', details: err.message });
  }
});

// POST insert a new review: /insert_review
app.post('/insert_review', async (req, res) => {
  try {
    const data = req.body;
    const lastReview = await Review.findOne().sort({ id: -1 });
    const newId = lastReview ? lastReview.id + 1 : 1;

    const review = new Review({
      id: newId,
      dealership: data.dealership,
      name: data.name,
      purchase: data.purchase,
      review: data.review,
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: data.car_year,
      sentiment: data.sentiment || 'neutral',
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Error inserting review', details: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Dealer/Review microservice listening on port ${PORT}`);
  });
}

module.exports = app;
