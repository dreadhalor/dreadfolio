import { useMyPresence } from '@figmento/liveblocks.config';
import { useCursorState } from '@figmento/providers/cursor-state-provider';
import CursorSVG from '@figmento/public/assets/CursorSVG';
import { CursorChatProps, CursorMode, CursorState } from '@figmento/types/type';
import React from 'react';
import { CursorChatBubble } from './cursor-chat-bubble';

export const CursorChat = () => {
  const { cursorState, setCursorState } = useCursorState();
  const [{ cursor, message }, updateMyPresence] = useMyPresence();
  if (!cursor) return null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateMyPresence({ message: event.target.value });
    setCursorState({
      mode: CursorMode.Chat,
      previousMessage: null,
      message: event.target.value,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setCursorState({
        mode: CursorMode.Chat,
        previousMessage: message,
        message: event.currentTarget.value,
      });
    } else if (event.key === 'Escape') {
      setCursorState({ mode: CursorMode.Hidden });
    }
  };

  return (
    <div
      className='absolute'
      style={{
        top: cursor.y,
        left: cursor.x,
      }}
    >
      {cursorState.mode === CursorMode.Chat && (
        <>
          <CursorSVG color='#000' />
          {cursorState.previousMessage && (
            <div>{cursorState.previousMessage}</div>
          )}
          <CursorChatBubble className='left-2 top-5 bg-blue-500'>
            <input
              className='z-10 w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none'
              autoFocus
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={
                cursorState.previousMessage ? '' : 'Type a message...'
              }
              value={cursorState.message || ''}
              maxLength={50}
            />
          </CursorChatBubble>
        </>
      )}
    </div>
  );
};
