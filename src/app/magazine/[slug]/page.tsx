/**
 * EduNext Magazine — article detail page.
 *
 * Deploy to: src/app/magazine/[slug]/page.tsx
 *
 * Layout:
 *  - Full-bleed hero image with title + subtitle overlay (like EduAbroad)
 *  - 2-column on desktop: 8-col main body + 4-col sticky sidebar (lead form + TOC)
 *  - 1-column on mobile, lead form appears after FAQs
 *  - In-article styling: H2/H3 hierarchy, lists, tables, blockquotes
 *  - FAQs rendered as <details> for SEO + UX
 *  - Author block + share buttons + related articles strip
 */

export const dynamic = 'force-dynamic';
export const revalidate = 600;

import {
  getMagazineBySlug,
  getRelatedMagazine,
  CATEGORY_COLORS,
  CATEGORY_EMOJIS,
  CATEGORY_LABELS,
  timeAgo,
} from '../../lib/magazine';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import MagazineLeadForm from '../../../../components/MagazineLeadForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const article = await getMagazineBySlug(resolvedParams.slug);
  if (!article) return { title: 'Not Found | EduNext Magazine' };

  return {
    title: article.meta_title || `${article.title} | EduNext Magazine`,
    description: article.meta_description || article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      url: `https://www.getedunext.com/magazine/${article.slug}`,
      images: article.hero_image ? [{ url: article.hero_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: article.hero_image ? [article.hero_image] : [],
    },
    alternates: {
      canonical: `https://www.getedunext.com/magazine/${article.slug}`,
    },
  };
}

