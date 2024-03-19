import { Button } from 'dread-ui';
import { useApp } from '../providers/app-provider';
import { WordPane } from '../components/word-pane/word-pane';
import { Container } from '../components/container';
import { NavLink } from 'react-router-dom';
import { cn } from '@repo/utils';

const Words = () => {
  const { words } = useApp();

  return (
    <div className='flex flex-nowrap overflow-hidden'>
      <div className='flex h-full w-[200px] flex-col overflow-auto border'>
        <ul className='w-full'>
          {words.map((word) => (
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
      <Container className='overflow-auto border'>
        <WordPane />
      </Container>
    </div>
  );
};

export { Words };