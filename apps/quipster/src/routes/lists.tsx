import { Button } from 'dread-ui';
import { Container } from '../components/container';
import { ListCard } from '../components/list-card';
import { useApp } from '../providers/app-provider';
import { FaPlus } from 'react-icons/fa';
import { useEffect } from 'react';

const Lists = () => {
  const { lists, createList } = useApp();

  useEffect(() => {
    console.log(lists);
  }, [lists]);

  const promptCreateList = () => {
    const name = prompt('List name?');
    if (name) {
      createList(name);
    }
  };

  return (
    <Container>
      <div className='flex h-full w-full max-w-screen-lg flex-col gap-4 px-4 py-12'>
        <div className='flex w-full flex-nowrap justify-between'>
          <h1 className='text-2xl'>My Lists</h1>
          <Button
            variant='outline'
            className='rounded-none'
            onClick={promptCreateList}
          >
            <FaPlus className='mr-2' />
            New List
          </Button>
        </div>
        <div className='grid grid-cols-3 gap-4'>
          {/* <ListCard /> */}
          {lists.map((list, index) => (
            <ListCard key={index} list={list} />
          ))}
        </div>
      </div>
    </Container>
  );
};

export { Lists };
