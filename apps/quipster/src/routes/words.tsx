import { Button } from 'dread-ui';
import { useApp } from '../providers/app-provider';
import { WordPane } from '../components/word-pane';
import { Container } from '../components/container';
import { Link } from 'react-router-dom';

const Words = () => {
  const { words } = useApp();

  return (
    <div className='flex flex-nowrap overflow-hidden'>
      <div className='flex h-full w-[200px] flex-col overflow-auto border'>
        <ul className='w-full'>
          {words.map((word) => (
            <li key={word.word}>
              <Link to={`/words/${word.word}`}>
                <Button
                  variant='ghost'
                  className='h-auto w-full text-wrap rounded-none'
                >
                  {word.word}
                </Button>
              </Link>
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
