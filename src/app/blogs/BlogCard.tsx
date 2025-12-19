import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '../lib/blogs';

interface BlogCardProps {
  blog: BlogPost;
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="block">
      <div className="border rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {blog.coverImage && (
          <div className="relative h-48 w-full">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 hover:text-blue-600 transition-colors">
            {blog.title}
          </h2>
          
          <p className="text-gray-500 text-sm mb-3">
            {new Date(blog.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          
          {blog.excerpt && (
            <p className="text-gray-700 mb-4 line-clamp-3">{blog.excerpt}</p>
          )}
          
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}