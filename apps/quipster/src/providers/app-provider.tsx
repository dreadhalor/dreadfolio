import { useAuth } from 'dread-ui';
import React, { useEffect, useState } from 'react';
import { useDB } from '../hooks/use-db';
import { Term, terms as _terms } from '../utils/terms';

type AppContextType = {
  allTerms: Term[];
  setAllTerms: (terms: Term[]) => void;
  words: any[];
  lists: any[];
  createList: (name: string) => void;
  addTermToList: (listId: string, term: string) => void;
  removeTermFromList: (listId: string, term: string) => void;
  setFavorite: (favorite: boolean, term: Term) => void;
  selectedWord: any;
  setSelectedWord: (word: any) => void;
  saveWord: (word: any) => void;
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
    subscribeToWords,
    createList,
    addTermToList,
    removeTermFromList,
    saveWord,
  } = useDB(uid!);
  const [allTerms, setAllTerms] = useState<Term[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [words, setWords] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedWord, setSelectedWord] = useState<any>({});
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
      setLists(lists);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToVocabLists]);

  useEffect(() => {
    const unsubscribe = subscribeToWords((words) => setWords(words));

    return () => {
      unsubscribe();
    };
  }, [subscribeToWords]);

  useEffect(() => {
    if (!words) return;
    if (words.length === 0) return;
    if (selectedWord?.word) return;
    setSelectedWord(words[0]);
  }, [words, selectedWord]);

  return (
    <AppContext.Provider
      value={{
        allTerms,
        setAllTerms,
        words,
        lists,
        createList,
        addTermToList,
        removeTermFromList,
        setFavorite,
        selectedWord,
        setSelectedWord,
        saveWord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
