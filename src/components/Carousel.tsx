import React, { useState, useEffect } from 'react';
import '../styles/Login.css';

import bg1 from '../assets/Login Image - 1.jpg';
import bg2 from '../assets/Login Image - 2.jpg';
import bg3 from '../assets/Login Image - 3.jpg';
import bg4 from '../assets/Login Image - 4.jpg';

const Carousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const images = [
    bg1,
    bg2,
    bg3,
    bg4
  ];

  useEffect(() => {
    setIsInitialized(true); 
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="login-carousel">
      {images.map((image, index) => (
        <div
          key={index}
          className={`carousel-slide ${index === currentSlide ? 'active' : ''} ${index === 0 && !isInitialized ? 'initial-active' : ''}`} 
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
    </div>
  );
};

export default Carousel;