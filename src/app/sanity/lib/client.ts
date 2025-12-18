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
  useCdn: process.env.NODE_ENV === 'production', 
  // Add the token for previewing drafts/private content
  token: process.env.SANITY_API_READ_TOKEN, 
});

// Add helper for live queries if you plan to use them with 'use client' components
export const liveClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Live queries never use the CDN
  token: process.env.SANITY_API_READ_TOKEN, // Requires token
  perspective: 'previewDrafts',
});
