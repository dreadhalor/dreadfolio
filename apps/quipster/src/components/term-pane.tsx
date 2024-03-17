import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  Input,
} from 'dread-ui';
import { Term } from '../utils/terms';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { useApp } from '../providers/app-provider';
import { useEffect, useState } from 'react';

type TermPaneProps = {
  currentTerm?: any; // eslint-disable-line
  currentSituation?: any; // eslint-disable-line
  setFavorite: (favorite: boolean, term: Term) => void;
};
const TermPane = ({
  currentTerm,
  currentSituation,
  setFavorite,
}: TermPaneProps) => {
  const { lists, addTermToList, removeTermFromList } = useApp();
  const [includedLists, setIncludedLists] = useState<string[]>([]);

  useEffect(() => {
    const foundLists = lists
      .filter((list) => {
        const listTerms = list.terms || [];
        return listTerms.includes(currentTerm?.id);
      })
      .map((list) => list.id);
    setIncludedLists(foundLists || []);
  }, [currentTerm, lists]);

  const handleValueChange = (listIds: string[]) => {
    const toAdd = listIds.filter((listId) => !includedLists.includes(listId));
    const toRemove = includedLists.filter(
      (listId) => !listIds.includes(listId),
    );

    toAdd.forEach((listId) => {
      addTermToList(listId, currentTerm.id);
    });
    toRemove.forEach((listId) => {
      removeTermFromList(listId, currentTerm.id);
    });
  };

  return (
    <div className='relative my-12 flex w-full max-w-screen-lg flex-1 select-none flex-col gap-4'>
      {currentTerm && (
        <div>
          {currentTerm?.favorite ? (
            <MdFavorite
              className='absolute right-2 top-0 cursor-pointer text-2xl hover:fill-white'
              onClick={() => setFavorite(false, currentTerm)}
            />
          ) : (
            <MdFavoriteBorder
              className='absolute right-2 top-0 cursor-pointer text-2xl hover:fill-white'
              onClick={() => setFavorite(true, currentTerm)}
            />
          )}
          <Combobox value={includedLists} onChange={handleValueChange}>
            <ComboboxValue className='w-[200px]' placeholder='Add to list' />
            <ComboboxContent>
              <ComboboxInput placeholder='Search lists...' />
              <ComboboxEmpty>No lists found.</ComboboxEmpty>
              <ComboboxList>
                <ComboboxGroup>
                  {lists.map((list) => (
                    <ComboboxItem key={list.id} value={list.id}>
                      {list.name}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      )}
      <div className='mx-auto'>Current term: {currentTerm?.term}</div>
      <div className='mx-auto'>Definition: {currentTerm?.definition}</div>
      <div className='mx-auto'>Situation: {currentSituation?.setup}</div>
      <div className='mx-auto'>{currentSituation?.prompt}</div>
      <div className='mt-8 flex flex-nowrap px-4'>
        <Input className='flex-1 rounded-r-none text-primary' type='text' />
        <Button className='rounded-l-none'>Submit</Button>
      </div>
    </div>
  );
};

export { TermPane };
