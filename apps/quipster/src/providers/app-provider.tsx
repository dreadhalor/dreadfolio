import { useAuth } from 'dread-ui';
import React, { useEffect, useState } from 'react';
import { useDB } from '../hooks/use-db';

type AppContextType = {
  lists: any[];
  createList: (name: string) => void;
};
export const AppContext = React.createContext({} as AppContextType);
export const useApp = () => React.useContext(AppContext);

type Props = {
  children: React.ReactNode;
};
export const AppProvider = ({ children }: Props) => {
  const { uid } = useAuth();
  const { subscribeToVocabLists, createList } = useDB(uid!);

  const [lists, setLists] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToVocabLists((lists) => {
      setLists(lists);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToVocabLists]);
  // const { files } = useFiles();

  return (
    <AppContext.Provider
      value={{
        lists,
        createList,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
