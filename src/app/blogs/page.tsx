// src/app/blogs/page.tsx

import { client } from '.././sanity/lib/client'; // Uses your existing Sanity config
import Link from 'next/link';

async function getPosts() {
  const posts = await client.fetch('*[_type == "post"] | order(_createdAt desc)');
  return posts;
}

export default async function BlogIndexPage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Latest Blog Posts</h1>
      <div className="space-y-4">
        {posts.map((post: any) => (
          <div key={post._id} className="p-4 border rounded shadow-sm">
            {/* Change this href link from /blog to /blogs */}
            <Link href={`/blogs/${post.slug.current}`} className="text-xl font-semibold text-blue-600 hover:underline">
              {post.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
