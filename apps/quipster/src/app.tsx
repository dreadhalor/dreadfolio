import { useEffect, useState } from 'react';
// import { getScenario } from './client';
import { Term, terms as _terms } from './utils/terms';
import { TermPane } from './components/term-pane';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'dread-ui';
import { Navbar } from './components/navbar';
import { Outlet } from 'react-router-dom';

function App() {
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

  // const [response, setResponse] = useState<any | null>(null);
  // const [definition, setDefinition] = useState<string | null>(null);
  // const [situation, setSituation] = useState<string | null>(null);

  // useEffect(() => {
  //   if (currentTerm) {
  //     getScenario(currentTerm).then((response) => {
  //       const situation = response.content[0].text;
  //       setSituation(situation);
  //       console.log(response);
  //       // setResponse(response);
  //     });
  //   }
  // }, [currentTerm]);

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
    <div className='flex h-full w-full flex-col'>
      <Navbar />
      <Outlet />
    </div>
  );
}

export { App };
