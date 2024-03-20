import { useState } from 'react';
import { Button } from 'dread-ui';
import { useApp } from '../providers/app-provider';
import { WordPane } from '../components/word-pane/word-pane';
import { Container } from '../components/container';
import { NavLink } from 'react-router-dom';
import { cn } from '@repo/utils';
import { WordFilters } from '../components/word-filters';

const Words = () => {
  const { words } = useApp();
  const [filters, setFilters] = useState({
    missingDefinition: false,
    missingBlurb: false,
    missingBackground: false,
    missingExamples: false,
    missingFillInTheBlank: false,
  });

  const handleFilter = (selectedFilters: typeof filters) => {
    setFilters(selectedFilters);
  };

  const filteredWords = words.filter((word) => {
    if (filters.missingDefinition && word.definition) return false;
    if (filters.missingBlurb && word.blurb) return false;
    if (filters.missingBackground && word.background) return false;
    if (filters.missingExamples && word.examples && word.examples.length > 0)
      return false;
    if (
      filters.missingFillInTheBlank &&
      word.fillInTheBlankQuestions &&
      word.fillInTheBlankQuestions.length > 0
    )
      return false;
    return true;
  });

  return (
    <div className='flex h-full flex-nowrap overflow-hidden'>
      <div className='flex h-full w-[220px] flex-col border'>
        <div className='bg-background'>
          <WordFilters onFilter={handleFilter} count={filteredWords.length} />
        </div>
        <div className='flex-grow overflow-auto'>
          <ul className='w-full'>
            {filteredWords.map((word) => (
              <li key={word.word} className='flex'>
                <NavLink
                  to={`/words/${word.word}`}
                  className={({ isActive }) =>
                    cn(
                      'h-full w-full border',
                      isActive ? 'border-border' : 'border-transparent',
                    )
                  }
                >
                  <Button
                    variant='ghost'
                    className='h-auto w-full text-wrap rounded-none'
                  >
                    {word.word}
                  </Button>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Container className='overflow-auto border'>
        <WordPane />
      </Container>
    </div>
  );
};

export { Words };
