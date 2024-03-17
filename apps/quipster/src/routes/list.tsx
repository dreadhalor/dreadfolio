import { MdFavorite } from 'react-icons/md';
import { Container } from '../components/container';
import { useParams } from 'react-router-dom';
import { useApp } from '../providers/app-provider';

const List = () => {
  const params = useParams();
  const { lists } = useApp();
  const list = lists.find((_list) => _list.id === params.listId);
  const len = list?.terms?.length || 0;
  // console.log('params', params);

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
      </div>
    </Container>
  );
};

export { List };
