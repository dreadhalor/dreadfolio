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
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { useApp } from '../providers/app-provider';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Term } from '../utils/terms';
import { Container } from '../components/container';

const TermComponent = () => {
  const { termId = '' } = useParams();
  const { allTerms, lists, addTermToList, removeTermFromList, setFavorite } =
    useApp();
  const [term, setTerm] = useState<Term | null>(
    allTerms.find((term) => term.id === termId) || null,
  );
  const [includedLists, setIncludedLists] = useState<string[]>([]);

  useEffect(() => {
    setTerm(allTerms.find((term) => term.id === termId) || null);
  }, [termId, allTerms]);

  useEffect(() => {
    const foundLists = lists
      .filter((list) => {
        const listTerms = list.terms || [];
        return listTerms.includes(termId);
      })
      .map((list) => list.id);
    setIncludedLists(foundLists || []);
  }, [termId, lists]);

  const handleValueChange = (listIds: string[]) => {
    const toAdd = listIds.filter((listId) => !includedLists.includes(listId));
    const toRemove = includedLists.filter(
      (listId) => !listIds.includes(listId),
    );

    toAdd.forEach((listId) => {
      addTermToList(listId, termId);
    });
    toRemove.forEach((listId) => {
      removeTermFromList(listId, termId);
    });
  };

  return (
    <Container>
      <div className='relative my-12 flex w-full max-w-screen-lg flex-1 select-none flex-col gap-4'>
        {term && (
          <div>
            {term?.favorite ? (
              <MdFavorite
                className='absolute right-2 top-0 cursor-pointer text-2xl hover:fill-white'
                onClick={() => setFavorite(false, term)}
              />
            ) : (
              <MdFavoriteBorder
                className='absolute right-2 top-0 cursor-pointer text-2xl hover:fill-white'
                onClick={() => setFavorite(true, term)}
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
        <div className='mx-auto'>Current term: {term?.term}</div>
        <div className='mx-auto'>Definition: {term?.definition}</div>
      </div>
    </Container>
  );
};

export { TermComponent };
