import { getBlogBySlug, getAllBlogSlugs } from '../../lib/blogs';
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
  const { slug } = await params; // Destructure here for cleaner code
  try {
    const blog = await getBlogBySlug(slug);
    return {
      title: `${blog.title} | Blog`,
      description: blog.excerpt || `Read ${blog.title}`,
    };
  } catch {
    return { title: 'Blog Post Not Found' };
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  let blog;
  
  try {
    blog = await getBlogBySlug(slug);
  } catch (error) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="mb-12">
        {/* Using font-montserrat utility if needed, though global.css handles it */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900 leading-tight">
          {blog.title}
        </h1>
        
        <div className="flex items-center gap-4 text-slate-500 mb-6">
          <time className="font-medium">
            {new Date(blog.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {blog.author && (
            <>
              <span className="text-slate-300">•</span>
              <span className="font-medium">{blog.author}</span>
            </>
          )}
        </div>
        
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {blog.coverImage && (
        <div className="relative aspect-video w-full mb-12 rounded-2xl overflow-hidden shadow-xl">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            priority // Better for LCP (Largest Contentful Paint)
            className="object-cover"
          />
        </div>
      )}

      {/* 
          CLEANED UP CLASSES:
          Since we moved table borders and fonts to globals.css,
          we only need the base prose classes here.
      */}
      <div
        className="prose prose-lg prose-slate max-w-none 
          prose-headings:scroll-mt-20 
          prose-img:rounded-xl 
          prose-pre:bg-slate-900"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </article>
  );
}
