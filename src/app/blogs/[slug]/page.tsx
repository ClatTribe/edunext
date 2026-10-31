import { getBlogBySlug, getAllBlogSlugs, getAllBlogs } from '../../lib/blogs';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Metadata } from 'next';
import BlogSidebar from '../BlogSidebar';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import CollegeEnquiryForm from "../../../../components/microsite/CollegeEnquiryForm";
import Link from 'next/link';
import { isMbaBlog, linkBSchools, MBA_BLOGS, MBA_HUBS } from '../../../../lib/mbaLinks';

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

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const blog = await getBlogBySlug(slug);

    return {
      title: blog.title,
      description: blog.excerpt || `Read ${blog.title} — Complete guide on EduNext.`,
      alternates: {
        canonical: `https://www.getedunext.com/blogs/${slug}`,
      },
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        url: `https://www.getedunext.com/blogs/${slug}`,
        siteName: 'EduNext',
        type: 'article',
        publishedTime: blog.date,
        modifiedTime: blog.lastModified ?? blog.date,
        images: [
          {
            url: blog.coverImage ?? "/default-og.jpg",
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.excerpt,
        images: [blog.coverImage ?? "/default-og.jpg"],
      },
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
  } catch {
    notFound();
  }

  const allBlogs = await getAllBlogs();

  // The page already renders blog.title as the H1; drop a leading markdown H1 so there is only one.
  let contentHtml = blog.content.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');

  // MBA cluster: link B-school mentions to their microsites and add related MBA links.
  const mba = isMbaBlog(slug, blog.tags);
  let schoolsInPost: { name: string; slug: string }[] = [];
  if (mba) {
    const linked = linkBSchools(contentHtml);
    contentHtml = linked.html;
    schoolsInPost = linked.found;
  }

  const pageUrl = `https://www.getedunext.com/blogs/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${pageUrl}#article`,
        headline: blog.title,
        description: blog.excerpt,
        image: blog.coverImage ? [blog.coverImage] : undefined,
        datePublished: blog.date,
        dateModified: blog.lastModified ?? blog.date,
        author: { '@type': blog.author && blog.author !== 'EduNext' ? 'Person' : 'Organization', name: blog.author || 'EduNext' },
        publisher: { '@type': 'Organization', name: 'EduNext', url: 'https://www.getedunext.com' },
        mainEntityOfPage: pageUrl,
        keywords: blog.tags?.join(', ') || undefined,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.getedunext.com' },
          { '@type': 'ListItem', position: 2, name: 'Blogs', item: 'https://www.getedunext.com/blogs' },
          { '@type': 'ListItem', position: 3, name: blog.title, item: pageUrl },
        ],
      },
    ],
  };

  const latestBlogs = allBlogs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((b) => b.slug !== slug);

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div
        className="min-h-screen w-full pt-12"
        style={{ backgroundColor: '#050818' }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">

          {/* COVER IMAGE */}
          {blog.coverImage && (
            <div className="flex justify-center mb-8 sm:mb-12">
              <div
                className="relative w-full rounded-xl overflow-hidden shadow-2xl max-w-4xl"
                style={{
                  border: '1px solid rgba(245, 158, 11, 0.15)',
                  aspectRatio: '16/9',
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
            </div>
          )}

          {/* MAIN CONTENT */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-6xl mx-auto">

            {/* ARTICLE */}
            <article className="flex-1 min-w-0">

              <header className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                  {blog.title}
                </h1>

                <div className="flex items-center gap-3 sm:gap-4 text-slate-400 mb-4 text-sm md:text-base flex-wrap">

                  <time className="font-medium">
                    Published: {new Date(blog.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>

                  {blog.lastModified && (
                    <>
                      <span className="text-slate-600">•</span>

                      <span className="text-[#F59E0B] font-semibold italic">
                        Updated: {new Date(blog.lastModified).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </>
                  )}

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

              {/* College Enquiry Form - Mobile Only */}
              <div className="block lg:hidden mb-8">
                <CollegeEnquiryForm
                  pageSource={`/blogs/${slug}`}
                  title={<span className="text-amber-400 text-xl font-bold">Blog</span>}
                />
              </div>

              {/* AUDIO PLAYER */}
              {blog.audioUrl && (
                <div className="mb-8 p-4 rounded-lg border border-[rgba(245,158,11,0.15)] bg-[#0F172B]">

                  <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                    🎧 Listen to this article
                  </h2>

                  <audio controls className="w-full">
                    <source src={blog.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>

                </div>
              )}

              {/* BLOG CONTENT */}
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
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />

              {mba && schoolsInPost.length > 0 && (
                <nav aria-label="B-schools in this article" className="mt-10 p-6 rounded-xl border border-[rgba(245,158,11,0.15)] bg-[#0F172B]">
                  <h2 className="text-xl font-bold text-white mb-4">B-schools in this article: cutoff, fees and placements</h2>
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {schoolsInPost.map((c) => (
                      <li key={c.slug} className="text-slate-400">
                        <Link href={`/college/${c.slug}`} className="text-[#F59E0B] font-medium hover:underline">{c.name}</Link>
                        {' · '}
                        <Link href={`/college/${c.slug}/cutoff`} className="hover:text-[#F59E0B]">cutoff</Link>
                        {' · '}
                        <Link href={`/college/${c.slug}/placement`} className="hover:text-[#F59E0B]">placements</Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {mba && (
                <nav aria-label="More MBA guides" className="mt-6 p-6 rounded-xl border border-[rgba(245,158,11,0.15)] bg-[#0F172B]">
                  <h2 className="text-xl font-bold text-white mb-4">More CAT 2026 and MBA 2027 guides</h2>
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {[...MBA_HUBS, ...MBA_BLOGS.filter((b) => b.href !== `/blogs/${slug}`)].slice(0, 12).map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="text-[#F59E0B] hover:underline">{l.label}</Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

            </article>

            {/* SIDEBAR */}
            <aside className="lg:w-80 xl:w-96 flex-shrink-0">
              <div className="lg:sticky lg:top-8">

                <BlogSidebar
                  latestBlogs={latestBlogs}
                  currentSlug={slug}
                  currentTitle={blog.title}
                />

              </div>
            </aside>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}