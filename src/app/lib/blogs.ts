import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { cache } from 'react'; // Optional: Use for App Router performance

const blogsDirectory = path.join(process.cwd(), 'content/blogs');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  content: string;
}

// Wrapping with cache prevents redundant file reads if the same 
// slug is requested in generateMetadata and the Page component.
export const getBlogBySlug = cache(async (slug: string): Promise<BlogPost> => {
  const fullPath = path.join(blogsDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Blog post not found: ${slug}`);
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Process markdown to HTML
  const processedContent = await remark()
    .use(remarkGfm)
    .use(html)
    .process(content);
    
  const contentHtml = processedContent.toString();

  return {
    slug,
    content: contentHtml,
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString(),
    author: data.author,
    excerpt: data.excerpt,
    coverImage: data.coverImage,
    tags: data.tags || [],
  };
});

export function getAllBlogSlugs() {
  if (!fs.existsSync(blogsDirectory)) return [];
  const fileNames = fs.readdirSync(blogsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => ({ slug: fileName.replace(/\.md$/, '') }));
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  const slugs = getAllBlogSlugs();
  const blogs = await Promise.all(
    slugs.map(({ slug }) => getBlogBySlug(slug))
  );
  
  // Sorts by date descending (Newest first)
  return blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
