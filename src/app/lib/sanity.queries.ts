import { groq } from "next-sanity";

// Get all blog posts
export const postsQuery = groq`*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  mainImage,
  publishedAt,
  excerpt,
  author->{
    name,
    image
  }
}`;

// Get single blog post by slug
export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  mainImage,
  publishedAt,
  excerpt,
  body,
  author->{
    name,
    image
  }
}`;