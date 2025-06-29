import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Stats from '../components/landing/Stats';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Stats />
    </div>
  );
};

export default Landing;