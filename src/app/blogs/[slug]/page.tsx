export const revalidate = 0;
import { client } from '../../sanity/lib/client';
import { PortableText } from '@portabletext/react';
import { notFound } from 'next/navigation';
import { urlForImage } from '../../sanity/lib/image';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  content: any[];
  publishedAt?: string;
}

const accentColor = '#F59E0B';
const primaryBg = '#050818';
const secondaryBg = '#0F172B';
const borderColor = 'rgba(245, 158, 11, 0.15)';

const components = {
  types: {
    table: ({ value }: { value: any }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full rounded-lg overflow-hidden" style={{ border: `1px solid ${borderColor}` }}>
          <tbody>
            {value.rows.map((row: any, i: number) => (
              <tr key={i} style={{ borderBottom: `1px solid ${borderColor}` }}>
                {row.cells.map((cell: string, j: number) => (
                  <td key={j} className="p-3 text-slate-300" style={{ borderRight: `1px solid ${borderColor}` }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    image: ({ value }: { value: any }) => {
      if (!value?.asset?._ref) return null;
      return (
        <div className="my-8">
          <img
            src={urlForImage(value).url()}
            alt={value.alt || 'Blog image'}
            className="rounded-xl w-full shadow-2xl"
            style={{ border: `1px solid ${borderColor}` }}
          />
          {value.alt && (
            <p className="text-sm text-slate-500 text-center mt-3">{value.alt}</p>
          )}
        </div>
      );
    },
  },
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-3xl md:text-4xl font-bold mt-8 mb-4 text-white">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl md:text-3xl font-bold mt-6 mb-3 text-white">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl md:text-2xl font-bold mt-4 mb-2 text-white">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="mb-4 leading-relaxed text-slate-300">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote 
        className="pl-6 italic my-6 text-slate-400 rounded-r-lg py-4"
        style={{ 
          borderLeft: `4px solid ${accentColor}`,
          backgroundColor: 'rgba(245, 158, 11, 0.05)'
        }}
      >
        {children}
      </blockquote>
    ),
  },
  
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-slate-300">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 text-slate-300">
        {children}
      </ol>
    ),
  },
  
  listItem: {
    bullet: ({ children }: any) => (
      <li className="leading-relaxed text-slate-300">
        {children}
      </li>
    ),
    number: ({ children }: any) => (
      <li className="leading-relaxed text-slate-300">
        {children}
      </li>
    ),
  },
  
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold text-white">
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-slate-300">
        {children}
      </em>
    ),
    code: ({ children }: any) => (
      <code 
        className="px-2 py-1 rounded text-sm font-mono"
        style={{ 
          backgroundColor: secondaryBg,
          color: accentColor,
          border: `1px solid ${borderColor}`
        }}
      >
        {children}
      </code>
    ),
    link: ({ children, value }: any) => (
      <a 
        href={value.href}
        className="hover:underline transition-all font-medium"
        style={{ color: accentColor }}
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
};

async function getPost(slug: string): Promise<Post | null> {
  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      content,
      publishedAt
    }`,
    { slug }
  );
  return post;
}

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div 
      className="min-h-screen w-full"
      style={{ backgroundColor: primaryBg }}
    >
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        {/* Back Button */}
        <Link 
          href="/blogs"
          className="inline-flex items-center gap-2 mb-8 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to all posts</span>
        </Link>

        {/* Post Header */}
        <div 
          className="rounded-2xl shadow-xl p-8 md:p-10 mb-8 backdrop-blur-xl"
          style={{ 
            backgroundColor: secondaryBg,
            border: `1px solid ${borderColor}`
          }}
        >
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-white">
            {post.title}
          </h1>
          
          {post.publishedAt && (
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={18} />
              <p>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
        
        {/* Post Content */}
        <div 
          className="rounded-2xl shadow-xl p-8 md:p-10 backdrop-blur-xl"
          style={{ 
            backgroundColor: secondaryBg,
            border: `1px solid ${borderColor}`
          }}
        >
          <div className="prose prose-lg max-w-none">
            <PortableText value={post.content} components={components} />
          </div>
        </div>
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  const posts = await client.fetch(`*[_type == "post"]{ slug }`);
  return posts.map((post: any) => ({
    slug: post.slug.current,
  }));
}