import React, { useState, useEffect } from 'react';

interface CarouselProps {
  images: string[];
  autoPlayInterval?: number;
}

const Carousel: React.FC<CarouselProps> = ({ 
  images, 
  autoPlayInterval = 5000 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval]);

  const handleIndicatorClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="carousel-container">
      <div className="carousel-slide">
        <img 
          src={images[currentImageIndex]} 
          alt={`Slide ${currentImageIndex + 1}`}
          className="carousel-image"
        />
      </div>
      
      <div className="carousel-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
            onClick={() => handleIndicatorClick(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;