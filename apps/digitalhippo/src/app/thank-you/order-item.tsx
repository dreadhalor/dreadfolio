import { PRODUCT_CATEGORIES } from '@digitalhippo/config';
import { formatPrice } from '@digitalhippo/lib/utils';
import {
  Media,
  Order,
  Product,
  ProductFile,
} from '@digitalhippo/payload-types';
import Image from 'next/image';

type Props = {
  product: Product;
  order: Order;
};
export const OrderItem = ({ order, product }: Props) => {
  const label =
    PRODUCT_CATEGORIES.find((category) => category.id === product.category)
      ?.label || '';

  const downloadUrl = (product.productFiles as ProductFile).url as string;

  const image = product.images[0].image as Media;

  return (
    <li key={product.id} className='flex space-x-6 py-6'>
      <div className='relative h-24 w-24'>
        <Image
          src={image.url || ''}
          fill
          alt={`${product.name} image`}
          className='flex-none rounded-md bg-gray-100 object-cover object-center'
        />
      </div>

      <div className='flex flex-auto flex-col justify-between'>
        <div className='space-y-1'>
          <h3 className='text-gray-900'>{product.name}</h3>
          <p className='my-1'>Category: {label}</p>
        </div>

        {order._isPaid && (
          <a
            href={downloadUrl}
            download={product.name}
            className='w-fit text-blue-600 underline-offset-2 hover:underline'
          >
            Download Assets
          </a>
        )}
      </div>

      <p className='flex-none font-medium text-gray-900'>
        {formatPrice(product.price)}
      </p>
    </li>
  );
};
