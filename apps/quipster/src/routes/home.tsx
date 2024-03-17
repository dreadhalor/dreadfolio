import { useEffect, useState } from 'react';
import { Term, terms as _terms } from '../terms';
import { TermPane } from '../components/term-pane';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'dread-ui';
import { Container } from '../components/container';

function Home() {
  const [allTerms, setAllTerms] = useState(_terms);
  const [currentList, setCurrentList] = useState<string>('all');
  const [currentTerms, setCurrentTerms] = useState<Term[]>([]);
  const [currentTerm, setCurrentTerm] = useState<Term | null>(null);
  const [currentSituation, setCurrentSituation] = useState<any | null>(null);

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
    if (currentTerm) {
      const term = allTerms.find((term) => term.term === currentTerm.term);
      setCurrentTerm(term || null);
    }
  }, [allTerms, currentTerm]);

  useEffect(() => {
    const situations = currentTerm?.situations;
    if (situations) {
      setCurrentSituation(
        situations[Math.floor(Math.random() * situations.length)],
      );
    }
  }, [currentTerm]);

  useEffect(() => {
    if (currentList === 'all') setCurrentTerms(allTerms);
    else if (currentList === 'favorites')
      setCurrentTerms(allTerms.filter((term) => term.favorite));
  }, [currentList, allTerms]);

  return (
    <div className='flex h-full w-full justify-center border-2'>
      <div className='mr-auto flex w-[200px] flex-col overflow-auto border'>
        <Select value={currentList} onValueChange={setCurrentList}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='List' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='favorites'>Favorites</SelectItem>
          </SelectContent>
        </Select>
        <ul className='w-full'>
          {currentTerms.map((term, index) => (
            <li key={index}>
              <Button
                variant='ghost'
                className='h-auto w-full text-wrap rounded-lg'
                onClick={() => setCurrentTerm(term)}
              >
                {term.term}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <Container className='px-12'>
        <TermPane
          currentTerm={currentTerm}
          currentSituation={currentSituation}
          setFavorite={setFavorite}
        />
      </Container>
    </div>
  );
}

export { Home };
