import { FaShoppingBag, FaSearch, FaUser } from 'react-icons/fa';
import { HeroCarousel } from '../components/home/hero-carousel';
import { HeroSection } from '../components/home/hero-section';
import { FeaturedCategories } from '../components/home/featured-categories';
import { ProductReel } from '@flowerchild/components/product-reel';
import { MaxWidthWrapper } from '@flowerchild/components/max-width-wrapper';
import { NewArrivals } from '../components/home/new-arrivals';

const App = () => {
  return (
    <div className='bg-primary min-h-screen'>
      {/* Header */}
      {/* <header className='bg-primary shadow'>
        <div className='container mx-auto flex items-center justify-between px-4 py-6'>
          <a href='/' className='text-2xl font-bold text-gray-800'>
            FlowerChild
          </a>
          <nav>
            <ul className='flex space-x-4'>
              <li>
                <a href='/women' className='text-gray-600 hover:text-gray-800'>
                  Women
                </a>
              </li>
              <li>
                <a href='/men' className='text-gray-600 hover:text-gray-800'>
                  Men
                </a>
              </li>
              <li>
                <a
                  href='/accessories'
                  className='text-gray-600 hover:text-gray-800'
                >
                  Accessories
                </a>
              </li>
              <li>
                <a href='/sale' className='text-gray-600 hover:text-gray-800'>
                  Sale
                </a>
              </li>
            </ul>
          </nav>
          <div className='flex items-center space-x-4'>
            <a href='/search' className='text-gray-600 hover:text-gray-800'>
              <FaSearch size={20} />
            </a>
            <a href='/account' className='text-gray-600 hover:text-gray-800'>
              <FaUser size={20} />
            </a>
            <a href='/cart' className='text-gray-600 hover:text-gray-800'>
              <FaShoppingBag size={20} />
            </a>
          </div>
        </div>
      </header> */}

      <HeroSection />

      <NewArrivals />

      <FeaturedCategories />
    </div>
  );
};

export default App;
