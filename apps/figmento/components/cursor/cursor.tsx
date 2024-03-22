import { Presence } from '@figmento/liveblocks.config';
import CursorSVG from '@figmento/public/assets/CursorSVG';
import React from 'react';
import { CursorChatBubble } from './cursor-chat-bubble';

type CursorProps = {
  color: string;
  presence: Presence;
};
const Cursor = ({ color, presence: { cursor, message } }: CursorProps) => {
  if (!cursor) return null;

  const { x, y } = cursor;
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
        <CursorChatBubble
          className='left-2 top-5 max-w-[200px]'
          backgroundColor={color}
        >
          {message}
        </CursorChatBubble>
      )}
    </div>
  );
};

export { Cursor };
