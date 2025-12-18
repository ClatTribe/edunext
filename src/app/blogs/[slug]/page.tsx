// src/app/blogs/[slug]/page.tsx
'use client'; // This is a client component

import { useEffect, useState } from 'react';
import { PortableText } from '@portabletext/react';
import { notFound, useParams } from 'next/navigation';

// Define the TypeScript interface for your Post structure
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  content: any[]; 
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
// Set a current API version (Today's date: 2025-12-18)
const apiVersion = '2025-12-18'; 


const components = {
  types: {
    table: ({ value }: { value: any }) => (
      <table className="table-auto w-full border mt-4">
        <tbody>
          {value.rows.map((row: any, i: number) => (
            <tr key={i} className="border-b">
              {row.cells.map((cell: any, j: number) => (
                <td key={j} className="p-2 border-r">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ),
    // Ensure you also add handling for images if you use them in your blog content
  },
};

export default function PostPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const slug = params.slug;
      if (!slug) return;

      try {
        const query = encodeURIComponent(`*[_type == "post" && slug.current == "${slug}"]`);
        
        // CRITICAL FIX: Use the correct API CDN hostname and version
        const url = `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?query=${query}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Check if data or result is missing/empty
        if (!data || !data.result || data.result.length === 0) {
          notFound(); 
          return;
        }
        
        // Ensure we handle the response correctly (it's an array)
        setPost(data.result[0] as Post); 
        
      } catch (error) {
        console.error("Error fetching post:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  if (loading) {
    return <div className="p-4">Loading blog post...</div>;
  }

  // Content will now render correctly once data is fetched
  return (
    <article className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold mb-4">{post?.title}</h1>
      
      {/* Make sure you have configured the Tailwind Typography Plugin in tailwind.config.ts */}
      <div className="prose lg:prose-xl mx-auto"> 
        <PortableText value={post?.content} components={components} />
      </div>
    </article>
  );
}
