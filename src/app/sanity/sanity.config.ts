import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { table } from '@sanity/table'; // Import the table plugin
import post from './schemas/post'; // Import your schema

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET as string;

export default defineConfig({
  basePath: '/studio', // Studio will live at /studio route in Next.js
  projectId,
  dataset,
  name: 'edunext-studio',
  title: 'EDUNEXT Dashboard',
  plugins: [
    structureTool(), 
    visionTool(), 
    table() // <-- Enable the table tool visually
  ],
  schema: {
    types: [post], // Add your post schema here
  },
});