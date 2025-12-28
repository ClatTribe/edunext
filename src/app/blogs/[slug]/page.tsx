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
        
        {/* Cover Image */}
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {blog.title}
          </h1>
          
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

        {/* Content Area with Enhanced Styling */}
        <div
          className="prose prose-lg prose-invert max-w-none
            prose-headings:font-montserrat prose-headings:font-bold prose-headings:text-white prose-headings:mt-8 prose-headings:mb-4
            prose-h1:text-3xl prose-h1:md:text-4xl
            prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:border-b prose-h2:border-slate-700 prose-h2:pb-2
            prose-h3:text-xl prose-h3:md:text-2xl
            prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-[#F59E0B] prose-a:no-underline prose-a:font-medium hover:prose-a:underline hover:prose-a:text-[#D97706]
            prose-strong:text-white prose-strong:font-semibold
            prose-em:text-slate-200
            prose-code:text-[#F59E0B] prose-code:bg-[#0F172B] prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-[#0F172B] prose-pre:border prose-pre:border-[rgba(245,158,11,0.15)] prose-pre:rounded-lg prose-pre:p-4
            prose-img:rounded-xl prose-img:border prose-img:border-[rgba(245,158,11,0.15)] prose-img:shadow-lg
            prose-blockquote:border-l-4 prose-blockquote:border-[#F59E0B] prose-blockquote:bg-[#0F172B] prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r prose-blockquote:text-slate-300 prose-blockquote:italic
            prose-hr:border-[rgba(245,158,11,0.15)] prose-hr:my-8
            prose-ul:text-slate-300 prose-ul:my-4 prose-ul:space-y-2
            prose-ol:text-slate-300 prose-ol:my-4 prose-ol:space-y-2
            prose-li:text-slate-300 prose-li:leading-relaxed
            prose-li::marker:text-[#F59E0B]
            prose-table:w-full prose-table:border-collapse prose-table:my-6
            prose-thead:border-b-2 prose-thead:border-[#F59E0B]
            prose-th:border prose-th:border-[rgba(245,158,11,0.15)] prose-th:px-4 prose-th:py-3 prose-th:bg-[#0F172B] prose-th:text-white prose-th:font-semibold prose-th:text-left
            prose-td:border prose-td:border-[rgba(245,158,11,0.15)] prose-td:px-4 prose-td:py-3 prose-td:text-slate-300
            prose-tr:border-b prose-tr:border-[rgba(245,158,11,0.1)]
            [&_table]:overflow-x-auto [&_table]:block
            [&_tbody_tr:hover]:bg-[rgba(245,158,11,0.05)]"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </div>
  );
}