import { MdFavorite } from 'react-icons/md';
import { Container } from '../components/container';
import { useParams } from 'react-router-dom';
import { useApp } from '../providers/app-provider';
import { ListTerms } from '../components/list-terms';

const List = () => {
  const { listId } = useParams();
  const { lists } = useApp();
  const list = lists.find((_list) => _list.id === listId);
  const len = list?.terms?.length || 0;

  return (
    <Container>
      <div className='flex w-full max-w-screen-lg flex-col'>
        <div className='flex flex-nowrap gap-4 border p-5'>
          <MdFavorite className='text-8xl' />
          <div className='flex flex-col justify-center gap-2'>
            <span className='text-2xl font-bold'>{list?.name}</span>
            <span className='font-light'>{len} terms</span>
          </div>
        </div>
        <ListTerms listId={listId ?? ''} />
      </div>
    </Container>
  );
};

export { List };
