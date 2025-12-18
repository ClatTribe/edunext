// lib/client.ts - Updated
import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-18'; 

if (!projectId || !dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or DATASET');
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // ← CHANGE THIS LINE - Now always false
  token: process.env.SANITY_API_READ_TOKEN, 
});

export const liveClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'previewDrafts',
});