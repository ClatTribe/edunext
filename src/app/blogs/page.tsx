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
    // Added 'max-w-7xl' for better layout on ultra-wide screens
    <main className="container mx-auto px-4 py-12 max-w-7xl">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          Blog Posts
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Exploring the latest in technology and design.
        </p>
      </header>
      
      {blogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No blog posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog: BlogPost) => (
            <BlogCard key={blog.slug} blog={blog} />
          ))}
        </div>
      )}
    </main>
  );
}
