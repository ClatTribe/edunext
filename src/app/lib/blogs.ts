import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

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

// Configure marked for better table support
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown (tables)
  breaks: true,
});

export function getAllBlogSlugs() {
  const fileNames = fs.readdirSync(blogsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => ({
      slug: fileName.replace(/\.md$/, ''),
    }));
}

export async function getBlogBySlug(slug: string): Promise<BlogPost> {
  const fullPath = path.join(blogsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  // Convert markdown to HTML using marked
  const contentHtml = marked(content);

  return {
    slug,
    content: contentHtml as string,
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString(),
    author: data.author,
    excerpt: data.excerpt,
    coverImage: data.coverImage,
    tags: data.tags || [],
  };
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  const slugs = getAllBlogSlugs();
  const blogs = await Promise.all(
    slugs.map(({ slug }) => getBlogBySlug(slug))
  );

  return blogs.sort((a, b) => (a.date > b.date ? -1 : 1));
}