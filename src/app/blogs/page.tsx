import { getAllBlogs, BlogPost  } from '../lib/blogs';
import BlogCard from './BlogCard';

export const metadata = {
  title: 'Blog Posts',
  description: 'Read our latest blog posts',
};

export default async function BlogsPage() {
  const blogs = await getAllBlogs();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
      
      {blogs.length === 0 ? (
        <p className="text-gray-600">No blog posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog: BlogPost) => (
            <BlogCard key={blog.slug} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}