import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './components/Home/Home';
import About from './components/About/About';
import Contact from './components/Contact/Contact';
import Dealers from './components/Dealers/Dealers';
import Dealer from './components/Dealer/Dealer';
import PostReview from './components/PostReview/PostReview';
import Login from './components/Login/Login';
import Register from './components/Register/Register';

function App() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('userName');
    if (stored) setUserName(stored);
  }, []);

  const handleLogin = (name) => {
    setUserName(name);
    sessionStorage.setItem('userName', name);
  };

  const handleLogout = () => {
    setUserName('');
    sessionStorage.removeItem('userName');
  };

  return (
    <div className="app">
      <Header userName={userName} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dealers" element={<Dealers />} />
        <Route path="/dealer/:id" element={<Dealer userName={userName} />} />
        <Route path="/postreview/:id" element={<PostReview userName={userName} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
