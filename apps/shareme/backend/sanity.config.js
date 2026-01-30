import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import schemas from './schemas/schema';

export default defineConfig({
  title: 'ShareMe',
  projectId: 'hj6wguta',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: schemas,
  },
});
