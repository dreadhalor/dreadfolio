import { CollectionConfig } from 'payload/types';

export const OrderItems: CollectionConfig = {
  slug: 'order-items',
  admin: {
    useAsTitle: 'Order Items',
    description: 'Individual items within an order.',
  },
  access: {
    create: ({ req }) => req.user.role === 'admin',
    read: ({ req }) => req.user.role === 'admin',
    update: ({ req }) => req.user.role === 'admin',
    delete: ({ req }) => req.user.role === 'admin',
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      hasMany: false,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      hasMany: false,
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: {
        step: 1,
      },
    },
  ],
};
