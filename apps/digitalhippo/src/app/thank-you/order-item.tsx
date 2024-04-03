import { formatPrice } from '@flowerchild/lib/utils';
import {
  Category,
  Media,
  OrderItem as OrderItemType,
  Product,
} from '@flowerchild/payload-types';
import Image from 'next/image';

type Props = {
  orderItem: OrderItemType;
};

export const OrderItem = ({ orderItem }: Props) => {
  const product = orderItem.product as Product;
  const quantity = orderItem.quantity;
  const label = (product.category as Category)?.label || 'N/A';
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
          <p className='my-1'>Quantity: {quantity}</p>
        </div>
      </div>
      <div className='flex flex-col items-end'>
        <p className='font-medium text-gray-900'>
          {formatPrice(product.price)}
        </p>
        <p className='text-sm text-gray-500'>
          Subtotal: {formatPrice(product.price * quantity)}
        </p>
      </div>
    </li>
  );
};
