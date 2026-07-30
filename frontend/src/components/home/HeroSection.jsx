import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUtils.js';

// High Quality Indian E-Commerce Shopping Sale Banner Fallbacks
const FALLBACK_SLIDES = [
  {
    id: 'slide-1',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000',
  },
  {
    id: 'slide-2',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&q=80&w=2000',
  },
  {
    id: 'slide-3',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000',
  },
];

const HeroSection = ({ adminBanners = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides =
    adminBanners.length > 0
      ? adminBanners.map((b, idx) => ({
          id: b._id || `admin-${idx}`,
          link: b.link || '/products',
          image: getImageUrl(b),
        }))
      : FALLBACK_SLIDES;

  const currentSlide = slides[currentIndex] || slides[0];

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-6 md:-mt-8 mb-6 overflow-hidden group bg-slate-900 h-[220px] xs:h-[260px] sm:h-[340px] md:h-[420px] lg:h-[460px] xl:h-[500px]"
    >
      {/* 1. EDGE-TO-EDGE CLEAN BANNER IMAGE CANVAS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`slide-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <Link to={currentSlide.link} className="block w-full h-full">
            <img
              src={currentSlide.image}
              alt="Promotion Banner"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000';
              }}
              className="w-full h-full object-cover object-center select-none"
            />
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* 2. AUTOMATED PROGRESS LINE AT BOTTOM */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-black/10 overflow-hidden">
        <motion.div
          key={currentIndex}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: isPaused ? 0 : 4.5, ease: 'linear' }}
          className="h-full bg-[#9C27B0]"
        />
      </div>

      {/* 3. SUBTLE NAVIGATION CONTROLS */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs opacity-0 group-hover:opacity-100 shadow-md"
            title="Previous Slide"
          >
            <FiChevronLeft size={24} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs opacity-0 group-hover:opacity-100 shadow-md"
            title="Next Slide"
          >
            <FiChevronRight size={24} />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-[#9C27B0]' : 'w-2 bg-white/70 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSection;
