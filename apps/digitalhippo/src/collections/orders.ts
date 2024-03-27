import { Access, CollectionConfig } from 'payload/types';

const yourOwnOrAdmin: Access = async ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;

  return {
    user: {
      equals: user.id,
    },
  };
};

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'Your Orders',
    description: 'A summary of all your orders on DigitalHippo.',
  },
  access: {
    create: ({ req }) => req.user.role === 'admin',
    read: yourOwnOrAdmin,
    update: ({ req }) => req.user.role === 'admin',
    delete: ({ req }) => req.user.role === 'admin',
  },
  fields: [
    {
      name: '_isPaid',
      type: 'checkbox',
      access: {
        read: ({ req }) => req.user.role === 'admin',
        create: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      hasMany: true,
      admin: {
        hidden: true,
      },
    },
  ],
};
