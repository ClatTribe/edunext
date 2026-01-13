import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { cache } from 'react';

const blogsDirectory = path.join(process.cwd(), 'content/blogs');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  lastModified?: string;
  author?: string;
  excerpt?: string;
  coverImage?: string;
  audioUrl?: string; // ADDED: For audio file support
  tags?: string[];
  content: string;
}

export const getBlogBySlug = cache(async (slug: string): Promise<BlogPost> => {
  const fullPath = path.join(blogsDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Blog post not found: ${slug}`);
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

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
    lastModified: data.lastModified,
    author: data.author,
    excerpt: data.excerpt,
    coverImage: data.coverImage,
    audioUrl: data.audioUrl, // ADDED: Extracts audioUrl from Markdown YAML
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
  
  return blogs.sort((a, b) => {
    const timeA = new Date(a.date || 0).getTime();
    const timeB = new Date(b.date || 0).getTime();
    return timeB - timeA;
  });
}