import { useEffect, useState } from 'react';
import { useApp } from '../providers/app-provider';
import { Link } from 'react-router-dom';
// import { Term } from '../utils/terms';

const ListTerms = ({ listId }: { listId: string }) => {
  const [terms, setTerms] = useState([]);
  const { lists, allTerms } = useApp();

  useEffect(() => {
    const list = lists.find((_list) => _list.id === listId);
    const termIds = (list?.terms || []) as string[];
    const terms = termIds.map((termId) => {
      return allTerms.find((term) => term.id === termId);
    });
    setTerms(terms);
  }, [listId, lists, allTerms]);

  useEffect(() => {
    console.log('terms', terms);
  }, [terms]);

  return (
    <ul>
      {terms.map((term) => {
        return (
          <Link key={term.id} to={`/term/${term.id}`}>
            <li key={term.id} className='border p-4 hover:bg-gray-700'>
              {term.term}
            </li>
          </Link>
        );
      })}
    </ul>
  );
};

export { ListTerms };
