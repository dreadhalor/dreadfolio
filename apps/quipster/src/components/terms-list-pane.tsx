import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { Term } from '../utils/terms';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'dread-ui';
import { useApp } from '../providers/app-provider';

type TermsListPaneProps = {
  currentTerms: Term[];
  setCurrentTerm: (value: Term) => void;
  currentList: string;
  setCurrentList: (value: string) => void;
};
const TermsListPane = ({
  currentTerms,
  setCurrentTerm,
  currentList,
  setCurrentList,
}: TermsListPaneProps) => {
  const { lists } = useApp();

  return (
    <div className='mr-auto flex w-[200px] flex-col overflow-auto border'>
      <Select value={currentList} onValueChange={setCurrentList}>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='List' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All</SelectItem>
          {lists.map((list, index) => (
            <SelectItem key={index} value={list.id}>
              {list.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ul className='w-full'>
        {currentTerms.map((term, index) => (
          <li key={index}>
            <Button
              variant='ghost'
              className='h-auto w-full text-wrap rounded-none'
              onClick={() => setCurrentTerm(term)}
            >
              {term.term}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { TermsListPane };
