import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from './App';

test('renders the Cars Dealership header and home page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  expect(screen.getByRole('heading', { name: /Welcome to Cars Dealership/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Browse Dealers/i })).toBeInTheDocument();
});
