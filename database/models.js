const mongoose = require('mongoose');

const DealershipSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  full_name: String,
  short_name: String,
  street: String,
  city: String,
  state: String,
  zip: String,
  lat: Number,
  long: Number,
});

const ReviewSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  dealership: { type: Number, required: true }, // dealership id
  name: String,
  purchase: Boolean,
  review: String,
  purchase_date: String,
  car_make: String,
  car_model: String,
  car_year: Number,
  sentiment: { type: String, default: 'neutral' }, // set by Flask sentiment service
});

const Dealership = mongoose.model('Dealership', DealershipSchema);
const Review = mongoose.model('Review', ReviewSchema);

module.exports = { Dealership, Review };
