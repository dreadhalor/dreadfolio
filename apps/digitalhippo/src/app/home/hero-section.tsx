import { HeroCarousel } from './hero-carousel';

export const HeroSection = () => {
  return (
    <section className='relative flex h-[600px] items-center justify-center'>
      <HeroCarousel className='absolute inset-0 brightness-[80%]' />
      <div className='container pointer-events-none z-10 mx-auto px-4 text-center'>
        <h1 className='mb-4 text-4xl font-bold text-gray-200'>
          Discover Your Style
        </h1>
        <p className='mb-8 text-xl text-gray-100'>
          Shop the latest fashion trends and styles at FlowerChild.
        </p>
        <a
          href='/shop'
          className='rounded-full bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-700'
        >
          Shop Now
        </a>
      </div>
    </section>
  );
};
