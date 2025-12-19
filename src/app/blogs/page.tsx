import { getAllBlogs, BlogPost } from '../lib/blogs';
import BlogCard from './BlogCard';

// This ensures that if you add a new .md file, 
// the page updates every hour without a full rebuild.
export const revalidate = 3600; 

export const metadata = {
  title: 'Blog Posts | Your Site Name',
  description: 'Read our latest insights and articles.',
};

export default async function BlogsPage() {
  const blogs = await getAllBlogs();

  return (
    <main 
      className="min-h-screen w-full"
      style={{ backgroundColor: '#050818' }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        <header className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Blog Posts
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-400">
            Exploring the latest in technology and design.
          </p>
        </header>
        
        {blogs.length === 0 ? (
          <div 
            className="text-center py-16 sm:py-20 rounded-2xl"
            style={{ 
              backgroundColor: '#0F172B',
              border: '1px solid rgba(245, 158, 11, 0.15)'
            }}
          >
            <p className="text-lg sm:text-xl text-slate-400">No blog posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {blogs.map((blog: BlogPost) => (
              <BlogCard key={blog.slug} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}