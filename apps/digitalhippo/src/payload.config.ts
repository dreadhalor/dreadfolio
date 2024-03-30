import { buildConfig } from 'payload/config';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';
import { Users } from './collections/users';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import dotenv from 'dotenv';
import { Products } from './collections/products';
import { Media } from './collections/media';
import { ProductFiles } from './collections/product-files';
import { Orders } from './collections/orders';
import { Categories } from './collections/categories';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  collections: [Users, Products, Media, ProductFiles, Orders, Categories],
  routes: {
    admin: '/sell',
  },
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Digital Hippo',
      favicon: '/favicon.ico',
      ogImage: '/thumbnail.jpg',
    },
    bundler: webpackBundler(),
  },
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URL || '',
  }),
  rateLimit: {
    max: 2000,
  },
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
});
