import CursorSVG from '@figmento/public/assets/CursorSVG';
import React from 'react';

type CursorProps = {
  color: string;
  x: number;
  y: number;
  message: string | null;
};
const Cursor = ({ color, x, y, message }: CursorProps) => {
  return (
    <div
      className='pointer-events-none absolute'
      style={{
        top: y,
        left: x,
      }}
    >
      <CursorSVG color={color} />
      {message && (
        <div
          className='absolute left-2 top-5 rounded-full px-4 py-2 text-sm leading-relaxed text-white'
          style={{
            backgroundColor: color,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export { Cursor };
