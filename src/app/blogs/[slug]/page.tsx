import { client } from '../../sanity/lib/client';
import { PortableText } from '@portabletext/react';
import { notFound } from 'next/navigation';
import { urlForImage } from '../../sanity/lib/image';

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  content: any[];
  publishedAt?: string;
}

const components = {
  types: {
    table: ({ value }: { value: any }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border border-gray-300">
          <tbody>
            {value.rows.map((row: any, i: number) => (
              <tr key={i} className="border-b">
                {row.cells.map((cell: string, j: number) => (
                  <td key={j} className="p-3 border-r border-gray-300">
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
        <div className="my-6">
          <img
            src={urlForImage(value).url()}
            alt={value.alt || 'Blog image'}
            className="rounded-lg w-full"
          />
          {value.alt && (
            <p className="text-sm text-gray-500 text-center mt-2">{value.alt}</p>
          )}
        </div>
      );
    },
  },
  block: {
    h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>,
    normal: ({ children }: any) => <p className="mb-4 leading-relaxed">{children}</p>,
  },
  marks: {
    link: ({ children, value }: any) => (
      <a href={value.href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
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

// CRITICAL FIX: Await params in Next.js 15+
export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params; // <-- THIS IS THE FIX
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-extrabold mb-2">{post.title}</h1>
      
      {post.publishedAt && (
        <p className="text-gray-500 mb-6">
          Published on {new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      )}
      
      <div className="prose prose-lg max-w-none">
        <PortableText value={post.content} components={components} />
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  const posts = await client.fetch(`*[_type == "post"]{ slug }`);
  return posts.map((post: any) => ({
    slug: post.slug.current,
  }));
}