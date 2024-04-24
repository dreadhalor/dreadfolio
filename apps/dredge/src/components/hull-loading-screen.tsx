// hull-loading-screen.tsx
import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useDredge } from '@dredge/providers/dredge-provider';

export const HullLoadingScreen = () => {
  const [dots, setDots] = useState('');
  const { cancelCalculation } = useDredge();

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
      <button
        className='rounded border border-white bg-transparent px-4 py-2 text-white hover:bg-gray-600'
        onClick={cancelCalculation}
      >
        Cancel
      </button>
    </div>
  );
};
