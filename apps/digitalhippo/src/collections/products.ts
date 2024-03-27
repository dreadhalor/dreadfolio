import { PRODUCT_CATEGORIES } from '../config';
import { CollectionConfig } from 'payload/types';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        condition: () => false,
      },
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Product Description',
      type: 'textarea',
    },
    {
      name: 'price',
      label: 'Price (in USD)',
      type: 'number',
      min: 0,
      max: 1000,
      required: true,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: PRODUCT_CATEGORIES.map(({ id, label }) => ({
        label,
        value: id,
      })),
      required: true,
    },
    {
      name: 'productFiles',
      label: 'Product Files',
      type: 'relationship',
      relationTo: 'productFiles',
      hasMany: false,
      required: true,
    },
    {
      name: 'approvedForSale',
      label: 'Product Status',
      access: {
        create: ({ req }) => req.user.role === 'admin',
        read: ({ req }) => req.user.role === 'admin',
        update: ({ req }) => req.user.role === 'admin',
      },
      type: 'select',
      options: [
        {
          label: 'Pending Approval',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'priceId',
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'stripeId',
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'images',
      label: 'Product Images',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: {
        singular: 'Image',
        plural: 'Images',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
};
