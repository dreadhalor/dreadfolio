'use client';

import { Reaction } from '@figmento/types/type';
import { createContext, useContext, useState } from 'react';

type ReactionsContextType = {
  reactions: Reaction[];
  addReaction: (reaction: Reaction) => void;
  filterReactions: () => void;
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

  const addReaction = (reaction: Reaction) => {
    setReactions((prevReactions) => [...prevReactions, reaction]);
  };

  const filterReactions = () => {
    setReactions((prevReactions) =>
      prevReactions.filter(
        (reaction) => reaction.timestamp > Date.now() - 4000,
      ),
    );
  };

  return (
    <ReactionsContext.Provider
      value={{ reactions, addReaction, filterReactions }}
    >
      {children}
    </ReactionsContext.Provider>
  );
};
