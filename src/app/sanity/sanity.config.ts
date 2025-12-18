import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { table } from '@sanity/table';
import post from './schemas/post';
import enhancedTable from './schemas/enhancedTable';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  name: 'edunext-studio',
  title: 'EduNext Blog Dashboard',
  plugins: [
    structureTool(),
    visionTool(),
    table()
  ],
  schema: {
    types: [post, enhancedTable],
  },
});