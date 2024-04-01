import { FaShoppingBag, FaSearch, FaUser } from 'react-icons/fa';
import { HeroCarousel } from './hero-carousel';
import { HeroSection } from './hero-section';
import { FeaturedCategories } from './featured-categories';
import { ProductReel } from '@digitalhippo/components/product-reel';
import { MaxWidthWrapper } from '@digitalhippo/components/max-width-wrapper';
import { NewArrivals } from './new-arrivals';

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

      {/* Footer */}
      <footer className='bg-slate-800 py-8 text-white'>
        <div className='container mx-auto flex flex-col justify-between px-4 md:flex-row'>
          <div className='mb-4 md:mb-0'>
            <h4 className='mb-2 text-lg font-semibold'>About Us</h4>
            <p className='text-gray-400'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <div className='mb-4 md:mb-0'>
            <h4 className='mb-2 text-lg font-semibold'>Customer Service</h4>
            <ul className='text-gray-400'>
              <li>
                <a href='/contact' className='hover:text-white'>
                  Contact Us
                </a>
              </li>
              <li>
                <a href='/faq' className='hover:text-white'>
                  FAQ
                </a>
              </li>
              <li>
                <a href='/shipping' className='hover:text-white'>
                  Shipping &amp; Returns
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className='mb-2 text-lg font-semibold'>Connect with Us</h4>
            <ul className='text-gray-400'>
              <li>
                <a
                  href='https://facebook.com/flowerchild'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-white'
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href='https://instagram.com/flowerchild'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-white'
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href='https://twitter.com/flowerchild'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-white'
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
