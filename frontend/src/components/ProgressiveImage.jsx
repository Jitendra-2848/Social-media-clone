import { useState, useEffect } from 'react';

const ProgressiveImage = ({ src, thumbnail, alt, className = '' }) => {
  const [currentSrc, setCurrentSrc] = useState(thumbnail || src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    // Load high-quality image
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setError(true);
    };

    img.src = src;
  }, [src]);

  if (error) {
    return (
      <div className="w-full bg-gray-100 p-8 text-center rounded-lg">
        <p className="text-gray-500">Failed to load image</p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gray-100">
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-auto object-contain max-h-[600px] transition-all duration-300 ${
          isLoaded ? 'blur-0' : 'blur-sm'
        } ${className}`}
        loading="lazy"
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveImage;