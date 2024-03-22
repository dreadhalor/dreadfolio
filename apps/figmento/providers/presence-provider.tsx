'use client';

import {
  useMyPresence,
  useBroadcastEvent,
  Presence,
} from '@figmento/liveblocks.config';
import { createContext, useContext } from 'react';

type PresenceContextType = {
  updateCursorPosition: (event: React.PointerEvent) => void;
  broadcastReaction: (reaction: {
    x: number;
    y: number;
    value: string;
  }) => void;
  presence: Presence;
};

const PresenceContext = createContext({} as PresenceContextType);

export const usePresence = () => {
  return useContext(PresenceContext);
};

export const PresenceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [presence, updateMyPresence] = useMyPresence();
  const broadcast = useBroadcastEvent();

  const updateCursorPosition = (event: React.PointerEvent) => {
    updateMyPresence({
      cursor: {
        x: event.clientX - event.currentTarget.getBoundingClientRect().x,
        y: event.clientY - event.currentTarget.getBoundingClientRect().y,
      },
    });
  };

  const broadcastReaction = (reaction: {
    x: number;
    y: number;
    value: string;
  }) => {
    broadcast(reaction);
  };

  return (
    <PresenceContext.Provider
      value={{ updateCursorPosition, broadcastReaction, presence }}
    >
      {children}
    </PresenceContext.Provider>
  );
};
