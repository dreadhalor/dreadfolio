import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useState } from 'react';

const blobSize = 300;
const Blob = ({ color }) => {
  const controls = useRef(useAnimation()).current;
  const [x, setX] = useState(Math.random() * window.innerWidth - blobSize);
  const [y, setY] = useState(Math.random() * window.innerHeight - blobSize);
  const [vx, setVx] = useState((Math.random() - 0.5) * 20);
  const [vy, setVy] = useState((Math.random() - 0.5) * 20);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update position based on velocity
      setX((prev) => prev + vx);
      setY((prev) => prev + vy);

      // Change velocity slightly to simulate random flow
      setVx((prev) => prev + (Math.random() - 0.5) * 0.5);
      setVy((prev) => prev + (Math.random() - 0.5) * 0.5);

      // Keep the blob within the viewport, but don't trap it in a corner
      if (x < 0 || x > window.innerWidth - blobSize) {
        setVx((prev) => -prev);
      }
      if (y < 0 || y > window.innerHeight - blobSize) {
        setVy((prev) => -prev);
      }

      controls.start({
        x: x,
        y: y,
        transition: { type: 'tween', duration: 0.1, ease: 'linear' },
      });
    }, 100);

    return () => clearInterval(interval);
  }, [controls, x, y, vx, vy]);

  return (
    <motion.div
      className={`absolute h-[300px] w-[300px] rounded-full blur-3xl ${color}`}
      animate={controls}
    />
  );
};

const Blobs = () => {
  return (
    <>
      <Blob color='bg-red-500' />
      <Blob color='bg-green-500' />
      <Blob color='bg-blue-500' />
    </>
  );
};

export { Blobs };
