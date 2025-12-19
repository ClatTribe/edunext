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
  const { slug } = await params;
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
    <div 
      className="min-h-screen w-full"
      style={{ backgroundColor: '#050818' }}
    >
      <article className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        
        {/* Cover Image - Updated for No Cropping */}
        {blog.coverImage && (
          <div 
            className="relative w-full mb-6 sm:mb-8 rounded-xl overflow-hidden shadow-2xl"
            style={{ 
              border: '1px solid rgba(245, 158, 11, 0.15)',
              aspectRatio: '16/9'
            }}
          >
            <Image
              src={blog.coverImage}
              alt={blog.title}
              width={2400}
              height={1350}
              priority
              className="object-contain w-full h-full"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 896px, 896px"
              quality={90}
            />
          </div>
        )}

        {/* Header Section */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 text-slate-400 mb-3 sm:mb-4 text-sm md:text-base flex-wrap">
            <time className="font-medium">
              {new Date(blog.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </time>
            {blog.author && (
              <>
                <span className="text-slate-600">•</span>
                <span className="font-medium">{blog.author}</span>
              </>
            )}
          </div>
          
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content Area */}
        <div
          className="blog-content prose prose-base sm:prose-lg prose-invert max-w-none 
            prose-headings:text-white prose-headings:scroll-mt-20
            prose-p:text-slate-300
            prose-a:text-[#F59E0B] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-code:text-[#F59E0B] prose-code:bg-[#0F172B] prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-[#0F172B] prose-pre:border prose-pre:border-[rgba(245,158,11,0.15)]
            prose-img:rounded-xl prose-img:border prose-img:border-[rgba(245,158,11,0.15)]
            prose-blockquote:border-l-[#F59E0B] prose-blockquote:text-slate-300
            prose-hr:border-[rgba(245,158,11,0.15)]
            prose-ul:text-slate-300 prose-ol:text-slate-300
            prose-li:text-slate-300
            prose-table:border-collapse
            prose-td:border prose-td:border-[rgba(245,158,11,0.15)] prose-td:px-4 prose-td:py-2 prose-td:text-slate-300
            prose-th:border prose-th:border-[rgba(245,158,11,0.15)] prose-th:px-4 prose-th:py-2 prose-th:bg-[#0F172B] prose-th:text-white
            [&_table]:block [&_table]:overflow-x-auto [&_table]:w-full
            [&_table_thead]:table [&_table_thead]:w-full
            [&_table_tbody]:table [&_table_tbody]:w-full"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </div>
  );
}