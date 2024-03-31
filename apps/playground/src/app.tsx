import { FaShoppingBag, FaSearch, FaUser } from 'react-icons/fa';

const App = () => {
  return (
    <div className='bg-primary min-h-screen'>
      {/* Header */}
      <header className='bg-primary shadow'>
        <div className='container mx-auto flex items-center justify-between px-4 py-6'>
          <a href='/' className='text-2xl font-bold text-gray-800'>
            FashionHub
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
      </header>

      {/* Hero Section */}
      <section className='bg-white py-24'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='mb-4 text-4xl font-bold text-gray-800'>
            Discover Your Style
          </h1>
          <p className='mb-8 text-xl text-gray-600'>
            Shop the latest fashion trends and styles at FashionHub.
          </p>
          <a
            href='/shop'
            className='rounded-full bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-700'
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* Featured Categories */}
      <section className='container mx-auto px-4 py-12'>
        <h2 className='mb-8 text-3xl font-bold text-gray-800'>
          Featured Categories
        </h2>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          <div className='overflow-hidden rounded-lg bg-white shadow'>
            <div className='h-64 w-full bg-gray-300'></div>
            <div className='p-4'>
              <h3 className='text-xl font-semibold text-gray-800'>
                Category 1
              </h3>
              <a
                href='/category1'
                className='text-blue-500 hover:text-blue-600'
              >
                Shop Now
              </a>
            </div>
          </div>
          {/* Repeat the above div for other categories */}
        </div>
      </section>

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
                  href='https://facebook.com/fashionhub'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-white'
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href='https://instagram.com/fashionhub'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-white'
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href='https://twitter.com/fashionhub'
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
