export const revalidate = 0;
import { client } from '../sanity/lib/client';
import Link from 'next/link';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import BlogCard from './BlogCard';

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

  const accentColor = '#F59E0B';
  const primaryBg = '#050818';
  const secondaryBg = '#0F172B';
  const borderColor = 'rgba(245, 158, 11, 0.15)';

  return (
    <div 
      className="min-h-screen w-full"
      style={{ backgroundColor: primaryBg }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
            >
              <BookOpen className="text-white" size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Latest Blog Posts
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-15">
            Explore insights, tips, and updates from our team
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.length === 0 ? (
            <div 
              className="col-span-full rounded-2xl shadow-xl p-12 backdrop-blur-xl text-center"
              style={{ 
                backgroundColor: secondaryBg,
                border: `1px solid ${borderColor}`
              }}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
              >
                <Sparkles style={{ color: accentColor }} size={32} />
              </div>
              <p className="text-slate-400 text-lg mb-6">No blog posts yet.</p>
              <Link 
                href="/studio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl"
                style={{ background: accentColor }}
              >
                Create your first post in Sanity Studio
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            posts.map((post) => (
              <BlogCard 
                key={post._id}
                post={post}
                accentColor={accentColor}
                secondaryBg={secondaryBg}
                borderColor={borderColor}
              />
            ))
          )}
        </div>  
      </div>
    </div>
  );
}