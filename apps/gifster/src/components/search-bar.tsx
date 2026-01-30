import { Button, Input } from 'dread-ui';
import { cn } from '@repo/utils';

type Props = {
  inputState: string;
  setInputState: (value: string) => void;
  setSearchTerm: (value: string) => void;
};

const SearchBar = ({ inputState, setInputState, setSearchTerm }: Props) => {
  return (
    <div className='relative w-full'>
      <div className='flex w-full'>
        <Input
          type='search'
          placeholder='Search for a gif!'
          className='z-10 flex-1'
          value={inputState} // To propagate changes back to the input field
          onChange={(e) => {
            setInputState(e.target.value);
            if (e.target.value === '') {
              setSearchTerm('');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearchTerm(inputState);
            }
          }}
        />
        <Button
          className={cn(
            'pointer-events-none invisible transition-all duration-200',
            inputState ? 'w-[105px]' : 'w-0 p-0',
          )}
        >
          Search
        </Button>
      </div>
      <Button
        className={cn(
          'absolute right-0 top-0 w-[100px] transition-all duration-200',
          inputState ? 'opacity-100' : 'opacity-0',
        )}
        onClick={() => setSearchTerm(inputState)}
      >
        Search
      </Button>
    </div>
  );
};

export { SearchBar };
