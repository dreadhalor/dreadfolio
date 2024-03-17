import { Button } from 'dread-ui';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className='flex w-full flex-nowrap border'>
      <Link to='/' className='ml-4 text-2xl'>
        Quipster
      </Link>
      <Link to='/lists' className='ml-auto'>
        <Button variant='outline' className='rounded-none'>
          Lists
        </Button>
      </Link>
    </div>
  );
};

export { Navbar };
