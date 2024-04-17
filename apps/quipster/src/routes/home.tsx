import { useEffect, useState } from 'react';
import { Term } from '../utils/terms';
import { TermPane } from '../components/term-pane';
import { Container } from '../components/container';
import { TermsListPane } from '../components/terms-list-pane';
import { useApp } from '../providers/app-provider';

function Home() {
  const [currentList, setCurrentList] = useState<string>('all');
  const [currentTerms, setCurrentTerms] = useState<Term[]>([]);
  const [currentTerm, setCurrentTerm] = useState<Term | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentSituation, setCurrentSituation] = useState<any | null>(null);

  const { allTerms, lists, setFavorite } = useApp();

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
    else {
      const listTerms = lists.find((list) => list.id === currentList)?.terms;
      const includedTerms = allTerms.filter((term) => {
        return listTerms.includes(term.id);
      });
      setCurrentTerms(includedTerms);
    }
  }, [currentList, allTerms, lists]);

  return (
    <div className='flex h-full w-full justify-center border-2'>
      <TermsListPane
        currentTerms={currentTerms}
        setCurrentTerm={setCurrentTerm}
        currentList={currentList}
        setCurrentList={setCurrentList}
      />
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
