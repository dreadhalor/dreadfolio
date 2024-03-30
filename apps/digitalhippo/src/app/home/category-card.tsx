import Image, { type StaticImageData } from 'next/image';

type Props = {
  src: StaticImageData;
  label?: string;
};
export const CategoryCard = ({ src, label = 'Category' }: Props) => {
  return (
    <div className='relative overflow-hidden rounded-lg bg-white shadow'>
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
        <a href='/category1' className='text-blue-500 hover:text-blue-600'>
          Shop Now
        </a>
      </div>
    </div>
  );
};
