// ReactionsProvider.tsx
'use client';

import { CursorMode, Reaction, ReactionEvent } from '@figmento/types/type';
import { createContext, useContext, useState } from 'react';
import { useEventListener } from '@figmento/liveblocks.config';
import useInterval from '@figmento/hooks/useInterval';
import { usePresence } from './presence-provider';
import { useCursorState } from './cursor-state-provider';

type ReactionsContextType = {
  reactions: Reaction[];
  addReaction: (reaction: Reaction) => void;
};

const ReactionsContext = createContext({} as ReactionsContextType);

export const useReactions = () => {
  return useContext(ReactionsContext);
};

export const ReactionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const {
    presence: { cursor },
    broadcastReaction,
  } = usePresence();
  const { cursorState } = useCursorState();

  const addReaction = (reaction: Reaction) => {
    setReactions((prevReactions) => [...prevReactions, reaction]);
  };

  useInterval(() => {
    setReactions((prevReactions) =>
      prevReactions.filter(
        (reaction) => reaction.timestamp > Date.now() - 4000,
      ),
    );
  }, 1000);

  useInterval(() => {
    if (
      cursor &&
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed
    ) {
      const { x, y } = cursor;
      const newReaction = {
        origin: { x, y },
        value: cursorState.reaction,
        timestamp: Date.now(),
      };
      const reactionToBroadcast = { x, y, value: cursorState.reaction };
      addReaction(newReaction);
      broadcastReaction(reactionToBroadcast);
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
    <ReactionsContext.Provider value={{ reactions, addReaction }}>
      {children}
    </ReactionsContext.Provider>
  );
};
