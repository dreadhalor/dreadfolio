import { CollectionConfig } from 'payload/types';

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'label',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    { name: 'value', type: 'text', required: true },
    { name: 'label', type: 'text', required: true },
  ],
};