export default async function MagazineArticlePage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const article = await getMagazineBySlug(resolvedParams.slug);
  if (!article) notFound();

  const related = await getRelatedMagazine(article.category, article.slug, 3);
  const color = CATEGORY_COLORS[article.category];
  const emoji = CATEGORY_EMOJIS[article.category];

  // JSON-LD structured data for SEO
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    image: article.hero_image ? [article.hero_image] : undefined,
    datePublished: article.published_at,
    author: { '@type': 'Organization', name: article.author_name },
    publisher: {
      '@type': 'Organization',
      name: 'EduNext',
      logo: { '@type': 'ImageObject', url: 'https://www.getedunext.com/logo.png' },
    },
    mainEntityOfPage: `https://www.getedunext.com/magazine/${article.slug}`,
  };

  const faqSchema =
    article.faqs && article.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null;

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <main className="min-h-screen w-full pt-16" style={{ backgroundColor: '#050818' }}>
        {/* Hero */}
        <header
          className="relative w-full"
          style={{
            minHeight: '60vh',
            backgroundImage: article.hero_image
              ? `linear-gradient(180deg, rgba(5,8,24,0.3) 0%, rgba(5,8,24,0.95) 100%), url(${article.hero_image})`
              : `linear-gradient(135deg, ${color}30 0%, ${color}10 70%, #050818 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="container mx-auto flex h-full max-w-4xl flex-col justify-end px-4 pt-24 pb-12 sm:px-6 sm:pt-32 sm:pb-16">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <Link href="/magazine" className="hover:text-white">Magazine</Link>
              <span>/</span>
              <Link
                href={`/magazine?category=${encodeURIComponent(article.category)}`}
                className="hover:text-white"
              >
                {CATEGORY_LABELS[article.category]}
              </Link>
            </nav>

            {/* Category + read time */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color }}
              >
                {emoji} {CATEGORY_LABELS[article.category]}
              </span>
              {article.read_time && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur">
                  ⏱ {article.read_time} min read
                </span>
              )}
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur">
                {timeAgo(article.published_at)}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-5xl">
              {article.title}
            </h1>

            {/* Subtitle */}
            {article.magazine_subtitle && (
              <p className="max-w-2xl text-base text-slate-300 sm:text-xl">
                {article.magazine_subtitle}
              </p>
            )}
          </div>
        </header>

        {/* Body */}
        <section className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Main column */}
            <article className="lg:col-span-8">
              {/* Author + share */}
              <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {article.author_name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {article.author_name}
                    </div>
                    <div className="text-xs text-slate-500">EduNext Magazine</div>
                  </div>
                </div>
                <ShareButtons title={article.title} slug={article.slug} />
              </div>

              {/* TOC on mobile (collapsed) */}
              {article.toc && article.toc.length > 0 && (
                <details className="mb-8 rounded-xl border border-white/10 bg-white/5 p-4 lg:hidden">
                  <summary className="cursor-pointer text-sm font-semibold text-white">
                    On this page
                  </summary>
                  <ul className="mt-3 space-y-2 text-sm">
                    {article.toc.map((item) => (
                      <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                        <a
                          href={`#${item.id}`}
                          className="text-slate-300 hover:text-white"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {/* TL;DR / summary callout */}
              <div
                className="mb-8 rounded-2xl border-l-4 p-5"
                style={{ borderColor: color, backgroundColor: `${color}10` }}
              >
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                  TL;DR
                </div>
                <p className="text-base leading-relaxed text-slate-200">{article.summary}</p>
              </div>

              {/* Body */}
              <div
                className={`
                  text-slate-300 leading-relaxed
                  [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:tracking-tight [&>h2]:scroll-mt-24
                  [&>h2:first-child]:mt-0
                  [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-white [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:scroll-mt-24
                  [&>p]:mb-5 [&>p]:leading-7 [&>p]:text-base
                  [&>ul]:my-5 [&>ul]:pl-6 [&>ul]:list-disc [&>ul]:space-y-2
                  [&>ol]:my-5 [&>ol]:pl-6 [&>ol]:list-decimal [&>ol]:space-y-2
                  [&_li]:text-slate-300 [&_li]:leading-7
                  [&_strong]:text-white [&_strong]:font-semibold
                  [&_em]:text-slate-400 [&_em]:italic
                  [&_a]:text-rose-400 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-rose-300
                  [&>blockquote]:border-l-4 [&>blockquote]:border-rose-400 [&>blockquote]:pl-5 [&>blockquote]:italic [&>blockquote]:text-slate-400 [&>blockquote]:my-6
                  [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:rounded-lg [&_table]:overflow-hidden
                  [&_th]:bg-white/5 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:text-white [&_th]:border [&_th]:border-white/10
                  [&_td]:px-4 [&_td]:py-3 [&_td]:text-sm [&_td]:text-slate-300 [&_td]:border [&_td]:border-white/10
                `}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* FAQ section */}
              {article.faqs && article.faqs.length > 0 && (
                <section className="mt-12 border-t border-white/10 pt-10">
                  <h2 className="mb-6 text-2xl font-bold text-white">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3">
                    {article.faqs.map((faq, i) => (
                      <details
                        key={i}
                        className="group rounded-xl border border-white/10 bg-white/5 p-5"
                      >
                        <summary className="cursor-pointer text-base font-semibold text-white">
                          {faq.question}
                        </summary>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-2 border-t border-white/10 pt-8">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Mobile lead form (visible only below lg) */}
              <div className="mt-10 lg:hidden">
                <MagazineLeadForm
                  sourceSlug={article.slug}
                  sourceCategory={article.category}
                />
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              {/* Desktop sticky lead form */}
              <div className="hidden lg:block">
                <MagazineLeadForm
                  sourceSlug={article.slug}
                  sourceCategory={article.category}
                />
              </div>

              {/* TOC (desktop) */}
              {article.toc && article.toc.length > 0 && (
                <nav className="mt-6 hidden rounded-2xl border border-white/10 bg-white/5 p-5 lg:block">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    On this page
                  </div>
                  <ul className="space-y-2 text-sm">
                    {article.toc.map((item) => (
                      <li key={item.id} className={item.level === 3 ? 'pl-3' : ''}>
                        <a
                          href={`#${item.id}`}
                          className="block text-slate-300 hover:text-white"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </aside>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-white/5 py-12">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6">
              <h2 className="mb-6 text-xl font-bold text-white">
                More in {CATEGORY_LABELS[article.category]}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/magazine/${r.slug}`}
                    className="group rounded-2xl border border-white/5 bg-slate-900/50 p-5 transition-all hover:border-white/15 hover:bg-slate-900"
                  >
                    <span
                      className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[r.category]}20`,
                        color: CATEGORY_COLORS[r.category],
                      }}
                    >
                      {CATEGORY_EMOJIS[r.category]} {CATEGORY_LABELS[r.category]}
                    </span>
                    <h3 className="mb-2 text-base font-semibold leading-snug text-white group-hover:text-rose-300">
                      {r.title}
                    </h3>
                    <p className="text-xs text-slate-500">{timeAgo(r.published_at)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

// =====================================================================
// Share buttons
// =====================================================================
function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = `https://www.getedunext.com/magazine/${slug}`;
  const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(title + ' — ' + url)}`;
  return (
    <div className="flex items-center gap-1.5">
      <ShareIcon href={tw} label="X">𝕏</ShareIcon>
      <ShareIcon href={li} label="LinkedIn">in</ShareIcon>
      <ShareIcon href={wa} label="WhatsApp">↗</ShareIcon>
    </div>
  );
}

function ShareIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Share on ${label}`}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  );
}
