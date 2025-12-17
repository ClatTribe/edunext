import { client } from "../../lib/sanity.client";
import { postBySlugQuery } from "../../lib/sanity.queries";
import { BlogPost } from "../../types/blog";
import { urlFor } from "../../lib/sanity.image";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>; // ← Changed to Promise
}) {
  // Await params
  const { slug } = await params;
  
  const post: BlogPost = await client.fetch(postBySlugQuery, {
    slug, // Now using awaited slug
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <Link 
            href="/blogs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            ← Back to Blogs
          </Link>
        </div>

        {post.mainImage && (
          <div className="relative w-full h-96">
            <Image
              src={urlFor(post.mainImage).width(1200).height(600).url()}
              alt={post.mainImage.alt || post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-gray-600 mb-6">
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.image && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={urlFor(post.author.image).width(40).height(40).url()}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="font-medium">{post.author.name}</span>
              </div>
            )}
            <span>•</span>
            <time className="text-sm">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>

          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-8 italic border-l-4 border-blue-600 pl-4">
              {post.excerpt}
            </p>
          )}

          <div className="prose prose-lg max-w-none">
            <PortableText value={post.body} />
          </div>
        </div>
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  const posts: BlogPost[] = await client.fetch(
    `*[_type == "post"]{ slug }`
  );

  return posts.map((post) => ({
    slug: post.slug.current,
  }));
}