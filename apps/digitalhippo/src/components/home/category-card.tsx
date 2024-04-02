import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';

type Props = {
  src: StaticImageData;
  label: string;
  value: string;
};
export const CategoryCard = ({ src, label, value }: Props) => {
  return (
    <Link
      href={`/products?category=${value}`}
      className='relative overflow-hidden rounded-lg bg-white shadow'
    >
      <div className='relative h-64 w-full'>
        <Image
          src={src}
          alt='Category image'
          fill
          className='relative h-full w-full object-cover object-center'
        />
      </div>

      <div className='relative bg-white p-4'>
        <h3 className='text-xl font-semibold text-gray-800'>{label}</h3>
        <span className='text-blue-500 hover:text-blue-600'>Shop Now</span>
      </div>
    </Link>
  );
};
