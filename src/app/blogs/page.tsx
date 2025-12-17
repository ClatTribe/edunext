import { client } from "../lib/sanity.client";
import { postsQuery } from "../lib/sanity.queries";
import { BlogPost } from "../types/blog";
import { urlFor } from "../lib/sanity.image";
import Link from "next/link";
import Image from "next/image";

export default async function BlogsPage() {
  const posts: BlogPost[] = await client.fetch(postsQuery);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            EduNext Blog
          </h1>
          <p className="text-lg text-gray-600">
            Latest articles and updates from our team
          </p>
          <Link 
            href="/"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No blog posts yet. Create your first post in Sanity Studio!
            </p>
            <a
              href="http://localhost:3333"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Open Sanity Studio
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/blogs/${post.slug.current}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Blog Image */}
                {post.mainImage && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={urlFor(post.mainImage).width(400).height(200).url()}
                      alt={post.mainImage.alt || post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Blog Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    {post.author && (
                      <span className="font-medium">{post.author.name}</span>
                    )}
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}