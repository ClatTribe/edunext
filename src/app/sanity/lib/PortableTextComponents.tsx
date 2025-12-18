// sanity/lib/PortableTextComponents.tsx
import { PortableTextComponents } from '@portabletext/react';

export const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    h1: ({ children }) => <h1 className="text-4xl font-bold mb-6 mt-8">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-bold mb-5 mt-7">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-bold mb-4 mt-6">{children}</h3>,
    h4: ({ children }) => <h4 className="text-xl font-bold mb-3 mt-5">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
        {children}
      </blockquote>
    ),
  },
  
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside ml-6 mb-4 space-y-2">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside ml-6 mb-4 space-y-2">{children}</ol>
    ),
  },
  
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {children}
      </a>
    ),
  },
  
  types: {
    image: ({ value }) => (
      <figure className="my-6">
        <img
          src={value?.asset?.url}
          alt={value?.alt || 'Blog image'}
          className="w-full rounded-lg"
        />
        {value?.caption && (
          <figcaption className="text-center text-sm text-gray-600 mt-2">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    
    // If you add table support in schema, add this:
    table: ({ value }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-gray-300">
          <tbody>
            {value?.rows?.map((row: any, i: number) => (
              <tr key={i} className={i === 0 ? 'bg-gray-100' : ''}>
                {row.cells?.map((cell: string, j: number) => (
                  <td key={j} className="border border-gray-300 px-4 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
};