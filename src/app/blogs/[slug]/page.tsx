import { getBlogBySlug, getAllBlogSlugs } from '../../lib/blogs';
// import { getBlogBySlug } from '@/app/lib/blogs';
import { notFound } from 'next/navigation';
import Image from 'next/image';

interface BlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map(({ slug }) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: BlogPageProps) {
  const resolvedParams = await params;
  try {
    const blog = await getBlogBySlug(resolvedParams.slug);
    
    return {
      title: blog.title,
      description: blog.excerpt || `Read ${blog.title}`,
    };
  } catch (error) {
    return {
      title: 'Blog Post Not Found',
    };
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const resolvedParams = await params;
  let blog;
  
  try {
    blog = await getBlogBySlug(resolvedParams.slug);
  } catch (error) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-5xl font-bold mb-4">{blog.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
          <time dateTime={blog.date}>
            {new Date(blog.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {blog.author && <span>By {blog.author}</span>}
        </div>
        
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {blog.coverImage && (
        <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div
        className="prose prose-lg prose-slate max-w-none
          prose-table:w-full prose-table:border-collapse
          prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left
          prose-td:border prose-td:border-gray-300 prose-td:p-3
          prose-tr:even:bg-gray-50"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </article>
  );
}