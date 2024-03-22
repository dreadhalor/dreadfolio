'use client';

import React, { useCallback, useEffect } from 'react';
import { LiveCursors } from './cursor/live-cursors';
import { CursorMode } from '@figmento/types/type';
import { CursorChat } from './cursor/cursor-chat';
import { ReactionSelector } from './reaction/reaction-selector';
import { FlyingReaction } from './reaction/flying-reaction';
import { useCursorState } from '@figmento/providers/cursor-state-provider';
import { useReactions } from '@figmento/providers/reactions-provider';
import { usePresence } from '@figmento/providers/presence-provider';

export const Live = () => {
  const { cursorState, setCursorState, hideCursor } = useCursorState();
  const { reactions } = useReactions();
  const {
    presence: { cursor },
    updateCursorPosition,
  } = usePresence();

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      updateCursorPosition(event);
    },
    [updateCursorPosition],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      updateCursorPosition(event);
      if (cursorState.mode === CursorMode.Reaction) {
        setCursorState((state) => ({ ...state, isPressed: true }));
      }
    },
    [cursorState.mode, setCursorState, updateCursorPosition],
  );

  const handlePointerLeave = useCallback(() => {
    hideCursor();
  }, [hideCursor]);

  const handlePointerUp = useCallback(() => {
    if (cursorState.mode === CursorMode.Reaction) {
      setCursorState((state) => ({ ...state, isPressed: false }));
    }
  }, [cursorState.mode, setCursorState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideCursor();
      } else if (event.key === '/') {
        event.preventDefault();
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: null,
        });
      } else if (event.key === 'e' && cursorState.mode !== CursorMode.Chat) {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hideCursor, setCursorState]);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      className='relative flex h-full w-full items-center justify-center overflow-hidden bg-black'
    >
      <LiveCursors />
      <h1 className='text-5xl text-white'>Figmento</h1>
      {reactions.map((reaction) => (
        <FlyingReaction
          key={reaction.timestamp.toString()}
          reaction={reaction}
        />
      ))}
      {cursor && <CursorChat />}
      {cursorState.mode === CursorMode.ReactionSelector && <ReactionSelector />}
    </div>
  );
};
