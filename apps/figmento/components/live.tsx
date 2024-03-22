// Live.tsx
'use client';

import React, { useCallback, useEffect, useContext } from 'react';
import { LiveCursors } from './cursor/live-cursors';
import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
} from '@figmento/liveblocks.config';
import { CursorMode, ReactionEvent } from '@figmento/types/type';
import { CursorChat } from './cursor/cursor-chat';
import { ReactionSelector } from './reaction/reaction-selector';
import { FlyingReaction } from './reaction/flying-reaction';
import useInterval from '@figmento/hooks/useInterval';
import { useCursorState } from '@figmento/providers/cursor-state-provider';
import { useReactions } from '@figmento/providers/reactions-provider';

export const Live = () => {
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const broadcast = useBroadcastEvent();
  const { cursorState, setCursorState, setReaction, hideCursor } =
    useCursorState();
  const { reactions, addReaction, filterReactions } = useReactions();

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      updateCursorPosition(event);
    },
    [updateMyPresence],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      updateCursorPosition(event);
      handleReactionPress();
    },
    [cursorState.mode, setCursorState],
  );

  const handlePointerLeave = useCallback(() => {
    hideCursor();
  }, [hideCursor]);

  const handlePointerUp = useCallback(() => {
    handleReactionRelease();
  }, [cursorState.mode, setCursorState]);

  const updateCursorPosition = (event: React.PointerEvent) => {
    updateMyPresence({
      cursor: {
        x: event.clientX - event.currentTarget.getBoundingClientRect().x,
        y: event.clientY - event.currentTarget.getBoundingClientRect().y,
      },
    });
  };

  const handleReactionPress = () => {
    if (cursorState.mode === CursorMode.Reaction) {
      setCursorState((state) => ({ ...state, isPressed: true }));
    }
  };

  const handleReactionRelease = () => {
    if (cursorState.mode === CursorMode.Reaction) {
      setCursorState((state) => ({ ...state, isPressed: false }));
    }
  };

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
      } else if (event.key === 'e') {
        console.log('e');
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setCursorState, hideCursor]);

  useInterval(() => {
    filterReactions();
  }, 1000);

  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      const { x, y } = cursor;
      const newReaction = {
        origin: { x, y },
        value: cursorState.reaction,
        timestamp: Date.now(),
      };
      const reactionToBroadcast = { x, y, value: newReaction.value };
      addReaction(newReaction);
      broadcast(reactionToBroadcast);
    }
  }, 100);

  useEventListener((eventData) => {
    const { x, y, value } = eventData.event as ReactionEvent;
    addReaction({
      origin: { x, y },
      value,
      timestamp: Date.now(),
    });
  });

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
          x={reaction.origin.x}
          y={reaction.origin.y}
          timestamp={reaction.timestamp}
          value={reaction.value}
        />
      ))}
      {cursor && <CursorChat />}
      {cursorState.mode === CursorMode.ReactionSelector && <ReactionSelector />}
    </div>
  );
};
