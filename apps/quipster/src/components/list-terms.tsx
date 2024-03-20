import { useEffect, useState } from 'react';
import { useApp } from '../providers/app-provider';
import { Link } from 'react-router-dom';
// import { Term } from '../utils/terms';

const ListTerms = ({ listId }: { listId: string }) => {
  const [terms, setTerms] = useState([]);
  const [listWords, setListWords] = useState([]);
  const { lists, allTerms, words } = useApp();

  useEffect(() => {
    const list = lists.find((_list) => _list.id === listId);
    const termIds = (list?.terms || []) as string[];
    const terms = allTerms.filter((term) => termIds.includes(term.id));
    const _words = words.filter((word) => termIds.includes(word.id));
    setTerms(terms);
    setListWords(_words);
  }, [listId, lists, allTerms, words]);

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
      {listWords.map((word) => {
        return (
          <Link key={word.id} to={`/words/${word.word}`}>
            <li key={word.id} className='border p-4 hover:bg-gray-700'>
              {word.word}
            </li>
          </Link>
        );
      })}
    </ul>
  );
};

export { ListTerms };
