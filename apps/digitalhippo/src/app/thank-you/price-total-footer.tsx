import { TRANSACTION_FEE } from '@flowerchild/config';
import { formatPrice } from '@flowerchild/lib/utils';
import { Order, OrderItem, Product } from '@flowerchild/payload-types';

type Props = {
  order: Order;
};

export const PriceTotalFooter = ({ order }: Props) => {
  const items = order.items as OrderItem[];

  const orderSubTotal = items.reduce(
    (acc, { product, quantity }) => acc + (product as Product).price * quantity,
    0,
  );

  return (
    <div className='text-muted-foreground space-y-6 border-t border-gray-200 pt-6 text-sm font-medium'>
      <div className='flex justify-between'>
        <p>Subtotal</p>
        <p>{formatPrice(orderSubTotal)}</p>
      </div>
      <div className='flex justify-between'>
        <p>Transaction Fee</p>
        <p>{formatPrice(TRANSACTION_FEE)}</p>
      </div>
      <div className='flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900'>
        <p className='text-base'>Total</p>
        <p className='text-base'>
          {formatPrice(orderSubTotal + TRANSACTION_FEE)}
        </p>
      </div>
    </div>
  );
};
