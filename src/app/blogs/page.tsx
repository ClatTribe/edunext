import { client } from '../sanity/lib/client';
import Link from 'next/link';

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
}

async function getPosts(): Promise<Post[]> {
  const posts = await client.fetch(
    `*[_type == "post"] | order(publishedAt desc, _createdAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt
    }`
  );
  return posts;
}

export default async function BlogIndexPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-5xl font-extrabold mb-8 text-blue-900">Latest Blog Posts</h1>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No blog posts yet.</p>
            <Link 
              href="/studio" 
              className="text-blue-600 hover:underline"
            >
              Create your first post in Sanity Studio →
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="p-4 border rounded shadow-sm hover:shadow-md transition">
              <Link href={`/blogs/${post.slug.current}`} className="block">
                <h2 className="text-xl font-semibold text-blue-600 hover:underline mb-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 text-sm">{post.excerpt}</p>
                )}
                {post.publishedAt && (
                  <p className="text-gray-400 text-xs mt-2">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
}