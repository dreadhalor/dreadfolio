'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { LiveCursors } from './cursor/live-cursors';
import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
} from '@figmento/liveblocks.config';
import {
  CursorMode,
  CursorState,
  Reaction,
  ReactionEvent,
} from '@figmento/types/type';
import { CursorChat } from './cursor/cursor-chat';
import { ReactionSelector } from './reaction/reaction-selector';
import { FlyingReaction } from './reaction/flying-reaction';
import useInterval from '@figmento/hooks/useInterval';

const Live = () => {
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const broadcast = useBroadcastEvent();
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  const [reactions, setReactions] = useState<Reaction[]>([]);

  // set the reaction of the cursor
  const setReaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();

      updateMyPresence({
        cursor: {
          x: event.clientX - event.currentTarget.getBoundingClientRect().x,
          y: event.clientY - event.currentTarget.getBoundingClientRect().y,
        },
      });
    },
    [updateMyPresence],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();

      updateMyPresence({
        cursor: {
          x: event.clientX - event.currentTarget.getBoundingClientRect().x,
          y: event.clientY - event.currentTarget.getBoundingClientRect().y,
        },
      });

      // if cursor is in reaction mode, set isPressed to true
      setCursorState((state) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state,
      );
    },
    [cursorState.mode, setCursorState],
  );

  // Hide the cursor when the mouse leaves the canvas
  const handlePointerLeave = useCallback(() => {
    setCursorState({
      mode: CursorMode.Hidden,
    });
    updateMyPresence({
      cursor: null,
      message: null,
    });
  }, [cursorState.mode, setCursorState]);

  // hide the cursor when the mouse is up
  const handlePointerUp = useCallback(() => {
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction
        ? { ...state, isPressed: false }
        : state,
    );
  }, [cursorState.mode, setCursorState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        updateMyPresence({
          cursor: null,
          message: null,
        });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (event.key === '/') {
        event.preventDefault();
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: '',
        });
      } else if (event.key === 'e') {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setCursorState, updateMyPresence]);

  // Remove reactions that are not visible anymore (every 1 sec)
  useInterval(() => {
    setReactions((reactions) =>
      reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000),
    );
  }, 1000);

  // Broadcast the reaction to other users (every 100ms)
  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      // concat all the reactions created on mouse click
      setReactions((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ]),
      );

      // Broadcast the reaction to other users
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReactions((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ]),
    );
  });

  console.log('cursorState', cursorState);

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
      {/* Render the reactions */}
      {reactions.map((reaction) => (
        <FlyingReaction
          key={reaction.timestamp.toString()}
          x={reaction.point.x}
          y={reaction.point.y}
          timestamp={reaction.timestamp}
          value={reaction.value}
        />
      ))}
      {cursor && (
        <CursorChat cursorState={cursorState} setCursorState={setCursorState} />
      )}
      {cursorState.mode === CursorMode.ReactionSelector && (
        <ReactionSelector setReaction={setReaction} />
      )}
    </div>
  );
};

export { Live };
