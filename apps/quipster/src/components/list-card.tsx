import { MdFavorite } from 'react-icons/md';
import { Link } from 'react-router-dom';

type ListCardProps = {
  list: any;
};
const ListCard = ({ list }: ListCardProps) => {
  const id = list?.id || '';
  console.log('list', list);
  const len = list?.terms?.length || 0;

  return (
    <Link to={`/lists/${id}`}>
      <div className='flex h-[100px] cursor-pointer flex-nowrap gap-4 rounded-lg border p-4 transition-colors hover:border-transparent hover:bg-gray-700'>
        <MdFavorite className='ml-2 h-full text-6xl' />
        <div className='flex h-full flex-col justify-center'>
          <span className='font-bold'>{list?.name}</span>
          <span className='font-light'>{len} terms</span>
        </div>
      </div>
    </Link>
  );
};

export { ListCard };
