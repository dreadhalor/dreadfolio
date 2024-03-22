'use client';

import { useMyPresence } from '@figmento/liveblocks.config';
import { CursorMode, CursorState, Reaction } from '@figmento/types/type';
import { createContext, useContext, useState } from 'react';

type CursorStateContextType = {
  cursorState: CursorState;
  setCursorState: React.Dispatch<React.SetStateAction<CursorState>>;
  setReaction: (reaction: string) => void;
  hideCursor: () => void;
};
const CursorStateContext = createContext({} as CursorStateContextType);

export const useCursorState = () => {
  return useContext(CursorStateContext);
};

export const CursorStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [_, updateMyPresence] = useMyPresence();
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  const setReaction = (reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  };

  const hideCursor = () => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  };

  return (
    <CursorStateContext.Provider
      value={{ cursorState, setCursorState, setReaction, hideCursor }}
    >
      {children}
    </CursorStateContext.Provider>
  );
};
