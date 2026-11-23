import React, { useState, useEffect, useRef } from 'react';
import { getImageUrl, handleImageError } from '../utils/image';

interface Slide {
  src: string;
  alt: string;
}

const SLIDES: Slide[] = [
  { src: 'imagenes/Bodega.jpg', alt: 'Personal TCA' },
  { src: 'imagenes/example2.jpg', alt: 'Cliente TCA' },
  { src: 'imagenes/EXAMPLE.jpg', alt: 'Almacén TCA' },
  { src: 'imagenes/example3.jpg', alt: 'Oferta 1' },
  { src: 'imagenes/bodega2.jpeg', alt: 'Oferta 2' },
  { src: 'imagenes/estanterias.avif', alt: 'Oferta 3' },
];

export const Carousel3D: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const total = SLIDES.length;
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isHovered) return;
    timerRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, total]);

  const prevIndex = (currentIndex - 1 + total) % total;
  const nextIndex = (currentIndex + 1) % total;

  return (
    <section className="flex justify-center mb-16 relative h-[280px] sm:h-[350px] md:h-[420px] overflow-hidden">
      <div
        className="flex items-center justify-center relative w-full max-w-[1000px] h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {SLIDES.map((slide, index) => {
          let positionStyle: React.CSSProperties;
          let className =
            'absolute transition-all duration-500 ease-in-out rounded-xl cursor-pointer overflow-hidden';

          if (index === currentIndex) {
            className += ' opacity-100 z-10 shadow-2xl';
            positionStyle = {
              transform: 'translateX(0)',
              width: 'min(700px, 88vw)',
              height: 'min(400px, 85%)',
            };
          } else if (index === prevIndex) {
            className += ' opacity-70 z-5 shadow-lg';
            positionStyle = {
              transform: 'translateX(min(-260px, -35vw)) scale(0.85)',
              width: 'min(400px, 55vw)',
              height: 'min(240px, 60%)',
            };
          } else if (index === nextIndex) {
            className += ' opacity-70 z-5 shadow-lg';
            positionStyle = {
              transform: 'translateX(min(260px, 35vw)) scale(0.85)',
              width: 'min(400px, 55vw)',
              height: 'min(240px, 60%)',
            };
          } else {
            let diff = index - currentIndex;
            if (diff < 0) diff += total;
            const isLeft = diff > total / 2;
            className += ' opacity-0 z-0 pointer-events-none';
            positionStyle = {
              transform: `translateX(${isLeft ? -500 : 500}px) scale(0.8)`,
              width: 'min(400px, 55vw)',
              height: 'min(240px, 60%)',
            };
          }

          return (
            <div
              key={slide.src}
              className={className}
              style={positionStyle}
              onClick={() => setCurrentIndex(index)}
              title={slide.alt}
            >
              <img
                src={getImageUrl(slide.src)}
                alt={slide.alt}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => handleImageError(e, slide.alt)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
