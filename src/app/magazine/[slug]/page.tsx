/**
 * EduNext Magazine — article detail page (server component).
 *
 * Deploy to: src/app/magazine/[slug]/page.tsx
 *
 * Server responsibilities:
 *   - Fetch article + related from Supabase
 *   - Generate SEO metadata + canonical
 *   - Inject JSON-LD (Article + FAQPage)
 *   - Hand the data to <MagazineArticleView /> for client-side rendering
 *
 * The visual layout (Sidebar shell, hero, body, right rail) lives in
 * MagazineArticleView (client) so it can use DefaultLayout (which depends
 * on AuthContext).
 */

export const dynamic = 'force-dynamic';
export const revalidate = 600;

import {
  getMagazineBySlug,
  getRelatedMagazine,
} from '../../lib/magazine';
import { notFound } from 'next/navigation';
import MagazineArticleView from './MagazineArticleView';

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

  const related = await getRelatedMagazine(article.category, article.slug, 4);

  // JSON-LD structured data
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
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.getedunext.com/logo.png',
      },
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
      <MagazineArticleView
        article={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          summary: article.summary,
          magazine_subtitle: article.magazine_subtitle,
          content: article.content,
          category: article.category,
          tags: article.tags || [],
          hero_image: article.hero_image,
          read_time: article.read_time,
          author_name: article.author_name,
          toc: article.toc || [],
          faqs: article.faqs || [],
          published_at: article.published_at,
        }}
        related={related.map((r) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          category: r.category,
        }))}
      />
    </>
  );
}
