import { useAuth } from 'dread-ui';
import React, { useEffect, useState } from 'react';
import { useDB } from '../hooks/use-db';
import { Term, terms as _terms } from '../utils/terms';

type AppContextType = {
  allTerms: Term[];
  setAllTerms: (terms: Term[]) => void;
  lists: any[];
  createList: (name: string) => void;
  addTermToList: (listId: string, term: string) => void;
  removeTermFromList: (listId: string, term: string) => void;
  setFavorite: (favorite: boolean, term: Term) => void;
};
export const AppContext = React.createContext({} as AppContextType);
export const useApp = () => React.useContext(AppContext);

type Props = {
  children: React.ReactNode;
};
export const AppProvider = ({ children }: Props) => {
  const { uid } = useAuth();
  const {
    subscribeToVocabLists,
    createList,
    addTermToList,
    removeTermFromList,
  } = useDB(uid!);
  const [allTerms, setAllTerms] = useState<Term[]>([]);
  const [lists, setLists] = useState([]);

  const setFavorite = (favorite: boolean, term: Term) => {
    const newTerms = allTerms.map((_term) => {
      if (_term.term === term.term) {
        return { ..._term, favorite };
      }
      return _term;
    });
    setAllTerms(newTerms);
  };

  useEffect(() => {
    const keys = Object.keys(_terms);
    // @ts-expect-error keys are strings
    const terms = keys.map((key) => ({ ..._terms[key], id: key }));
    setAllTerms(terms);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToVocabLists((lists) => {
      console.log('lists', lists);
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
        allTerms,
        setAllTerms,
        lists,
        createList,
        addTermToList,
        removeTermFromList,
        setFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
