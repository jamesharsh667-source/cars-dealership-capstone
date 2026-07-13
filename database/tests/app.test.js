const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { Dealership, Review } = require('../models');

// These tests need a reachable MongoDB (set MONGO_URI, e.g. to a local
// `mongodb://localhost:27017/dealershipsDB_test`, or run via
// `docker compose -f docker-compose.test.yml up` in CI). If none is
// reachable, they're skipped rather than failing the whole suite.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dealershipsDB_test';

let mongoAvailable = true;

beforeAll(async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    await Dealership.deleteMany({});
    await Review.deleteMany({});
    await Dealership.create({
      id: 1,
      full_name: 'Test Dealership',
      short_name: 'Test',
      street: '1 Main St',
      city: 'Testville',
      state: 'TX',
      zip: '00000',
    });
  } catch (err) {
    mongoAvailable = false;
  }
});

afterAll(async () => {
  if (mongoAvailable) {
    await Dealership.deleteMany({});
    await Review.deleteMany({});
    await mongoose.disconnect();
  }
});

const maybeTest = () => (mongoAvailable ? test : test.skip);

describe('dealer/review microservice', () => {
  test('GET / returns a health message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  maybeTest()('GET /fetchDealers returns seeded dealers', async () => {
    const res = await request(app).get('/fetchDealers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((d) => d.id === 1)).toBe(true);
  });

  maybeTest()('POST /insert_review creates a review with an incrementing id', async () => {
    const res = await request(app).post('/insert_review').send({
      dealership: 1,
      name: 'Jane Doe',
      purchase: true,
      review: 'Great experience overall.',
      purchase_date: '01/01/2026',
      car_make: 'Toyota',
      car_model: 'Corolla',
      car_year: 2026,
      sentiment: 'positive',
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(1);
    expect(res.body.dealership).toBe(1);
  });

  maybeTest()('GET /fetchReviews/dealer/1 returns the inserted review', async () => {
    const res = await request(app).get('/fetchReviews/dealer/1');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
