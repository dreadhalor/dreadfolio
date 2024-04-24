// hull-loading-screen.tsx
import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

export const HullLoadingScreen = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prevDots) => (prevDots.length >= 3 ? '' : prevDots + '.'));
    }, 500);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 text-white'>
      <FaSpinner className='mb-4 h-12 w-12 animate-spin' />
      <div className='mb-4 text-2xl'>Calculating{dots}</div>
    </div>
  );
};
