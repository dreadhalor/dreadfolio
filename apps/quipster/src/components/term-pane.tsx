import { Button, Input } from 'dread-ui';
import { Term } from '../terms';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';

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
  return (
    <div className='relative my-12 flex w-full max-w-screen-lg flex-1 flex-col gap-4'>
      {currentTerm &&
        (currentTerm?.favorite ? (
          <MdFavorite
            className='absolute right-2 top-0 cursor-pointer text-2xl hover:fill-white'
            onClick={() => setFavorite(false, currentTerm)}
          />
        ) : (
          <MdFavoriteBorder
            className='absolute right-2 top-0 cursor-pointer text-2xl hover:fill-white'
            onClick={() => setFavorite(true, currentTerm)}
          />
        ))}
      <div className='mx-auto'>Current term: {currentTerm?.term}</div>
      <div className='mx-auto'>Definition: {currentTerm?.definition}</div>
      <div className='mx-auto'>Situation: {currentSituation?.setup}</div>
      <div className='mx-auto'>{currentSituation?.prompt}</div>
      <div className='mt-8 flex flex-nowrap px-4'>
        <Input className='flex-1 rounded-r-none' type='text' />
        <Button className='rounded-l-none'>Submit</Button>
      </div>
    </div>
  );
};

export { TermPane };
